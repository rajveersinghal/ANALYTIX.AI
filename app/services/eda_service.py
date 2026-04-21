# app/services/eda_service.py
import os
import pandas as pd
import json
from app.config import settings
from app.core.eda import insight_generator
from app.utils.response_schema import success_response, error_response
from app.logger import logger
from app.utils.metadata_manager import MetadataManager
from app.utils.data_manager import data_manager

class EDAService:
    async def run_eda(self, file_id: str, mode: str = "fast", user_id: str = None, project_id: str = None, overrides: dict = None):
        """
        Runs EDA on the *cleaned* training data.
        """
        try:
            mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
            metadata = await mm.load()
            await mm.update_phase("eda", "running")
            
            # Use DataManager to get Cleaned Data from Memory
            df = await data_manager.get_dataframe(file_id, "train")
            
            if df is None:
                # Direct read fallback
                train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
                clean_path = os.path.join(settings.DATASET_DIR, f"{file_id}_clean.csv")
                dataset_path = train_path if os.path.exists(train_path) else (clean_path if os.path.exists(clean_path) else None)
                if not dataset_path:
                    raise ValueError("Cleaned data not found. Please run the Data Cleaning step first.")
                df = pd.read_csv(dataset_path) if dataset_path.endswith('.csv') else pd.read_excel(dataset_path)
                data_manager.update_cache(file_id, df, "train")
            
            await mm.update_step("eda", "insights", "running")
            await mm.update_step("eda", "correlations", "running")
            
            # --- Performance Optimization for Fast Mode ---
            analysis_df = df
            if mode == "fast":
                # 1. Sample Rows (max 2000)
                if len(df) > 2000:
                    analysis_df = df.sample(2000, random_state=42)
                
                # 2. Subset Features (top 15 by variance for numericals)
                nums = metadata.get("numerical_features", [])
                cats = metadata.get("categorical_features", [])
                
                if len(nums) + len(cats) > 15:
                    top_nums = analysis_df[nums].var().sort_values(ascending=False).head(10).index.tolist() if nums else []
                    top_cats = cats[:5]
                    
                    target = metadata.get("target_column")
                    relevant_features = list(set(top_nums + top_cats + ([target] if target else [])))
                    analysis_df = analysis_df[relevant_features]

            # Generate Insights on optimized dataframe
            import asyncio
            results = await asyncio.to_thread(insight_generator.generate_insights, analysis_df, metadata, mode=mode)
            
            await mm.update_step("eda", "insights", "completed")
            await mm.update_step("eda", "correlations", "completed")
            await mm.add_log("eda", f"Generated {len(results.get('insights', []))} key insights and calculated correlations.")
            
            # Save Insights to Metadata
            metadata["eda_results"] = results
            
            # Optional: Generate Stats Summary (if module exists)
            try:
                from app.core.statistics.stats_summary import generate_stats_summary
                stats_results = await asyncio.to_thread(generate_stats_summary, df, metadata)
                metadata["stats_summary"] = stats_results
            except (ImportError, Exception) as e:
                logger.warning(f"Stats summary generation skipped or failed: {e}")
            
            await mm.save(metadata)
            await mm.update_phase("eda", "completed")
            
            return success_response(data=results)

        except Exception as e:
            logger.error(f"EDA Service Error: {e}")
            return error_response(f"EDA failed: {str(e)}")
