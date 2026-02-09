from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.services.report_service import ReportService
import os

router = APIRouter(prefix="/report", tags=["Reporting"])
service = ReportService()

@router.get("/generate/{dataset_id}")
def generate_report(dataset_id: str):
    try:
        path = service.generate_report(dataset_id)
        if os.path.exists(path):
            return FileResponse(path, media_type='application/pdf', filename=f"AnalytixAI_Report_{dataset_id}.pdf")
        raise HTTPException(status_code=500, detail="Report generation failed.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
