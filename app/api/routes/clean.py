# app/api/routes/clean.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from app.services.pipeline_controller import PipelineController
from app.logger import logger

router = APIRouter(prefix="/clean", tags=["Cleaning"])

class CleanRequest(BaseModel):
    task_type: str = "regression"
    target_column: Optional[str] = None

def run_cleaning_wrapper(dataset_id: str, task_type: str, target_column: str):
    """Wrapper to run cleaning via PipelineController (updates metadata)"""
    try:
        controller = PipelineController(dataset_id)
        controller.run_step("data_cleaning", task_type=task_type, target_col=target_column)
    except Exception as e:
        logger.error(f"Background cleaning failed for {dataset_id}: {e}")

@router.post("/run/{dataset_id}", status_code=202)
def run_cleaning(dataset_id: str, request: CleanRequest, background_tasks: BackgroundTasks):
    logger.info(f"Received cleaning request for {dataset_id}. Payload: {request.dict()}")
    
    try:
        # 1. Initialize Metadata/Status (via Controller or MetadataManager directly?)
        # Controller __init__ creates MetadataManager.
        # We can create a ephemeral controller to set status to pending/running? 
        # Actually run_step sets it to "running".
        # But for immediate UI feedback, we might want to ensure metadata exists.
        
        # 2. Add to Background Tasks
        background_tasks.add_task(
            run_cleaning_wrapper, 
            dataset_id, 
            request.task_type, 
            request.target_column
        )
        
        return {"message": "Cleaning pipeline started", "file_id": dataset_id, "status": "processing"}
        
    except Exception as e:
        logger.error(f"Error initiating cleaning: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
