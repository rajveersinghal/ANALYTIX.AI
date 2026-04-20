# app/services/sales_intelligence_service.py
"""
Sales Intelligence Service — AnalytixAI Phase 1 MVP
Wraps the raw dataset into a fast sales-specific insight engine.
Auto-detects date, revenue, product, region columns and computes:
  - KPIs (Total Revenue, MoM Change, Avg Order Value, Units Sold)
  - Monthly trend series
  - Top/Bottom products ranking
  - Region performance table
  - Plain-English business playbook (3-7 recommendations)
"""
import os
import uuid
import shutil
import asyncio
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from fastapi import UploadFile
from typing import Dict, Any, List, Optional, Tuple

from app.config import settings
from app.logger import logger
from app.utils.metadata_manager import MetadataManager


# ─────────────────────────── column detector ────────────────────────────

DATE_HINTS    = ["date", "day", "month", "year", "period", "week", "time", "dt"]
REVENUE_HINTS = ["revenue", "sales", "amount", "total", "price", "income", "value",
                  "gmv", "turnover", "receipts", "earning", "profit"]
PRODUCT_HINTS = ["product", "item", "sku", "category", "name", "goods", "brand",
                  "description", "title"]
REGION_HINTS  = ["region", "city", "state", "zone", "area", "location", "country",
                  "territory", "district", "store", "branch"]
QTY_HINTS     = ["qty", "quantity", "units", "count", "volume", "sold", "pieces"]


def _match_hints(col: str, hints: List[str]) -> bool:
    c = col.lower().replace("_", " ").replace("-", " ")
    return any(h in c for h in hints)


def detect_columns(df: pd.DataFrame) -> Dict[str, Optional[str]]:
    """Returns the best-guess column for each sales dimension."""
    cols = list(df.columns)

    def best(hints):
        for c in cols:
            if _match_hints(c, hints):
                return c
        return None

    date_col    = best(DATE_HINTS)
    revenue_col = best(REVENUE_HINTS)
    product_col = best(PRODUCT_HINTS)
    region_col  = best(REGION_HINTS)
    qty_col     = best(QTY_HINTS)

    # Fallback: pick first numeric column as revenue if nothing found
    if not revenue_col:
        num_cols = df.select_dtypes(include="number").columns.tolist()
        revenue_col = num_cols[0] if num_cols else None

    return {
        "date":    date_col,
        "revenue": revenue_col,
        "product": product_col,
        "region":  region_col,
        "qty":     qty_col,
    }


# ─────────────────────────── KPI calculator ─────────────────────────────

def compute_kpis(df: pd.DataFrame, cols: Dict) -> Dict[str, Any]:
    rev  = cols["revenue"]
    date = cols["date"]
    qty  = cols["qty"]

    total_revenue = float(df[rev].sum()) if rev else 0.0
    total_units   = float(df[qty].sum()) if qty else float(len(df))
    avg_order     = total_revenue / max(len(df), 1)

    mom_change    = None
    mom_label     = "N/A"

    if date and rev:
        try:
            temp = df.copy()
            temp["_date"] = pd.to_datetime(temp[date], infer_datetime_format=True, errors="coerce")
            temp = temp.dropna(subset=["_date"])
            temp["_month"] = temp["_date"].dt.to_period("M")
            monthly = temp.groupby("_month")[rev].sum().sort_index()
            if len(monthly) >= 2:
                prev = float(monthly.iloc[-2])
                curr = float(monthly.iloc[-1])
                mom_change = ((curr - prev) / max(abs(prev), 1)) * 100
                direction  = "▲" if mom_change >= 0 else "▼"
                mom_label  = f"{direction} {abs(mom_change):.1f}% vs last month"
        except Exception as e:
            logger.warning(f"MoM calculation failed: {e}")

    return {
        "total_revenue":  round(total_revenue, 2),
        "total_units":    round(total_units, 2),
        "avg_order_value": round(avg_order, 2),
        "total_transactions": len(df),
        "mom_change_pct":  round(mom_change, 2) if mom_change is not None else None,
        "mom_label":       mom_label,
    }


# ─────────────────────────── trend builder ──────────────────────────────

def compute_monthly_trend(df: pd.DataFrame, cols: Dict) -> List[Dict]:
    """Returns [{month, revenue, units}] sorted chronologically."""
    date = cols["date"]
    rev  = cols["revenue"]
    qty  = cols["qty"]

    if not (date and rev):
        return []

    try:
        temp = df.copy()
        temp["_date"] = pd.to_datetime(temp[date], infer_datetime_format=True, errors="coerce")
        temp = temp.dropna(subset=["_date"])
        temp["_month"] = temp["_date"].dt.to_period("M")

        agg = {rev: "sum"}
        if qty:
            agg[qty] = "sum"

        monthly = temp.groupby("_month").agg(agg).reset_index()
        monthly = monthly.sort_values("_month")

        result = []
        for _, row in monthly.iterrows():
            entry = {
                "month":   str(row["_month"]),
                "revenue": round(float(row[rev]), 2),
            }
            if qty:
                entry["units"] = int(row[qty])
            result.append(entry)

        return result
    except Exception as e:
        logger.warning(f"Monthly trend failed: {e}")
        return []


# ─────────────────────────── product ranking ────────────────────────────

def compute_top_products(df: pd.DataFrame, cols: Dict, top_n: int = 7) -> Dict:
    product = cols["product"]
    rev     = cols["revenue"]

    if not (product and rev):
        return {"top": [], "bottom": []}

    try:
        grouped = (
            df.groupby(product)[rev]
            .sum()
            .reset_index()
            .rename(columns={product: "product", rev: "revenue"})
            .sort_values("revenue", ascending=False)
        )
        grouped["revenue"] = grouped["revenue"].round(2)

        top    = grouped.head(top_n).to_dict("records")
        bottom = grouped.tail(min(3, len(grouped))).to_dict("records")

        # revenue share %
        total = grouped["revenue"].sum()
        top3_share = (grouped.head(3)["revenue"].sum() / max(total, 1)) * 100

        return {
            "top":          top,
            "bottom":       bottom,
            "top3_share_pct": round(top3_share, 1),
        }
    except Exception as e:
        logger.warning(f"Product ranking failed: {e}")
        return {"top": [], "bottom": []}


# ─────────────────────────── region table ───────────────────────────────

def compute_region_performance(df: pd.DataFrame, cols: Dict) -> List[Dict]:
    region = cols["region"]
    rev    = cols["revenue"]

    if not (region and rev):
        return []

    try:
        grouped = (
            df.groupby(region)[rev]
            .sum()
            .reset_index()
            .rename(columns={region: "region", rev: "revenue"})
            .sort_values("revenue", ascending=False)
        )
        total = grouped["revenue"].sum()
        grouped["share_pct"] = ((grouped["revenue"] / max(total, 1)) * 100).round(1)
        grouped["revenue"]   = grouped["revenue"].round(2)

        return grouped.to_dict("records")
    except Exception as e:
        logger.warning(f"Region performance failed: {e}")
        return []


# ─────────────────────────── playbook engine ────────────────────────────

def generate_playbook(
    kpis: Dict,
    top_products: Dict,
    region_data: List[Dict],
    trend: List[Dict],
    cols: Dict,
) -> List[Dict]:
    """
    Generates 4-8 plain-English, numbered business recommendations.
    Each has: id, icon, headline, detail, priority (high/medium/low).
    """
    plays = []

    # 1. Revenue trend insight
    mom = kpis.get("mom_change_pct")
    if mom is not None:
        if mom < -10:
            plays.append({
                "id": 1, "icon": "🚨", "priority": "high",
                "headline": f"Revenue Alert: Sales dropped {abs(mom):.1f}% last month",
                "detail":   "Investigate pricing changes, stockouts, or market shifts immediately. Compare this period's orders against the previous month at the product level."
            })
        elif mom < 0:
            plays.append({
                "id": 1, "icon": "⚠️", "priority": "medium",
                "headline": f"Slight dip: Revenue down {abs(mom):.1f}% vs last month",
                "detail":   "Check if this is seasonal. If not, consider a targeted promotion on your top-3 products to stimulate demand."
            })
        elif mom > 15:
            plays.append({
                "id": 1, "icon": "🚀", "priority": "medium",
                "headline": f"Strong growth: Revenue up {mom:.1f}% — Identify the driver",
                "detail":   "Dig into which product, region, or channel drove this spike. Double down on that channel to sustain momentum."
            })
        else:
            plays.append({
                "id": 1, "icon": "📈", "priority": "low",
                "headline": f"Steady growth: {mom:.1f}% MoM — Keep the engine running",
                "detail":   "Performance is stable. Focus on retaining top customers and expanding to adjacent regions."
            })

    # 2. Top product concentration risk
    top3_pct = top_products.get("top3_share_pct", 0)
    if top3_pct > 60 and top_products["top"]:
        top_name = top_products["top"][0].get("product", "your #1 product")
        plays.append({
            "id": 2, "icon": "🎯", "priority": "high",
            "headline": f"Concentration risk: Top 3 products drive {top3_pct}% of revenue",
            "detail":   f"Over-reliance on '{top_name}' is risky. Invest marketing budget into your 4th and 5th products to diversify your revenue base."
        })
    elif top_products["top"]:
        top_name = top_products["top"][0].get("product", "your top product")
        plays.append({
            "id": 2, "icon": "⭐", "priority": "low",
            "headline": f"Scale your winner: '{top_name}' is your highest-revenue product",
            "detail":   "Consider bundling it with lower-performing items, or creating upsell opportunities to increase average order value."
        })

    # 3. Bottom product alert
    if top_products.get("bottom"):
        worst = top_products["bottom"][0].get("product", "underperforming products")
        plays.append({
            "id": 3, "icon": "📦", "priority": "medium",
            "headline": f"Underperformer alert: Review '{worst}'",
            "detail":   "Low-revenue products tie up capital and shelf space. Run a clearance promotion, repackage, or consider discontinuing them."
        })

    # 4. Regional expansion opportunity
    if len(region_data) >= 2:
        best_region  = region_data[0].get("region", "your top region")
        worst_region = region_data[-1].get("region", "your weakest region")
        plays.append({
            "id": 4, "icon": "🗺️", "priority": "medium",
            "headline": f"Regional gap: '{best_region}' outperforms '{worst_region}'",
            "detail":   f"Analyze what's working in '{best_region}' — channels, pricing, promotions — and replicate the strategy in '{worst_region}'."
        })

    # 5. AOV optimization
    aov = kpis.get("avg_order_value", 0)
    if aov > 0:
        plays.append({
            "id": 5, "icon": "💡", "priority": "low",
            "headline": f"Grow your basket size: Average order is ₹{aov:,.0f}",
            "detail":   "Introduce a 'buy 2 get 10% off' offer or recommend complementary products at checkout to increase AOV by 15-20%."
        })

    # 6. Trend anomaly
    if len(trend) >= 3:
        revenues = [t["revenue"] for t in trend]
        avg_rev  = np.mean(revenues[:-1])
        last_rev = revenues[-1]
        if last_rev < avg_rev * 0.7:
            plays.append({
                "id": 6, "icon": "⚡", "priority": "high",
                "headline": "Last month is significantly below your historical average",
                "detail":   "This is a critical signal. Run a customer re-engagement campaign (email/WhatsApp) targeting customers who haven't purchased in 30+ days."
            })

    return plays[:7]  # Limit to 7


# ─────────────────────────── main service class ─────────────────────────

class SalesIntelligenceService:

    async def analyze_dataset(
        self,
        file: UploadFile,
        user_id: str,
        project_id: str = None,
    ) -> Dict[str, Any]:
        """
        Full analysis flow:
        1. Save uploaded file
        2. Load into pandas
        3. Detect columns
        4. Compute KPIs + trend + products + regions
        5. Generate playbook
        6. Return structured result
        """
        logger.info(f"[Sales] Starting analysis for user {user_id}, file: {file.filename}")

        # 1. Save file
        if not file.filename.endswith((".csv", ".xlsx")):
            return {"status": "error", "message": "Only CSV and Excel files are supported."}

        file_id  = str(uuid.uuid4())
        ext      = os.path.splitext(file.filename)[1]
        save_dir = settings.DATASET_DIR
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, f"sales_{file_id}{ext}")

        with open(save_path, "wb") as buf:
            shutil.copyfileobj(file.file, buf)

        # 2. Load
        try:
            if ext == ".csv":
                df = pd.read_csv(save_path)
            else:
                df = pd.read_excel(save_path)
        except Exception as e:
            logger.error(f"[Sales] Failed to read file: {e}")
            return {"status": "error", "message": f"Could not read the file: {e}"}

        if df.empty:
            return {"status": "error", "message": "The uploaded file is empty."}

        logger.info(f"[Sales] Loaded {len(df)} rows, {len(df.columns)} cols")

        # 3-6. Compute everything in thread pool (non-blocking)
        result = await asyncio.to_thread(self._compute_all, df, file_id, file.filename, user_id)
        
        # 7. Persistence - Save as a session for the Archive/History
        try:
            mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
            full_meta = await mm.load()
            full_meta.update(result)
            full_meta["task_type"] = "sales"
            full_meta["pipeline_phase"] = "completed"
            await mm.save(full_meta)
            logger.info(f"[Sales] Session {file_id} persisted in MongoDB for project {project_id}.")
        except Exception as e:
            logger.error(f"[Sales] Persistence failed: {e}")

        return result

    def _compute_all(
        self, df: pd.DataFrame, file_id: str, filename: str, user_id: str
    ) -> Dict[str, Any]:
        cols          = detect_columns(df)
        kpis          = compute_kpis(df, cols)
        trend         = compute_monthly_trend(df, cols)
        top_products  = compute_top_products(df, cols)
        region_data   = compute_region_performance(df, cols)
        playbook      = generate_playbook(kpis, top_products, region_data, trend, cols)

        # Data health summary
        null_pct  = round((df.isnull().sum().sum() / max(df.size, 1)) * 100, 1)
        row_count = len(df)
        col_count = len(df.columns)

        return {
            "status":      "success",
            "file_id":     file_id,
            "filename":    filename,
            "user_id":     user_id,
            "analyzed_at": datetime.utcnow().isoformat(),
            "detected_columns": cols,
            "data_health": {
                "rows":        row_count,
                "columns":     col_count,
                "null_pct":    null_pct,
                "quality":     "Good" if null_pct < 5 else "Fair" if null_pct < 20 else "Poor",
            },
            "kpis":          kpis,
            "monthly_trend": trend,
            "top_products":  top_products,
            "region_data":   region_data,
            "playbook":      playbook,
            "column_names":  list(df.columns),
        }

    async def analyze_from_path(
        self, filepath: str, file_id: str, filename: str, user_id: str, project_id: str = None
    ) -> Dict[str, Any]:
        """Analyze an already-saved file (used by the sample data endpoint)."""
        try:
            if filepath.endswith(".csv"):
                df = pd.read_csv(filepath)
            else:
                df = pd.read_excel(filepath)
        except Exception as e:
            return {"status": "error", "message": str(e)}

        result = await asyncio.to_thread(self._compute_all, df, file_id, filename, user_id)
        
        # Persistence for samples
        try:
            mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
            full_meta = await mm.load()
            full_meta.update(result)
            full_meta["task_type"] = "sales"
            full_meta["pipeline_phase"] = "completed"
            await mm.save(full_meta)
        except Exception as e:
            logger.error(f"[Sales] Sample persistence failed: {e}")
            
        return result
