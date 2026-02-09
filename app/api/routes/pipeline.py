from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.services.pipeline_controller import PipelineController
from app.utils.response_schema import success_response, error_response
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

class RunPipelineRequest(BaseModel):
    mode: str = "fast"
    task_type: Optional[str] = None
    target_column: Optional[str] = None
    domain: Optional[str] = "general"

@router.post("/run/{dataset_id}")
def run_pipeline(dataset_id: str, request: RunPipelineRequest, background_tasks: BackgroundTasks):
    try:
        controller = PipelineController(dataset_id)
        
        # Save config
        if request.task_type:
            controller.metadata.update_config("task_type", request.task_type)
        if request.target_column:
            controller.metadata.update_config("target_column", request.target_column)
        if request.domain:
            controller.metadata.update_config("domain", request.domain)
        
        # Run in background to avoid blocking
        background_tasks.add_task(controller.run_all, request.mode)
        
        return success_response(
            data={"message": "Pipeline started", "file_id": dataset_id},
            meta={"status": "processing"}
        )
    except Exception as e:
        return error_response(f"Failed to start pipeline: {str(e)}")

@router.get("/status/{dataset_id}")
def get_pipeline_status(dataset_id: str):
    try:
        controller = PipelineController(dataset_id)
        # Phase 17: Return full metadata state
        return success_response(data=controller.metadata.get_state())
    except Exception as e:
        return error_response(f"Failed to get status: {str(e)}")
