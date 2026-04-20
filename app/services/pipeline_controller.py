import os
import json
import uuid
import asyncio
import gc
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
    "upload",
    "profiling",
    "cleaning",
    "eda",
    "statistics",
    "routing",
    "modeling",
    "tuning",
    "explain",
    "decision",
    "report"
]

# GLOBAL CONCURRENCY CONTROL: Prevent RAM spikes by limiting heavy modeling runs
# Recommended: 1 per CPU core, but for dev 2 is safe.
pipeline_semaphore = asyncio.Semaphore(2)

class PipelineController:
    def __init__(self, dataset_id: str, user_id: str = None, project_id: str = None):
        self.dataset_id = dataset_id
        self.user_id = user_id
        self.project_id = project_id
        # Phase 11: Async Metadata Manager
        self.metadata = MetadataManager(dataset_id, user_id=user_id, project_id=project_id)
        
        # Initialize Services
        self.dataset_service = DatasetService()
        self.cleaning_service = CleaningService()
        self.eda_service = EDAService()
        self.stats_service = StatsService()
        self.modeling_service = ModelingService()
        self.explainability_service = ExplainabilityService()
        self.decision_service = DecisionService()
        self.report_service = ReportService()

    def _check_memory_safety(self):
        """
        SRE Safety Layer: Aborts execution if RAM > 90% to prevent hard crashes.
        """
        import psutil
        ram_percent = psutil.virtual_memory().percent
        if ram_percent > 90:
            logger.critical(f"MEMORY SHIELD: Aborting pipeline run! RAM at {ram_percent}%.")
            raise MemoryError(f"System RAM critical ({ram_percent}%). Please wait or upgrade plan.")
        return True

    async def update_step_status(self, step: str, status: str, details: str = None, flush: bool = True):
        # Update Central Metadata (Single Source of Truth)
        await self.metadata.update_phase(step, status, details, flush=flush)

    async def run_step(self, step_name: str, mode: str = "fast", overrides: dict = None, **kwargs):
        """
        Runs a specific pipeline step with support for user overrides (Manual Mode).
        """
        self._check_memory_safety()
        logger.info(f"Pipeline Controller: Starting step {step_name} for {self.dataset_id} (Manual: {bool(overrides)})")
        await self.update_step_status(step_name, "running", flush=True) 
        
        try:
            # Load fresh metadata to check for previous configurations
            metadata = await self.metadata.load()
            config = metadata.get("expert_config", {})
            if overrides:
                config.update(overrides)
                await self.metadata.update_config("expert_config", config)
            
            result = None
            
            # Step Mapping with Override Logic
            if step_name == "upload":
                await self.update_step_status(step_name, "completed", flush=True)
                return True

            if step_name == "profiling":
                result = await self.dataset_service.run_understanding(
                    self.dataset_id, 
                    filename=metadata.get("filename", "dataset.csv"),
                    user_id=self.user_id or metadata.get("user_id"),
                    project_id=metadata.get("project_id") or metadata.get("projectId")
                )
                
            elif step_name == "cleaning":
                # Manual Override: specific target or features
                task_type = config.get("task_type") or kwargs.get("task_type")
                target_col = config.get("target_column") or kwargs.get("target_col")
                result = await self.cleaning_service.run_cleaning(
                    self.dataset_id, 
                    mode=mode, 
                    task_type=task_type, 
                    target_col=target_col, 
                    user_id=self.user_id, 
                    project_id=self.project_id
                )
                await self.metadata.update_artifact("clean_data", f"storage/datasets/{self.dataset_id}_train.csv", flush=False)
                
            elif step_name == "eda":
                # User might have excluded some columns from EDA
                result = await self.eda_service.run_eda(
                    self.dataset_id, 
                    mode=mode, 
                    user_id=self.user_id, 
                    project_id=self.project_id,
                    overrides=config
                )
                
            elif step_name == "statistics":
                data = await self.stats_service.run_stats(
                    self.dataset_id, 
                    mode=mode, 
                    user_id=self.user_id, 
                    project_id=self.project_id,
                    overrides=config
                )
                result = success_response(data=data)

            elif step_name == "routing":
                from app.core.modeling import problem_router
                problem_type = config.get("task_type") or kwargs.get("task_type") or problem_router.detect_problem_type(metadata)
                await self.metadata.update_config("problem_type", problem_type)
                result = success_response(data={"problem_type": problem_type})
                
            elif step_name == "modeling":
                # Expert Mode: User selects specific model types or features
                task_type = config.get("task_type") or kwargs.get("task_type")
                result = await self.modeling_service.run_automl(
                    self.dataset_id, 
                    mode=mode, 
                    task_type=task_type, 
                    user_id=self.user_id, 
                    project_id=self.project_id,
                    overrides=config
                )
            
            elif step_name == "tuning":
                result = await self.modeling_service.run_tuning(
                    self.dataset_id, 
                    mode=mode, 
                    user_id=self.user_id, 
                    project_id=self.project_id,
                    overrides=config
                )
                
            elif step_name == "explain":
                result = await self.explainability_service.run_explainability(
                    self.dataset_id, 
                    user_id=self.user_id, 
                    project_id=self.project_id,
                    overrides=config
                )
                
            elif step_name == "decision":
                result = await self.decision_service.run_decision(
                    self.dataset_id, 
                    user_id=self.user_id, 
                    project_id=self.project_id,
                    overrides=config
                )
                
            elif step_name == "report":
                path = await self.report_service.generate_report(
                    self.dataset_id, 
                    user_id=self.user_id, 
                    project_id=self.project_id,
                    overrides=config
                )
                await self.metadata.update_artifact("report", path, flush=False)
                result = success_response(data={"report_path": path})

            # Handle errors
            if isinstance(result, dict) and result.get("status") == "error":
                raise Exception(result.get("message", "Step failed"))
                
            await self.update_step_status(step_name, "completed", flush=True)
            
            import gc
            gc.collect()
            return True

        except Exception as e:
            logger.error(f"Pipeline Step {step_name} Failed: {e}", exc_info=True)
            await self.update_step_status(step_name, "failed", details=str(e), flush=True)
            raise e



    async def run_all(self, mode: str = "fast"):
        """
        Orchestrates the entire pipeline with concurrency protection.
        """
        async with pipeline_semaphore:
            await self._run_all_logic(mode)

    async def _run_all_logic(self, mode: str = "fast"):
        logger.info(f"Pipeline Controller: Running ALL for {self.dataset_id} in {mode} mode")
        await self.metadata.set_mode(mode, flush=False)
        metadata = await self.metadata.load()
        current_state = metadata.get("pipeline_state", {})
        
        try:
            # 1. Sequential Start
            for step in ["upload", "profiling", "cleaning"]:
                if current_state.get(step) == "completed": continue
                await self.run_step(step, mode=mode, **(await self._get_step_args(step)))

            # 2. Sequential Execution
            for step in ["eda", "statistics", "routing", "modeling", "tuning", "explain", "decision"]:
                if current_state.get(step) == "completed": continue
                await self.run_step(step, mode=mode, **(await self._get_step_args(step)))
            
            # 3. Handle Strategic Tasks (e.g. Sales Intel)
            if metadata.get("task_type") == "sales":
                logger.info(f"Pipeline Controller: Computing Sales Intelligence for {self.dataset_id}")
                from app.services.sales_intelligence_service import SalesIntelligenceService
                sis = SalesIntelligenceService()
                file_path = os.path.join(settings.DATASET_DIR, f"{self.dataset_id}.csv")
                if os.path.exists(file_path):
                    sales_results = await sis.analyze_from_path(
                        file_path, 
                        self.dataset_id, 
                        metadata.get("filename", "sales_data.csv"),
                        self.user_id or metadata.get("user_id"),
                        project_id=self.project_id or metadata.get("project_id")
                    )
                    metadata.update(sales_results)
                    await self.metadata.save(metadata)
                    logger.info(f"Pipeline Controller: Sales Intel merged into metadata.")

            # 4. Final step: Report
            if current_state.get("report") != "completed":
                await self.run_step("report", mode=mode, **(await self._get_step_args("report")))
            
            await self.metadata.flush()
        except Exception as e:
            logger.critical(f"Pipeline Controller Critical Crash: {e}", exc_info=True)
            # Find the first non-completed step and mark it as failed
            for step in PIPELINE_STEPS:
                if current_state.get(step) != "completed":
                    await self.update_step_status(step, "failed", details=f"Master controller crash: {str(e)}")
                    break
        logger.info(f"Pipeline Controller: Execution finished for {self.dataset_id}")
        # Explicitly hint GC after heavy processing
        gc.collect()

    async def _get_step_args(self, step: str) -> dict:
        kw = {}
        if step in ["cleaning", "modeling", "routing"]:
            meta = await self.metadata.load()
            kw["task_type"] = meta.get("task_type") or meta.get("problem_type")
            kw["target_col"] = meta.get("target_column")
        return kw
                

