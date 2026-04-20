from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from app.services.inference_service import InferenceService
from app.utils.response_schema import success_response, error_response
from app.core.auth.security import get_current_user
from app.utils.metadata_manager import MetadataManager
from fastapi.responses import FileResponse
import os
import uuid
import shutil
from app.config import settings

router = APIRouter(prefix="/inference", tags=["Inference Engine"])
service = InferenceService()

async def verify_ownership(dataset_id: str, current_user: dict):
    mm = MetadataManager(dataset_id)
    if not await mm.check_user_access(current_user.get("_id")):
        raise HTTPException(status_code=403, detail="Unauthorized access to this intelligence fragment.")

@router.get("/samples")
async def list_samples(current_user: dict = Depends(get_current_user)):
    return success_response(data=await service.list_samples())

@router.post("/batch/{dataset_id}")
async def batch_inference(dataset_id: str, file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        temp_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1]
        temp_path = os.path.join(settings.DATASET_DIR, f"inf_{temp_id}{ext}")
        
        # Phase 11: Non-blocking write
        import asyncio
        def _write_inf():
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        
        await asyncio.to_thread(_write_inf)
            
        result = await service.predict_batch(dataset_id, temp_path)
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return success_response(data=result)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sample/select/{sample_id}")
async def select_sample(sample_id: str, current_user: dict = Depends(get_current_user)):
    try:
        import json
        index_path = os.path.join(settings.STORAGE_DIR, "samples", "samples_index.json")
        with open(index_path, 'r', encoding='utf-8') as f:
            samples = json.load(f)
            
        sample = next((s for s in samples if s['id'] == sample_id), None)
        if not sample:
            raise HTTPException(status_code=404, detail="Sample not found")
            
        dataset_id = str(uuid.uuid4())
        source_path = os.path.join(settings.STORAGE_DIR, "samples", sample['filename'])
        target_path = os.path.join(settings.DATASET_DIR, f"{dataset_id}.csv")
        
        shutil.copy(source_path, target_path)
        
        from app.services.dataset_service import DatasetService
        ds = DatasetService()
        # Ensure new session is linked to this user
        mm = MetadataManager(dataset_id, user_id=str(current_user.get("_id")))
        await mm.create_default()
        
        full_data = await ds.run_understanding(dataset_id)
        return full_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{dataset_id}")
async def download_batch_results(dataset_id: str, current_user: dict = Depends(get_current_user)):
    await verify_ownership(dataset_id, current_user)
    output_filename = f"{dataset_id}_predictions.csv"
    output_path = os.path.join(settings.REPORT_DIR, output_filename)
    
    if os.path.exists(output_path):
        return FileResponse(path=output_path, filename=f"AnalytixAI_Predictions_{dataset_id[-6:]}.csv", media_type='text/csv')
    raise HTTPException(status_code=404, detail="Batch predictions file not found.")

@router.post("/predict/{dataset_id}")
async def single_prediction(dataset_id: str, inputs: dict, current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        result = await service.predict_single(dataset_id, inputs)
        return success_response(data=result)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))
