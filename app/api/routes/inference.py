# app/api/routes/inference.py
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.services.inference_service import InferenceService
from app.utils.response_schema import success_response, error_response
import os
import uuid
import shutil
from app.config import settings

router = APIRouter(prefix="/inference", tags=["Inference Engine"])
service = InferenceService()

@router.get("/samples")
async def list_samples():
    """
    Returns the list of available sample datasets.
    """
    return success_response(data=service.list_samples())

@router.post("/batch/{dataset_id}")
async def batch_inference(dataset_id: str, file: UploadFile = File(...)):
    """
    Upload a new file and get batch predictions using a specific trained model.
    """
    try:
        # Temporary save inference file
        temp_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1]
        temp_path = os.path.join(settings.DATASET_DIR, f"inf_{temp_id}{ext}")
        
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = service.predict_batch(dataset_id, temp_path)
        
        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return success_response(data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sample/select/{sample_id}")
async def select_sample(sample_id: str):
    """
    Copies a sample dataset to active datasets and initializes metadata.
    """
    try:
        import json
        index_path = os.path.join(settings.STORAGE_DIR, "samples", "samples_index.json")
        with open(index_path, 'r', encoding='utf-8') as f:
            samples = json.load(f)
            
        sample = next((s for s in samples if s['id'] == sample_id), None)
        if not sample:
            raise HTTPException(status_code=404, detail="Sample not found")
            
        # 1. Create new File ID
        dataset_id = str(uuid.uuid4())
        source_path = os.path.join(settings.STORAGE_DIR, "samples", sample['filename'])
        target_path = os.path.join(settings.DATASET_DIR, f"{dataset_id}.csv")
        
        shutil.copy(source_path, target_path)
        
        # 3. Trigger Understanding (Profiling)
        from app.services.dataset_service import DatasetService
        ds = DatasetService()
        full_data = ds.run_understanding(dataset_id)
        
        return full_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
