# app/utils/model_loader.py
import os
import joblib
from app.config import settings
from app.logger import logger

def load_model(dataset_id: str):
    """
    Loads a saved model pipeline from the unified storage.
    """
    model_path = os.path.join(settings.MODEL_DIR, f"{dataset_id}_model.pkl")
    if not os.path.exists(model_path):
        logger.error(f"Model file not found: {model_path}")
        return None
    
    try:
        return joblib.load(model_path)
    except Exception as e:
        logger.error(f"Failed to load model {dataset_id}: {e}")
        return None

# app/utils/feature_loader.py
from app.utils.metadata_manager import MetadataManager

def load_feature_importance(dataset_id: str):
    """
    Retrieves feature importance from metadata (SHAP or Global).
    """
    mm = MetadataManager(dataset_id)
    metadata = mm.load()
    
    # Try SHAP first
    explain = metadata.get("explainability_results", {})
    global_shap = explain.get("global_explanation", {}).get("feature_importance")
    if global_shap:
        return global_shap
        
    # Fallback to standard modeling importance if available
    model_res = metadata.get("modeling_results", {})
    return model_res.get("feature_importance")
