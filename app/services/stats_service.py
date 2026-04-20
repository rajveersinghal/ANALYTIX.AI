# app/services/stats_service.py
import os
import pandas as pd
import json
from app.config import settings
from app.core.statistics import stats_summary
from app.utils.metadata_manager import MetadataManager
from app.utils.data_manager import data_manager
from app.logger import logger

class StatsService:
    async def run_stats(self, file_id: str, mode: str = "fast", user_id: str = None, project_id: str = None, overrides: dict = None):
        """
        Runs statistical validation on the CLEANED dataset.
        """
        mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
        metadata = await mm.load()
        await mm.update_phase("statistics", "running")
        
        # Use DataManager to get Cleaned Data from Memory
        df = data_manager.get_dataframe(file_id, "train")
        
        if df is None:
             # Direct read fallback
             train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
             clean_path = os.path.join(settings.DATASET_DIR, f"{file_id}_clean.csv")
             dataset_path = train_path if os.path.exists(train_path) else (clean_path if os.path.exists(clean_path) else None)
             
             if not dataset_path:
                  raise ValueError("Cleaned data not found. Please run Data Cleaning first.")
             df = pd.read_csv(dataset_path) if dataset_path.endswith('.csv') else pd.read_excel(dataset_path)
             data_manager.update_cache(file_id, df, "train")
        
        # Mark steps as running
        await mm.update_step("statistics", "normality", "running")
        await mm.update_step("statistics", "skewness", "running")
        await mm.update_step("statistics", "cardinality", "running")
        
        # --- Performance Optimization for Fast Mode ---
        analysis_df = df
        if mode == "fast":
            # Sample for speed (max 2000)
            if len(df) > 2000:
                analysis_df = df.sample(2000, random_state=42)
            
            # Subset Features: Top 10 Numerical, Top 5 Categorical
            nums = metadata.get("numerical_features", [])
            cats = metadata.get("categorical_features", [])
            
            if len(nums) + len(cats) > 15:
                temp_metadata = metadata.copy()
                temp_metadata["numerical_features"] = nums[:10]
                temp_metadata["categorical_features"] = cats[:5]
                results = stats_summary.generate_stats_summary(analysis_df, temp_metadata)
            else:
                results = stats_summary.generate_stats_summary(analysis_df, metadata)
        else:
            results = stats_summary.generate_stats_summary(df, metadata)
        
        # Mark steps as completed
        await mm.update_step("statistics", "normality", "completed")
        await mm.update_step("statistics", "skewness", "completed")
        await mm.update_step("statistics", "cardinality", "completed")
        await mm.add_log("statistics", "Performed statistical tests to check data quality and distribution.")
        
        # Save to Metadata
        metadata["stats_summary"] = results
        await mm.save(metadata)
        await mm.update_phase("statistics", "completed")
        
        return results
