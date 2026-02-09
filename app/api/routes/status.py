from fastapi import APIRouter, HTTPException
from app.utils.metadata_manager import MetadataManager
from app.utils.response_schema import success_response, error_response

router = APIRouter(prefix="/status", tags=["Status"])

@router.get("/process-status/{dataset_id}")
def get_process_status(dataset_id: str):
    try:
        manager = MetadataManager(dataset_id)
        status = manager.get_state()
        return success_response(data=status)
    except Exception as e:
        return error_response(f"Failed to fetch status: {str(e)}")
