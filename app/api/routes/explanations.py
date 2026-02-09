from fastapi import APIRouter
from app.utils.metadata_manager import MetadataManager
from app.utils.response_schema import success_response, error_response

router = APIRouter(prefix="/explanations", tags=["Explanations"])

@router.get("/process-explanations/{dataset_id}")
def get_process_explanations(dataset_id: str):
    try:
        manager = MetadataManager(dataset_id)
        explanations = manager.get_state().get("logs", {})
        return success_response(data=explanations)
    except Exception as e:
        return error_response(f"Failed to fetch explanations: {str(e)}")
