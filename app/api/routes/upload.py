# app/api/routes/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.dataset_service import DatasetService
from app.exceptions import AnalytixException

router = APIRouter(prefix="/upload", tags=["Upload"])
dataset_service = DatasetService()

@router.post("/dataset")
async def upload_dataset(file: UploadFile = File(...)):
    try:
        return await dataset_service.upload_dataset(file)
    except Exception as e:
        return {"status": "error", "message": "Upload failed", "error": str(e)}
