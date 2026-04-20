from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from app.core.auth.security import get_current_user
from app.utils.metadata_manager import MetadataManager
import os
from app.config import settings
from app.logger import logger

router = APIRouter(prefix="/download", tags=["Exports"])

async def verify_ownership(dataset_id: str, current_user: dict):
    mm = MetadataManager(dataset_id)
    metadata = await mm.load()
    if metadata.get("user_id") != str(current_user.get("_id")):
        raise HTTPException(status_code=403, detail="Unauthorized access to this intelligence fragment.")

@router.get("/report/{dataset_id}")
async def download_report(dataset_id: str, current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        report_filename = f"{dataset_id}_report.pdf"
        
        # Check both directories for backwards compatibility
        possible_paths = [
            os.path.join(settings.REPORT_DIR, report_filename),
            os.path.join(settings.DATASET_DIR, report_filename)
        ]
        
        report_path = None
        for p in possible_paths:
            if os.path.exists(p):
                report_path = p
                break
        
        if report_path:
            return FileResponse(
                path=report_path, 
                filename=f"AnalytixAI_Executive_Report_{dataset_id[-6:]}.pdf",
                media_type='application/pdf'
            )
        raise HTTPException(status_code=404, detail="Executive report not found. The intelligence fragment may have been purged or not yet generated.")
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Download report failure: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model/{dataset_id}")
async def download_model(dataset_id: str, current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        model_filename = f"{dataset_id}_model.pkl"
        model_path = os.path.join(settings.MODEL_DIR, model_filename)
        
        if os.path.exists(model_path):
            return FileResponse(
                path=model_path,
                filename=f"AnalytixAI_Model_{dataset_id[-6:]}.pkl",
                media_type='application/octet-stream'
            )
        raise HTTPException(status_code=404, detail="Trained model not found.")
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Download model failure: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dataset/{dataset_id}")
async def download_cleaned_dataset(dataset_id: str, current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        # Check for multiple possible clean data filenames
        possible_files = [f"{dataset_id}_train.csv", f"{dataset_id}_clean.csv"]
        dataset_path = None
        for f in possible_files:
            p = os.path.join(settings.DATASET_DIR, f)
            if os.path.exists(p):
                dataset_path = p
                break
        
        if dataset_path:
            return FileResponse(
                path=dataset_path,
                filename=f"AnalytixAI_Cleaned_Data_{dataset_id[-6:]}.csv",
                media_type='text/csv'
            )
        raise HTTPException(status_code=404, detail="Cleaned dataset not found.")
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Download dataset failure: {e}")
        raise HTTPException(status_code=500, detail=str(e))
