# app/services/stats_service.py
import os
import pandas as pd
import json
from app.config import settings
from app.core.statistics import stats_summary
from app.utils.metadata_manager import MetadataManager
from app.logger import logger

class StatsService:
    def run_stats(self, file_id: str):
        """
        Runs statistical validation on the CLEANED dataset.
        """
        mm = MetadataManager(file_id)
        metadata = mm.load()
        mm.update_phase("statistics", "running")
        
        # Prefer cleaned training set for validation
        train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
        clean_path = os.path.join(settings.DATASET_DIR, f"{file_id}_clean.csv")
        
        dataset_path = train_path if os.path.exists(train_path) else (clean_path if os.path.exists(clean_path) else None)
        
        if not dataset_path:
             raise ValueError("Cleaned data not found. Please run Data Cleaning first.")
             
        # Load Data
        df = pd.read_csv(dataset_path) if dataset_path.endswith('.csv') else pd.read_excel(dataset_path)
        
        # Mark steps as running
        mm.update_step("statistics", "normality", "running")
        mm.update_step("statistics", "skewness", "running")
        mm.update_step("statistics", "cardinality", "running")
            
        results = stats_summary.generate_stats_summary(df, metadata)
        
        # Mark steps as completed
        mm.update_step("statistics", "normality", "completed")
        mm.update_step("statistics", "skewness", "completed")
        mm.update_step("statistics", "cardinality", "completed")
        mm.add_log("statistics", "Performed statistical tests to check data quality and distribution.")
        
        # Save to Metadata
        metadata["stats_summary"] = results
        mm.save(metadata)
        mm.update_phase("statistics", "completed")
        
        return results
