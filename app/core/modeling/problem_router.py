# app/core/modeling/problem_router.py

def detect_problem_type(metadata: dict) -> str:
    """
    Returns 'regression' or 'classification' based on metadata.
    Phase 1 `target_identifier` should have set this, but we fallback safely.
    """
    pt = metadata.get("task_type") or metadata.get("problem_type") or "unknown"
    pt = pt.lower()
    
    if "regression" in pt:
        return "regression"
    elif "classification" in pt:
        return "classification"
    elif "forecasting" in pt:
        return "forecasting"
    elif "clustering" in pt:
        return "clustering"
    elif "anomaly" in pt or "risk" in pt:
        return "anomaly_detection"
    return "unknown"
