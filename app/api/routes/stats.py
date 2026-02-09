from fastapi import APIRouter, HTTPException
from app.services.stats_service import StatsService
import os
import json
from app.config import settings


router = APIRouter(prefix="/stats", tags=["Statistics"])
stats_service = StatsService()

@router.get("/summary/{dataset_id}")
def get_stats_summary(dataset_id: str):
    from app.utils.metadata_manager import MetadataManager
    mm = MetadataManager(dataset_id)
    metadata = mm.load()
    results = metadata.get("stats_summary")
    if results:
        return results
    raise HTTPException(status_code=404, detail="Stats summary not found. Run Analysis first.")

@router.post("/run/{dataset_id}")
def run_stats(dataset_id: str):
    try:
        results = stats_service.run_stats(dataset_id)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
