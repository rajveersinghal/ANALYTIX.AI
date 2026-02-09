from typing import Any, Dict, Optional

def _sanitize_nan(obj: Any) -> Any:
    """Recursively replaces NaN/inf with None for JSON compliance."""
    import numpy as np
    if isinstance(obj, dict):
        return {k: _sanitize_nan(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_sanitize_nan(x) for x in obj]
    elif isinstance(obj, float):
        if np.isnan(obj) or np.isinf(obj):
            return None
    return obj

def success_response(data: Any = None, meta: Optional[Dict] = None) -> Dict[str, Any]:
    return {
        "status": "success",
        "data": _sanitize_nan(data),
        "meta": _sanitize_nan(meta) or {}
    }

def error_response(message: str, error: Any = None) -> Dict[str, Any]:
    return {
        "status": "error",
        "message": message,
        "error": str(error) if error else None
    }
