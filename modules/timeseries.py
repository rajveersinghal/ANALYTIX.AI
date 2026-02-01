from typing import Optional, Tuple, Dict, Any
import pandas as pd
import numpy as np
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf
import plotly.graph_objects as go
from modules.utils import Logger
import streamlit as st

def detect_timeseries(df: pd.DataFrame) -> Optional[str]:
    """
    Auto-detects if DataFrame contains time series data.
    
    Args:
        df: Input DataFrame.
        
    Returns:
        str: Name of datetime column if found, None otherwise.
    """
    # Check for datetime columns
    datetime_cols = df.select_dtypes(include=['datetime64']).columns
    if len(datetime_cols) > 0:
        return datetime_cols[0]
    
    # Check for columns that can be converted to datetime
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                pd.to_datetime(df[col], errors='raise')
                return col
            except:
                continue
    
    return None

def decompose_timeseries(series: pd.Series, period: int = 12, model: str = 'additive') -> Dict[str, pd.Series]:
    """
    Decomposes time series into trend, seasonal, and residual components.
    
    Args:
        series: Time series data.
        period: Seasonality period (e.g., 12 for monthly data).
        model: 'additive' or 'multiplicative'.
        
    Returns:
        Dictionary with 'trend', 'seasonal', 'residual' components.
    """
    try:
        decomposition = seasonal_decompose(series, model=model, period=period)
        
        Logger.log(f"📈 Time series decomposed ({model} model, period={period})")
        
        return {
            'trend': decomposition.trend,
            'seasonal': decomposition.seasonal,
            'residual': decomposition.resid,
            'observed': series
        }
    except Exception as e:
        Logger.log(f"❌ Decomposition failed: {str(e)}")
        return {}

def create_lag_features(df: pd.DataFrame, target_col: str, lags: list = [1, 7, 30]) -> pd.DataFrame:
    """
    Creates lagged features for time series forecasting.
    
    Args:
        df: Input DataFrame.
        target_col: Column to create lags for.
        lags: List of lag periods.
        
    Returns:
        DataFrame with lag features added.
    """
    df_new = df.copy()
    
    for lag in lags:
        df_new[f'{target_col}_lag_{lag}'] = df_new[target_col].shift(lag)
    
    # Drop rows with NaN (from shifting)
    df_new = df_new.dropna()
    
    Logger.log(f"⏰ Created {len(lags)} lag features for {target_col}")
    return df_new

def create_rolling_features(df: pd.DataFrame, target_col: str, windows: list = [7, 30]) -> pd.DataFrame:
    """
    Creates rolling statistics features.
    
    Args:
        df: Input DataFrame.
        target_col: Column to calculate rolling stats for.
        windows: List of window sizes.
        
    Returns:
        DataFrame with rolling features added.
    """
    df_new = df.copy()
    
    for window in windows:
        df_new[f'{target_col}_rolling_mean_{window}'] = df_new[target_col].rolling(window=window).mean()
        df_new[f'{target_col}_rolling_std_{window}'] = df_new[target_col].rolling(window=window).std()
    
    df_new = df_new.dropna()
    
    Logger.log(f"📊 Created rolling features (windows: {windows})")
    return df_new

def train_arima(series: pd.Series, order: Tuple[int, int, int] = (1, 1, 1), forecast_steps: int = 10) -> Dict[str, Any]:
    """
    Trains ARIMA model and generates forecasts.
    
    Args:
        series: Time series data.
        order: ARIMA (p, d, q) order.
        forecast_steps: Number of steps to forecast.
        
    Returns:
        Dictionary with model, forecast, and metrics.
    """
    try:
        model = ARIMA(series, order=order)
        fitted_model = model.fit()
        
        # Generate forecast
        forecast = fitted_model.forecast(steps=forecast_steps)
        
        # Get metrics
        aic = fitted_model.aic
        bic = fitted_model.bic
        
        Logger.log(f"📈 ARIMA{order} trained (AIC={aic:.2f}, BIC={bic:.2f})")
        
        return {
            'model': fitted_model,
            'forecast': forecast,
            'aic': aic,
            'bic': bic,
            'order': order
        }
    except Exception as e:
        Logger.log(f"❌ ARIMA training failed: {str(e)}")
        return {}

def plot_decomposition(components: Dict[str, pd.Series]):
    """
    Plots time series decomposition components.
    
    Args:
        components: Dictionary from decompose_timeseries().
    """
    from plotly.subplots import make_subplots
    
    fig = make_subplots(
        rows=4, cols=1,
        subplot_titles=['Observed', 'Trend', 'Seasonal', 'Residual'],
        vertical_spacing=0.05
    )
    
    for idx, (name, series) in enumerate(components.items(), 1):
        fig.add_trace(
            go.Scatter(x=series.index, y=series.values, name=name, line=dict(width=2)),
            row=idx, col=1
        )
    
    fig.update_layout(height=800, showlegend=False, title_text="Time Series Decomposition")
    st.plotly_chart(fig, use_container_width=True)

def auto_select_arima_order(series: pd.Series, max_p: int = 3, max_d: int = 2, max_q: int = 3) -> Tuple[int, int, int]:
    """
    Automatically selects best ARIMA order using AIC.
    
    Args:
        series: Time series data.
        max_p: Maximum AR order.
        max_d: Maximum differencing order.
        max_q: Maximum MA order.
        
    Returns:
        tuple: Best (p, d, q) order.
    """
    best_aic = np.inf
    best_order = (1, 1, 1)
    
    for p in range(max_p + 1):
        for d in range(max_d + 1):
            for q in range(max_q + 1):
                try:
                    model = ARIMA(series, order=(p, d, q))
                    fitted = model.fit()
                    if fitted.aic < best_aic:
                        best_aic = fitted.aic
                        best_order = (p, d, q)
                except:
                    continue
    
    Logger.log(f"🎯 Auto-selected ARIMA{best_order} (AIC={best_aic:.2f})")
    return best_order
