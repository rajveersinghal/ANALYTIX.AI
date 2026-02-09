import os
import json
import uuid
from app.config import settings
from app.logger import logger
from app.utils.response_schema import success_response, error_response
from app.utils.metadata_manager import MetadataManager

# Import all services
from app.services.dataset_service import DatasetService
from app.services.cleaning_service import CleaningService
from app.services.eda_service import EDAService
from app.services.stats_service import StatsService
from app.services.modeling_service import ModelingService
from app.services.explainability_service import ExplainabilityService
from app.services.decision_service import DecisionService
from app.services.report_service import ReportService

PIPELINE_STEPS = [
    "data_understanding",
    "data_cleaning",
    "eda",
    "statistics",
    "modeling",
    "explainability",
    "decision",
    "report"
]

class PipelineController:
    def __init__(self, dataset_id: str):
        self.dataset_id = dataset_id
        # Phase 17: Metadata Manager
        self.metadata = MetadataManager(dataset_id)
        
        # Initialize Services
        self.dataset_service = DatasetService()
        self.cleaning_service = CleaningService()
        self.eda_service = EDAService()
        self.stats_service = StatsService()
        self.modeling_service = ModelingService()
        self.explainability_service = ExplainabilityService()
        self.decision_service = DecisionService()
        self.report_service = ReportService()

    def update_step_status(self, step: str, status: str, details: str = None):
        # Update Central Metadata (Single Source of Truth)
        self.metadata.update_phase(step, status, details)
        
        # Legacy Support - Disabled to avoid duplicate status files/logs
        # pipeline_manager.update_status(self.dataset_id, step, status, details=details)

    def run_step(self, step_name: str, mode: str = "fast", **kwargs):
        logger.info(f"Pipeline Controller: Starting step {step_name} for {self.dataset_id}")
        self.update_step_status(step_name, "running")
        
        try:
            result = None
            if step_name == "data_understanding":
                result = self.dataset_service.run_understanding(self.dataset_id)
                
            elif step_name == "data_cleaning":
                # Extract args for cleaning
                task_type = kwargs.get("task_type")
                target_col = kwargs.get("target_col")
                result = self.cleaning_service.run_cleaning(self.dataset_id, task_type=task_type, target_col=target_col)
                # Update Artifact
                self.metadata.update_artifact("clean_data", f"storage/datasets/{self.dataset_id}_train.csv")
                
            elif step_name == "eda":
                result = self.eda_service.run_eda(self.dataset_id)
                
            elif step_name == "statistics":
                data = self.stats_service.run_stats(self.dataset_id)
                result = success_response(data=data)
                
            elif step_name == "modeling":
                task_type = kwargs.get("task_type")
                result = self.modeling_service.run_automl(self.dataset_id, mode=mode, task_type=task_type)
                
            elif step_name == "explainability":
                result = self.explainability_service.run_explainability(self.dataset_id)
                
            elif step_name == "decision":
                result = self.decision_service.run_decision(self.dataset_id)
                
            elif step_name == "report":
                path = self.report_service.generate_report(self.dataset_id)
                self.metadata.update_artifact("report", path)
                result = success_response(data={"report_path": path})

            # Check result status if it's a standard response
            if isinstance(result, dict) and result.get("status") == "error":
                msg = result.get("message", "Unknown error in step")
                detail = result.get("error")
                error_text = f"{msg}: {detail}" if detail else msg
                raise Exception(error_text)
                
            self.update_step_status(step_name, "completed")
            return True

        except Exception as e:
            logger.error(f"Pipeline Step {step_name} Failed: {e}", exc_info=True)
            user_msg = self._map_error_to_user_message(step_name, e)
            self.update_step_status(step_name, "failed", details=user_msg)
            raise e

    def _map_error_to_user_message(self, step: str, error: Exception) -> str:
        msg = str(error).lower()
        if "empty" in msg or "no columns" in msg:
            return "The dataset appears to be empty. Please upload a valid file."
        if "target" in msg and ("not found" in msg or "missing" in msg):
            return "Target column is missing. It may have been dropped during cleaning or not selected."
        if "min_samples" in msg or "enough data" in msg or "small" in msg:
            return "Dataset is too small for reliable modeling (needs 30+ rows)."
        if "not found" in msg:
            return f"Required data for {step} is missing. Please ensure previous steps completed successfully."
        return str(error)

    def run_all(self, mode: str = "fast"):
        """
        Runs the full pipeline sequentially, skipping completed steps.
        """
        logger.info(f"Pipeline Controller: Running ALL for {self.dataset_id} in {mode} mode")
        
        # Save mode to metadata
        self.metadata.set_mode(mode)
        
        # Load current state
        current_state = self.metadata.load().get("pipeline_state", {})
        
        for step in PIPELINE_STEPS:
            step_status = current_state.get(step)
            
            if step_status == "completed":
                logger.info(f"Skipping {step} (already completed)")
                continue
            
            logger.info(f"Executing {step}...")
            try:
                # Load config from metadata for cleaning
                # We need to pass args if step is cleaning and they exist
                kw = {}
                if step == "data_cleaning":
                    meta = self.metadata.load()
                    kw["task_type"] = meta.get("task_type")
                    kw["target_col"] = meta.get("target_column")
                    
                self.run_step(step, mode, **kw)
            except Exception as e:
                logger.error(f"Pipeline stopped at {step} due to error: {e}")
                break # Stop execution on failure
                

