# app/core/modeling/model_persistence.py
import os
import joblib
from app.config import settings

async def save_best_model(dataset_id: str, model_info: dict):
    """
    Saves the best model and its metadata.
    """
    from app.utils.metadata_manager import MetadataManager
    mm = MetadataManager(dataset_id)
    
    model = model_info['model_obj']
    
    # 1. Save .pkl in unified MODEL_DIR
    filename = f"{dataset_id}_model.pkl"
    model_path = os.path.join(settings.MODEL_DIR, filename)
    
    # joblib.dump is blocking, but file I/O is usually fast enough for small models.
    # For large models, consider asyncio.to_thread.
    import asyncio
    await asyncio.to_thread(joblib.dump, model, model_path)
    
    # 2. Register artifact in metadata (CRITICAL: MUST BE AWAITED)
    await mm.update_artifact("model", f"storage/models/{filename}")
    
    return model_path
