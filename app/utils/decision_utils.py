# app/utils/model_loader.py
import os
import joblib
from app.config import settings
from app.logger import logger

from collections import OrderedDict
import threading

_model_cache = OrderedDict() # {dataset_id: model_pipeline}
_cache_lock = threading.Lock()
_MAX_MODELS = 4

def load_model(dataset_id: str):
    """
    Loads a saved model pipeline with LRU caching.
    """
    with _cache_lock:
        if dataset_id in _model_cache:
            logger.info(f"Model Cache HIT for {dataset_id}")
            _model_cache.move_to_end(dataset_id)
            return _model_cache[dataset_id]

    model_path = os.path.join(settings.MODEL_DIR, f"{dataset_id}_model.pkl")
    if not os.path.exists(model_path):
        logger.error(f"Model file not found: {model_path}")
        return None
    
    try:
        model = joblib.load(model_path)
        with _cache_lock:
            if len(_model_cache) >= _MAX_MODELS:
                _model_cache.popitem(last=False)
            _model_cache[dataset_id] = model
        return model
    except Exception as e:
        logger.error(f"Failed to load model {dataset_id}: {e}")
        return None

# app/utils/feature_loader.py
from app.utils.metadata_manager import MetadataManager

async def load_feature_importance(dataset_id: str):
    """
    Retrieves feature importance from metadata (SHAP or Global).
    """
    mm = MetadataManager(dataset_id)
    metadata = await mm.load()
    
    # Try SHAP first
    explain = metadata.get("explainability_results", {})
    global_shap = explain.get("global_explanation", {}).get("feature_importance")
    if global_shap:
        return global_shap
        
    # Fallback to standard modeling importance if available
    model_res = metadata.get("modeling_results", {})
    return model_res.get("feature_importance")
