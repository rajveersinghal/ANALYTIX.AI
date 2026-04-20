# app/services/forecasting_service.py
"""
Forecasting Service — Phase 3 AI Enhancement
Uses statsmodels SimpleExpSmoothing as the primary forecaster (no extra install needed).
Falls back to a naive moving-average if data is too sparse.
If Prophet is installed, it will be upgraded automatically.
"""
import asyncio
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional
from app.logger import logger


def _try_prophet(monthly: pd.DataFrame, periods: int) -> Optional[List[Dict]]:
    """Attempt Prophet forecast. Returns None if Prophet not installed."""
    try:
        from prophet import Prophet  # type: ignore
        prophet_df = monthly.rename(columns={"month_dt": "ds", "revenue": "y"})
        m = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
        m.fit(prophet_df)
        future = m.make_future_dataframe(periods=periods, freq="MS")
        forecast = m.predict(future)
        tail = forecast.tail(periods)[["ds", "yhat", "yhat_lower", "yhat_upper"]]
        result = []
        for _, row in tail.iterrows():
            result.append({
                "month":      row["ds"].strftime("%Y-%m"),
                "predicted":  round(float(row["yhat"]), 2),
                "lower":      round(float(max(row["yhat_lower"], 0)), 2),
                "upper":      round(float(row["yhat_upper"]), 2),
                "is_forecast": True,
            })
        return result
    except ImportError:
        return None
    except Exception as e:
        logger.warning(f"[Forecast] Prophet failed: {e}")
        return None


def _statsmodels_forecast(monthly: pd.DataFrame, periods: int) -> List[Dict]:
    """Use Exponential Smoothing from statsmodels."""
    try:
        from statsmodels.tsa.holtwinters import SimpleExpSmoothing  # type: ignore
        series = monthly["revenue"].values.astype(float)
        if len(series) < 3:
            raise ValueError("Not enough data for exponential smoothing")
        model = SimpleExpSmoothing(series, initialization_method="estimated")
        fitted = model.fit(optimized=True)
        forecast_values = fitted.forecast(steps=periods)

        last_date = monthly["month_dt"].max()
        result = []
        for i, val in enumerate(forecast_values):
            month = (last_date + pd.DateOffset(months=i + 1)).strftime("%Y-%m")
            # Simple ±10% confidence band
            margin = abs(val) * 0.10
            result.append({
                "month":      month,
                "predicted":  round(float(max(val, 0)), 2),
                "lower":      round(float(max(val - margin, 0)), 2),
                "upper":      round(float(val + margin), 2),
                "is_forecast": True,
            })
        return result
    except Exception as e:
        logger.warning(f"[Forecast] statsmodels failed: {e}")
        return []


def _naive_forecast(monthly: pd.DataFrame, periods: int) -> List[Dict]:
    """Naive 3-period moving average forecast."""
    series = monthly["revenue"].values.astype(float)
    avg = float(np.mean(series[-3:])) if len(series) >= 3 else float(np.mean(series))
    last_date = monthly["month_dt"].max()
    result = []
    for i in range(periods):
        month = (last_date + pd.DateOffset(months=i + 1)).strftime("%Y-%m")
        margin = avg * 0.12
        result.append({
            "month":      month,
            "predicted":  round(avg, 2),
            "lower":      round(max(avg - margin, 0), 2),
            "upper":      round(avg + margin, 2),
            "is_forecast": True,
        })
    return result


def _build_monthly_series(df: pd.DataFrame, date_col: str, rev_col: str) -> Optional[pd.DataFrame]:
    """Build a clean monthly aggregated DataFrame."""
    try:
        temp = df.copy()
        temp["_date"] = pd.to_datetime(temp[date_col], infer_datetime_format=True, errors="coerce")
        temp = temp.dropna(subset=["_date"])
        temp["_month"] = temp["_date"].dt.to_period("M")
        monthly = (
            temp.groupby("_month")[rev_col]
            .sum()
            .reset_index()
            .rename(columns={"_month": "period", rev_col: "revenue"})
            .sort_values("period")
        )
        monthly["month_dt"] = monthly["period"].dt.to_timestamp()
        monthly["month"]    = monthly["month_dt"].dt.strftime("%Y-%m")
        return monthly[["month", "month_dt", "revenue"]]
    except Exception as e:
        logger.warning(f"[Forecast] Monthly build failed: {e}")
        return None


class ForecastingService:
    async def forecast(
        self,
        df: pd.DataFrame,
        date_col: str,
        rev_col: str,
        periods: int = 3,
    ) -> Dict[str, Any]:
        return await asyncio.to_thread(
            self._forecast_sync, df, date_col, rev_col, periods
        )

    def _forecast_sync(
        self,
        df: pd.DataFrame,
        date_col: str,
        rev_col: str,
        periods: int,
    ) -> Dict[str, Any]:
        monthly = _build_monthly_series(df, date_col, rev_col)
        if monthly is None or len(monthly) < 2:
            return {"status": "error", "message": "Not enough time-series data to forecast. Need at least 2 months."}

        # Historical series for the chart
        historical = [
            {"month": row["month"], "revenue": round(float(row["revenue"]), 2), "is_forecast": False}
            for _, row in monthly.iterrows()
        ]

        # Try Prophet → statsmodels → naive
        forecast = _try_prophet(monthly, periods)
        method = "Prophet"

        if forecast is None:
            forecast = _statsmodels_forecast(monthly, periods)
            method = "Exponential Smoothing"

        if not forecast:
            forecast = _naive_forecast(monthly, periods)
            method = "Moving Average"

        # Risk alert: if predicted next month < 90% of this month
        risk_alert = None
        if historical and forecast:
            last_actual    = historical[-1]["revenue"]
            next_predicted = forecast[0]["predicted"]
            if next_predicted < last_actual * 0.90:
                drop_pct = round((1 - next_predicted / max(last_actual, 1)) * 100, 1)
                risk_alert = {
                    "type":    "warning",
                    "message": f"⚠️ Sales forecast shows a potential {drop_pct}% drop next month. Consider running a promotional campaign now."
                }
            elif next_predicted > last_actual * 1.15:
                risk_alert = {
                    "type":    "success",
                    "message": f"🚀 Strong growth predicted next month. Ensure stock and fulfillment can handle the demand."
                }

        return {
            "status":     "success",
            "method":     method,
            "periods":    periods,
            "historical": historical,
            "forecast":   forecast,
            "risk_alert": risk_alert,
        }
