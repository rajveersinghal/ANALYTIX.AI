# app/services/dataset_service.py
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

class DatasetService:
    async def upload_dataset(self, file: UploadFile):
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
        
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Trigger understanding (profiling) immediately so metadata is ready for Task Selection
        try:
            full_data = self.run_understanding(file_id)
            if isinstance(full_data, dict) and full_data.get("status") == "success":
                return full_data
        except Exception as e:
            logger.error(f"Failed to run initial understanding: {e}")
            
        return success_response(data={"file_id": file_id, "filename": file.filename})

    def run_understanding(self, file_id: str):
        logger.info(f"Starting data understanding for file: {file_id}")
        
        # Phase 17: Unified Metadata Manager
        from app.utils.metadata_manager import MetadataManager
        mm = MetadataManager(file_id)

        # Detect file extension
        # ... (keep file detection logic)
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
            
        # 3. Load into Pandas
        mm.update_phase("data_understanding", "running")
        mm.update_step("data_understanding", "loading", "running")
        try:
            if ext == '.csv':
                df = pd.read_csv(dataset_path)
            else:
                df = pd.read_excel(dataset_path)
            
            mm.update_step("data_understanding", "loading", "completed")
            mm.add_log("data_understanding", f"Loaded {len(df)} rows successfully.")
        except Exception as e:
            mm.update_step("data_understanding", "loading", "failed")
            mm.update_phase("data_understanding", "failed", details=str(e))
            return error_response(f"Failed to read dataset: {str(e)}")
            
        if df.empty:
            return error_response("Dataset is empty.")

        # 4. Run Intelligence Engine
        # Profiling
        mm.update_step("data_understanding", "profiling", "running")
        metadata = profiler.extract_metadata(df)
        mm.update_step("data_understanding", "profiling", "completed")
        mm.add_log("data_understanding", "Extracted basic statistics and column profiles.")
        
        # Type Detection
        mm.update_step("data_understanding", "type_detection", "running")
        feature_types = type_detector.detect_feature_types(df)
        metadata.update(feature_types)
        mm.update_step("data_understanding", "type_detection", "completed")
        mm.add_log("data_understanding", f"Detected {len(feature_types.get('numerical_features', []))} numerical and {len(feature_types.get('categorical_features', []))} categorical features.")
        
        # Target Identification & Quality Check
        mm.update_step("data_understanding", "quality_check", "running")
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
        mm.update_step("data_understanding", "quality_check", "completed")
        mm.add_log("data_understanding", f"Quality Score: {metadata['data_quality_score']}/100. Potential Target: {target}")
        
        # Summary
        mm.update_step("data_understanding", "summary_generation", "running")
        metadata["summary"] = summary_generator.generate_summary(metadata)
        mm.update_step("data_understanding", "summary_generation", "completed")
        mm.add_log("data_understanding", "Summary generated successfully.")
        
        metadata["file_id"] = file_id
        
        # 5. Save Metadata
        full_data = mm.load()
        full_data.update(metadata)
        mm.save(full_data)
        
        mm.update_phase("data_understanding", "completed")
        return success_response(data=full_data)
