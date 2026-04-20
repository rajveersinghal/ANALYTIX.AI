# app/core/orchestrator.py
import asyncio
import uuid
import datetime
from typing import Dict, List, Optional, Any
from app.logger import logger
from app.services.pipeline_controller import PipelineController
from app.utils.metadata_manager import MetadataManager
from app.core.sockets import socket_manager

class JobStatus:
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class PipelineOrchestrator:
    """
    V2 PRODUCTION ORCHESTRATOR
    Manages the lifecycle of an AutoML job with state persistence, 
    real-time instrumentation, and recovery logic.
    """
    
    def __init__(self):
        # In-memory tracking for active jobs (sync with DB)
        self.active_jobs: Dict[str, Dict] = {}

    async def start_job(self, dataset_id: str, user_id: str = None, project_id: str = None, mode: str = "fast", overrides: dict = None) -> str:
        """
        Initializes a new job and kicks off background execution.
        Returns a unique job_id.
        """
        job_id = str(uuid.uuid4())
        
        # Initialize Metadata
        mm = MetadataManager(dataset_id, user_id=user_id, project_id=project_id)
        await mm.load()
        await mm.update_config("current_job_id", job_id)
        
        job_info = {
            "job_id": job_id,
            "dataset_id": dataset_id,
            "user_id": user_id,
            "start_time": datetime.datetime.utcnow().isoformat(),
            "status": JobStatus.RUNNING,
            "mode": mode,
            "progress": 0
        }
        
        self.active_jobs[job_id] = job_info
        
        # Fire and Forget (Background Task)
        # In production, this would be pushed to Celery/Redis
        asyncio.create_task(self._execute_pipeline(job_id, dataset_id, user_id, project_id, mode, overrides))
        
        return job_id

    async def _execute_pipeline(self, job_id: str, dataset_id: str, user_id: str, project_id: str, mode: str, overrides: dict):
        """
        Core execution loop. Orchestrates the 11-step pipeline with 
        logging and AI Thinking narrative.
        """
        logger.info(f"ORCHESTRATOR: Starting execution for Job {job_id}")
        mm = MetadataManager(dataset_id, user_id=user_id, project_id=project_id)
        controller = PipelineController(dataset_id, user_id=user_id, project_id=project_id)
        
        steps = [
            ("upload", "Verifying data integrity and finalizing ingestion..."),
            ("profiling", "Analyzing data structure and schema..."),
            ("cleaning", "Remediating data quality issues and outliers..."),
            ("eda", "Discovering strategic feature interactions..."),
            ("statistics", "Running rigorous hypothesis testing..."),
            ("routing", "Determining optimal task routing..."),
            ("modeling", "Training champion model candidates..."),
            ("tuning", "Fine-tuning hyperparameters for peak precision..."),
            ("explain", "Computing model explainability (XAI)..."),
            ("decision", "Generating strategic business recommendations..."),
            ("report", "Compiling executive summary report...")
        ]
        
        try:
            total_steps = len(steps)
            for i, (step_name, thinking) in enumerate(steps):
                # 1. Update Progress
                progress = int(((i) / total_steps) * 100)
                self.active_jobs[job_id]["progress"] = progress
                self.active_jobs[job_id]["current_step"] = step_name
                self.active_jobs[job_id]["ai_thinking"] = thinking
                
                # 2. Add "AI Thinking" to Metadata
                await mm.update_ai_thinking(step_name, thinking)
                await mm.add_log(step_name, f"ORCHESTRATOR: Initiating {step_name} phase.")
                
                # 3. Broadcast to WebSockets (Live UX)
                await socket_manager.broadcast_to_job(job_id, self.active_jobs[job_id])
                
                # 4. Run Step
                await controller.run_step(step_name, mode=mode, overrides=overrides)
                
                # 5. Success Log
                await mm.add_log(step_name, f"ORCHESTRATOR: {step_name} phase finalized successfully.")
                
            # Finalize
            self.active_jobs[job_id]["status"] = JobStatus.COMPLETED
            self.active_jobs[job_id]["progress"] = 100
            self.active_jobs[job_id]["ai_thinking"] = "Pipeline finalized. Intelligence is now production-ready."
            await socket_manager.broadcast_to_job(job_id, self.active_jobs[job_id])
            
            await mm.update_config("last_job_status", JobStatus.COMPLETED)
            logger.info(f"ORCHESTRATOR: Job {job_id} COMPLETED successfully.")
            
        except Exception as e:
            logger.error(f"ORCHESTRATOR ERROR: Job {job_id} FAILED at step {self.active_jobs[job_id].get('current_step')}: {e}")
            self.active_jobs[job_id]["status"] = JobStatus.FAILED
            self.active_jobs[job_id]["error"] = str(e)
            await mm.update_config("last_job_status", JobStatus.FAILED)
            await mm.update_config("last_job_error", str(e))

    def get_job_status(self, job_id: str) -> Optional[Dict]:
        return self.active_jobs.get(job_id)

    def cleanup_old_jobs(self, max_age_hours: int = 12):
        """
        SRE Task: Prunes the in-memory active_jobs map to prevent memory leaks.
        Removes completed/failed jobs older than max_age_hours.
        """
        now = datetime.datetime.utcnow()
        to_delete = []
        for job_id, info in self.active_jobs.items():
            if info["status"] in [JobStatus.COMPLETED, JobStatus.FAILED]:
                start_time = datetime.datetime.fromisoformat(info["start_time"])
                if (now - start_time).total_seconds() > (max_age_hours * 3600):
                    to_delete.append(job_id)
        
        for job_id in to_delete:
            del self.active_jobs[job_id]
        
        if to_delete:
            logger.info(f"ORCHESTRATOR: Pruned {len(to_delete)} stale job records from memory.")

# Global Instance
orchestrator = PipelineOrchestrator()
