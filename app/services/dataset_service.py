import asyncio
import datetime
import os
import shutil
import uuid
import pandas as pd
from fastapi import UploadFile
from app.config import settings
from app.logger import logger
from app.core.data_understanding import (
    profiler,
    type_detector,
    target_identifier,
    quality_checker,
    summary_generator
)
from app.utils.response_schema import success_response, error_response
from app.utils.data_manager import data_manager

class DatasetService:
    async def upload_dataset(self, file: UploadFile, user_id: str, project_id: str = None):
        logger.info(f"Starting dataset upload for file: {file.filename}")
        
        # 1. Validation
        if not file.filename.endswith(('.csv', '.xlsx')):
            logger.warning(f"Invalid file format rejected: {file.filename}")
            return error_response("Invalid file format. Only CSV and Excel supported.")
        
        # 2. Save File
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1]
        save_path = os.path.join(settings.DATASET_DIR, f"{file_id}{ext}")
        
        os.makedirs(settings.DATASET_DIR, exist_ok=True)
        
        # Phase 11: Non-blocking file copy to prevent event loop stutter
        def _save_file():
            with open(save_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        
        await asyncio.to_thread(_save_file)
            
            
        # Phase 11: Just return the file_id, let PipelineController handle the run
        return success_response(data={"file_id": file_id, "filename": file.filename})

    async def run_understanding(self, file_id: str, filename: str, user_id: str = None, project_id: str = None):
        logger.info(f"Starting data understanding for file: {file_id}")
        
        from app.utils.metadata_manager import MetadataManager
        mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)

        # Detect file extension
        csv_path = os.path.join(settings.DATASET_DIR, f"{file_id}.csv")
        xlsx_path = os.path.join(settings.DATASET_DIR, f"{file_id}.xlsx")
        
        if os.path.exists(csv_path):
            dataset_path = csv_path
            ext = '.csv'
        elif os.path.exists(xlsx_path):
            dataset_path = xlsx_path
            ext = '.xlsx'
        else:
            return error_response(f"Dataset not found: {file_id}")
            
        # 3. Load into Pandas (wrapped in thread to prevent blocking)
        await mm.update_phase("profiling", "running", flush=True) 
        await mm.update_step("data_understanding", "loading", "running", flush=False)
        try:
            # Use DataManager (Cache-first)
            df = data_manager.get_dataframe(file_id, "raw")
            
            if df is None:
                def _read_data():
                    if ext == '.csv':
                        return pd.read_csv(dataset_path)
                    else:
                        return pd.read_excel(dataset_path)
                
                df = await asyncio.to_thread(_read_data)
                data_manager.update_cache(file_id, df, "raw")
            
            await mm.update_step("data_understanding", "loading", "completed", flush=False)
            await mm.add_log("data_understanding", f"Loaded {len(df)} rows successfully.", flush=False)
        except Exception as e:
            await mm.update_step("data_understanding", "loading", "failed", flush=False)
            await mm.update_phase("profiling", "failed", details=str(e), flush=True)
            return error_response(f"Failed to read dataset: {str(e)}")
            
        if df.empty:
            return error_response("Dataset is empty.")

        # 4. Run Intelligence Engine
        await mm.update_step("data_understanding", "profiling", "running", flush=False)
        metadata = await asyncio.to_thread(profiler.extract_metadata, df)
        await mm.update_step("data_understanding", "profiling", "completed", flush=False)
        await mm.add_log("data_understanding", "Extracted basic statistics and column profiles.", flush=False)
        
        # Type Detection
        await mm.update_step("data_understanding", "type_detection", "running", flush=False)
        feature_types = await asyncio.to_thread(type_detector.detect_feature_types, df)
        metadata.update(feature_types)
        await mm.update_step("data_understanding", "type_detection", "completed", flush=False)
        await mm.add_log("data_understanding", f"Detected {len(feature_types.get('numerical_features', []))} numerical and {len(feature_types.get('categorical_features', []))} categorical features.", flush=False)
        
        # Target Identification & Quality Check
        await mm.update_step("data_understanding", "quality_check", "running", flush=False)
        target = target_identifier.identify_target(
            df, 
            feature_types['numerical_features'], 
            feature_types['categorical_features'],
            feature_types['id_features']
        )
        problem_type = target_identifier.identify_problem_type(df, target)
        
        metadata["possible_target_columns"] = [target] if target else []
        metadata["problem_type"] = problem_type
        
        metadata["data_quality_score"] = quality_checker.calculate_quality_score(df)
        await mm.update_step("data_understanding", "quality_check", "completed", flush=False)
        await mm.add_log("data_understanding", f"Quality Score: {metadata['data_quality_score']}/100. Potential Target: {target}", flush=False)
        
        # Summary
        await mm.update_step("data_understanding", "summary_generation", "running", flush=False)
        metadata["summary"] = summary_generator.generate_summary(metadata)
        await mm.update_step("data_understanding", "summary_generation", "completed", flush=False)
        await mm.add_log("data_understanding", "Summary generated successfully.", flush=False)
        
        metadata["file_id"] = file_id
        metadata["filename"] = filename
        metadata["created_at"] = datetime.datetime.now().isoformat()
        
        # 5. Build and Save Metadata
        full_data = await mm.load()
        full_data.update(metadata)
        
        # Phase 18: Standardize summary for UI history/dashboard
        full_data["summary"] = {
            "rows": metadata.get("rows", 0),
            "columns": metadata.get("columns", 0),
            "duplicates": metadata.get("duplicate_rows", 0),
            "missing_pct": metadata.get("missing_pct", 0)
        }
        
        await mm.save(full_data)
        
        await mm.update_phase("profiling", "completed", flush=True)
        await mm.flush()
        return success_response(data=full_data)
