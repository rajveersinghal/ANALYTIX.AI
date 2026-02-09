# app/api/routes/eda.py
from fastapi import APIRouter, HTTPException
from app.services.eda_service import EDAService

router = APIRouter(prefix="/eda", tags=["EDA"])
eda_service = EDAService()

@router.get("/insights/{dataset_id}")
def get_eda_insights(dataset_id: str):
    from app.utils.metadata_manager import MetadataManager
    mm = MetadataManager(dataset_id)
    metadata = mm.load()
    results = metadata.get("eda_results")
    if results:
        return results
    raise HTTPException(status_code=404, detail="Insights not found. Run EDA Analysis first.")

@router.post("/run/{dataset_id}")
def run_eda(dataset_id: str):
    try:
        return eda_service.run_eda(dataset_id)
    except Exception as e:
        return {"status": "error", "message": "EDA failed", "error": str(e)}
