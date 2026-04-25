from fastapi import APIRouter, HTTPException, Depends
from app.logger import logger
from fastapi.responses import FileResponse
from app.services.report_service import ReportService
from app.core.auth.security import get_current_user
from app.utils.metadata_manager import MetadataManager
import os

router = APIRouter(prefix="/insights", tags=["Insights Reporting"])
service = ReportService()

async def verify_ownership(file_id: str, current_user: dict):
    # Support both dataset_id and file_id nomenclature
    mm = MetadataManager(file_id)
    metadata = await mm.load()
    user_id = str(current_user["_id"])
    if metadata.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this intelligence fragment.")

@router.post("/export")
async def export_intelligence(file_id: str, format: str = 'pdf', current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(file_id, current_user)
        
        if format == 'pdf':
            path = await service.generate_report(file_id)
            media_type = 'application/pdf'
        elif format == 'html':
            path = await service.generate_html_report(file_id)
            media_type = 'text/html'
        else:
            raise HTTPException(status_code=400, detail="Unsupported format requested.")
            
        if os.path.exists(path):
            return FileResponse(path, media_type=media_type, filename=f"AnalytixAI_Report_{file_id}.{format}")
        raise HTTPException(status_code=500, detail="Export failed.")
    except Exception as e:
        import traceback
        logger.error(f"REPORT EXPORT ERROR: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/generate/{dataset_id}")
async def legacy_generate_report(dataset_id: str, current_user: dict = Depends(get_current_user)):
    # Legacy support
    return await export_intelligence(dataset_id, 'pdf', current_user)
