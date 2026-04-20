# app/core/modeling/problem_router.py
from app.logger import logger

DOMAIN_MAP = {
    "retail": "forecasting",       # Demand/Sales Forecasting
    "finance": "anomaly_detection", # Fraud/Risk Detection
    "real estate": "regression",    # Property Valuation / Price Prediction
    "healthcare": "classification", # Diagnosis/Churn
    "operations": "optimization"    # Logistics
}

def detect_problem_type(metadata: dict) -> str:
    """
    Dynamically maps business domains to mathematical tasks.
    Aligns with the 'Intelligent, Domain-Adaptive' system design.
    """
    # 1. User Explicit Selection (Priority)
    pt = metadata.get("task_type") or metadata.get("problem_type")
    if pt and pt != "unknown":
        return pt.lower()

    # 2. Domain-Aware Mapping
    domain = metadata.get("domain", "general").lower()
    if domain in DOMAIN_MAP:
        mapped_task = DOMAIN_MAP[domain]
        logger.info(f"Domain-Adaptive Routing: Mapping '{domain}' domain to '{mapped_task}' task.")
        return mapped_task

    # 3. Heuristic Fallback (Based on Target)
    target = str(metadata.get("target_column", "")).lower()
    if "price" in target or "cost" in target or "sales" in target:
        return "regression"
    elif "churn" in target or "cat" in target or "label" in target:
        return "classification"
    
    return "regression" # Global default
