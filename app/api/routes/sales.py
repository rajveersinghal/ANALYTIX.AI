# app/api/routes/sales.py
"""
Sales Intelligence API Router
Provides a fast path for sales-specific analysis:
  POST /sales/analyze          — upload + analyze in one shot
  GET  /sales/forecast/{id}    — get forecast for an already-analyzed file
  GET  /sales/sample           — returns sample sales CSV for demo
"""
import os
import json
import uuid
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.auth.security import get_current_user
from app.services.sales_intelligence_service import SalesIntelligenceService
from app.services.forecasting_service import ForecastingService
from app.utils.response_schema import success_response, error_response
from app.config import settings
from app.logger import logger

router = APIRouter(prefix="/sales", tags=["Sales Intelligence"])

sales_service    = SalesIntelligenceService()
forecast_service = ForecastingService()

# In-memory cache to share results between /analyze and /forecast
# (keyed by file_id, value: the full analysis dict)
_result_cache: dict = {}

SAMPLE_FILE_NAME = "sample_sales.csv"
SAMPLE_FILE_PATH = os.path.join(settings.STORAGE_DIR, SAMPLE_FILE_NAME)


# ─── helper ──────────────────────────────────────────────────────────────

def _ensure_sample_data():
    """Generate sample Indian e-commerce sales CSV if it doesn't exist."""
    if os.path.exists(SAMPLE_FILE_PATH):
        return

    import random
    from datetime import date, timedelta

    random.seed(42)
    products = [
        "Wireless Earbuds", "Smart Watch", "Phone Case", "USB-C Cable",
        "Portable Charger", "Screen Protector", "Laptop Stand", "Webcam",
        "Keyboard", "Mouse Pad"
    ]
    regions = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Hyderabad", "Pune", "Kolkata"]
    
    rows = []
    start = date(2024, 1, 1)
    for i in range(800):
        d          = start + timedelta(days=random.randint(0, 365))
        product    = random.choices(products, weights=[30,20,15,12,10,8,6,5,5,4])[0]
        region     = random.choices(regions, weights=[25,22,18,12,10,8,5])[0]
        qty        = random.randint(1, 10)
        base_price = {
            "Wireless Earbuds": 1299, "Smart Watch": 2499, "Phone Case": 299,
            "USB-C Cable": 199, "Portable Charger": 899, "Screen Protector": 149,
            "Laptop Stand": 799, "Webcam": 1499, "Keyboard": 999, "Mouse Pad": 249
        }[product]
        discount   = random.uniform(0, 0.25)
        price      = round(base_price * (1 - discount), 2)
        revenue    = round(price * qty, 2)
        rows.append({
            "date": d.strftime("%Y-%m-%d"),
            "product": product,
            "category": "Electronics",
            "region": region,
            "quantity": qty,
            "unit_price": price,
            "revenue": revenue,
            "channel": random.choice(["Online", "Offline"])
        })

    df = pd.DataFrame(rows)
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    df.to_csv(SAMPLE_FILE_PATH, index=False)
    logger.info(f"[Sales] Sample dataset created at {SAMPLE_FILE_PATH}")


# ─── routes ──────────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_sales(
    file: UploadFile = File(...),
    project_id: str = None,
    current_user: dict = Depends(get_current_user),
):
    """Upload a CSV/Excel file and get instant sales intelligence."""
    user_id = str(current_user["_id"])
    result  = await sales_service.analyze_dataset(file, user_id, project_id=project_id)

    if result.get("status") == "error":
        return error_response(result.get("message", "Analysis failed"))

    # Cache result by file_id for downstream calls (forecast)
    file_id = result.get("file_id")
    if file_id:
        _result_cache[file_id] = result

    return success_response(data=result)


@router.get("/sample")
async def analyze_sample(
    project_id: str = None,
    current_user: dict = Depends(get_current_user),
):
    """Run analysis on the built-in sample sales dataset (for demo/onboarding)."""
    _ensure_sample_data()
    user_id = str(current_user["_id"])
    file_id = "sample-demo"

    # Serve from cache if already computed and project matches (simplified: just re-run if project is provided)
    if not project_id and file_id in _result_cache:
        return success_response(data=_result_cache[file_id])

    result = await sales_service.analyze_from_path(
        SAMPLE_FILE_PATH, file_id, SAMPLE_FILE_NAME, user_id, project_id=project_id
    )

    if result.get("status") == "error":
        return error_response(result.get("message", "Sample analysis failed"))

    _result_cache[file_id] = result
    return success_response(data=result)


@router.get("/forecast/{file_id}")
async def get_forecast(
    file_id: str,
    periods: int = 3,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate a multi-period sales forecast for an analysis that was already run.
    Uses the file_id returned by /analyze.
    periods: number of months to forecast ahead (default 3, max 12)
    """
    periods = min(max(periods, 1), 12)
    
    cached = _result_cache.get(file_id)
    if not cached:
        # Try to reload sample
        if file_id == "sample-demo":
            _ensure_sample_data()
            user_id = str(current_user["_id"])
            cached = await sales_service.analyze_from_path(
                SAMPLE_FILE_PATH, file_id, SAMPLE_FILE_NAME, user_id
            )
            _result_cache[file_id] = cached
        else:
            raise HTTPException(status_code=404, detail="Analysis session not found. Please re-upload the file.")

    # Locate the saved file
    date_col = cached.get("detected_columns", {}).get("date")
    rev_col  = cached.get("detected_columns", {}).get("revenue")

    if not date_col or not rev_col:
        return error_response("Cannot forecast: date or revenue column not detected.")

    # Rebuild monthly trend from cached data
    trend = cached.get("monthly_trend", [])
    if not trend:
        return error_response("Not enough time-series data to forecast.")

    # Reconstruct a simple DataFrame from the cached monthly trend for forecasting
    monthly_df = pd.DataFrame(trend)
    monthly_df["date"]    = pd.to_datetime(monthly_df["month"] + "-01")
    monthly_df["revenue"] = monthly_df["revenue"].astype(float)

    result = await forecast_service.forecast(
        df      = monthly_df,
        date_col= "date",
        rev_col = "revenue",
        periods = periods,
    )
    return success_response(data=result)
