# app/services/eda_service.py
import os
import pandas as pd
import json
from app.config import settings
from app.core.eda import insight_generator
from app.utils.response_schema import success_response, error_response
from app.logger import logger
from app.utils.metadata_manager import MetadataManager

class EDAService:
    def run_eda(self, file_id: str):
        """
        Runs EDA on the *cleaned* training data.
        """
        try:
            mm = MetadataManager(file_id)
            metadata = mm.load()
            mm.update_phase("eda", "running")
            
            # Prefer clean data
            train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
            clean_path = os.path.join(settings.DATASET_DIR, f"{file_id}_clean.csv")
            
            dataset_path = train_path if os.path.exists(train_path) else (clean_path if os.path.exists(clean_path) else None)
            
            if not dataset_path:
                 raise ValueError("Cleaned data not found. Please run the Data Cleaning step first.")
                 
            df = pd.read_csv(dataset_path) if dataset_path.endswith('.csv') else pd.read_excel(dataset_path)
            
            mm.update_step("eda", "insights", "running")
            mm.update_step("eda", "correlations", "running")
            
            # Generate Insights
            results = insight_generator.generate_insights(df, metadata)
            
            mm.update_step("eda", "insights", "completed")
            mm.update_step("eda", "correlations", "completed")
            mm.add_log("eda", f"Generated {len(results.get('insights', []))} key insights and calculated correlations.")
            
            # Save Insights to Metadata
            metadata["eda_results"] = results
            
            # Optional: Generate Stats Summary (if module exists)
            try:
                from app.core.statistics.stats_summary import generate_stats_summary
                stats_results = generate_stats_summary(df, metadata)
                metadata["stats_summary"] = stats_results
            except (ImportError, Exception) as e:
                logger.warning(f"Stats summary generation skipped or failed: {e}")
            
            mm.save(metadata)
            mm.update_phase("eda", "completed")
            
            return success_response(data=results)

        except Exception as e:
            logger.error(f"EDA Service Error: {e}")
            return error_response(f"EDA failed: {str(e)}")
