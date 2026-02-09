from fastapi import APIRouter, HTTPException
from app.services.modeling_service import ModelingService
import os
import json
from app.config import settings
from pydantic import BaseModel

class TrainRequest(BaseModel):
    mode: str = "fast" # "fast" or "deep"

router = APIRouter(prefix="/model", tags=["Modeling"])
modeling_service = ModelingService()

@router.get("/best/{dataset_id}")
def get_best_model(dataset_id: str):
    from app.utils.metadata_manager import MetadataManager
    mm = MetadataManager(dataset_id)
    metadata = mm.load()
    results = metadata.get("modeling_results")
    if results:
        return results
    raise HTTPException(status_code=404, detail="Model info not found. Train models first.")

@router.get("/sample_predictions/{dataset_id}")
def get_sample_predictions(dataset_id: str):
    """Returns a sample of actual vs predicted values."""
    try:
        # Load Cleaned Data + Target
        # This duplicates logic in Service, but kept simple here for MVP view
        train_path = os.path.join(settings.DATASET_DIR, f"{dataset_id}_train.csv")
        meta_path = os.path.join(settings.DATASET_DIR, f"{dataset_id}.json")
        
        if not os.path.exists(train_path):
             raise HTTPException(status_code=404, detail="Data not found.")

        df = pd.read_csv(train_path)
        with open(meta_path, 'r') as f:
            meta = json.load(f)
        target = meta.get("target_column")
        
        # Load Model
        import joblib
        model_path = os.path.join(settings.DATASET_DIR, f"{dataset_id}_model.pkl")
        if not os.path.exists(model_path):
             raise HTTPException(status_code=404, detail="Model not found.")
        
        model = joblib.load(model_path)
        
        # Predict on sample (first 20 rows)
        sample = df.head(20).copy()
        X_sample = sample.drop(columns=[target]) if target in sample.columns else sample
        
        # Model is pipeline, so it handles preprocessing
        preds = model.predict(X_sample)
        
        sample["Predicted"] = preds
        if target in sample.columns:
            sample["Actual"] = sample[target]
            
        return sample.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train/{dataset_id}")
def train_models(dataset_id: str, request: TrainRequest):
    try:
        return modeling_service.run_automl(dataset_id, mode=request.mode)
    except Exception as e:
        return {"status": "error", "message": "Training failed", "error": str(e)}
