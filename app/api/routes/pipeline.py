from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from app.services.pipeline_controller import PipelineController
from app.core.orchestrator import orchestrator
from app.utils.response_schema import success_response, error_response
from app.core.auth.security import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

class RunPipelineRequest(BaseModel):
    mode: str = "fast"
    step: Optional[str] = None # For Manual Mode
    overrides: Optional[dict] = None # For Expert Mode
    task_type: Optional[str] = None
    target_column: Optional[str] = None
    domain: Optional[str] = "general"

@router.post("/run/{dataset_id}")
async def run_pipeline(
    dataset_id: str, 
    request: RunPipelineRequest, 
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = str(current_user["_id"])
        
        # Start the Job via Orchestrator
        job_id = await orchestrator.start_job(
            dataset_id, 
            user_id=user_id, 
            mode=request.mode, 
            overrides=request.overrides
        )
        
        return success_response(
            data={
                "message": "Job Orchestrated Successfully", 
                "job_id": job_id,
                "file_id": dataset_id
            },
            meta={"status": "processing"}
        )
    except Exception as e:
        import traceback
        return error_response(f"Failed to start pipeline: {str(e)}")

@router.get("/status/{dataset_id}")
async def get_pipeline_status(
    dataset_id: str,
    job_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_id = str(current_user["_id"])
        controller = PipelineController(dataset_id, user_id=user_id)
        
        # Phase 17: Return full metadata state
        state = await controller.metadata.get_state()
        
        # Inject live job tracking if available
        if job_id:
            job_info = orchestrator.get_job_status(job_id)
            if job_info:
                state["live_job"] = job_info
                
        return success_response(data=state)
    except Exception as e:
        return error_response(f"Failed to get status: {str(e)}")
