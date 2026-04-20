from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from app.services.report_service import ReportService
from app.core.auth.security import get_current_user
from app.utils.metadata_manager import MetadataManager
import os

router = APIRouter(prefix="/report", tags=["Reporting"])
service = ReportService()

async def verify_ownership(dataset_id: str, current_user: dict):
    mm = MetadataManager(dataset_id)
    metadata = await mm.load()
    user_id = str(current_user["_id"])
    if metadata.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this intelligence fragment.")

@router.get("/generate/{dataset_id}")
async def generate_report(dataset_id: str, current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        path = await service.generate_report(dataset_id)
        if os.path.exists(path):
            return FileResponse(path, media_type='application/pdf', filename=f"AnalytixAI_Report_{dataset_id}.pdf")
        raise HTTPException(status_code=500, detail="Report generation failed.")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/generate/html/{dataset_id}")
async def generate_html_report(dataset_id: str, current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        path = await service.generate_html_report(dataset_id)
        if os.path.exists(path):
            return FileResponse(path, media_type='text/html', filename=f"AnalytixAI_Report_{dataset_id}.html")
        raise HTTPException(status_code=500, detail="HTML Report generation failed.")
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
