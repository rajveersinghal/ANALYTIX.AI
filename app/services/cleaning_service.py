# app/services/cleaning_service.py
import os
import pandas as pd
import joblib
import json
from app.config import settings
from app.logger import logger
from app.core.data_cleaning import (
    missing_handler, duplicate_handler, type_corrector,
    outlier_handler, encoder, scaler, splitter, pipeline_builder
)
from app.utils.response_schema import success_response, error_response
from app.utils.metadata_manager import MetadataManager
from app.utils.data_manager import data_manager

class CleaningService:
    async def run_cleaning(self, file_id: str, mode: str = "fast", task_type: str = None, target_col: str = None, user_id: str = None, project_id: str = None, overrides: dict = None):
        """
        Executes full cleaning pipeline.
        """
        logger.info(f"Starting cleaning pipeline for dataset {file_id}. Task: {task_type}")
        
        try:
            # Unified Metadata Manager
            mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
            metadata = await mm.load()
            
            csv_path = os.path.join(settings.DATASET_DIR, f"{file_id}.csv")
            xlsx_path = os.path.join(settings.DATASET_DIR, f"{file_id}.xlsx")
            dataset_path = csv_path if os.path.exists(csv_path) else xlsx_path
            
            if not dataset_path or not os.path.exists(dataset_path):
                 raise FileNotFoundError(f"Dataset not found: {file_id}")
            
            await mm.update_phase("cleaning", "running")
            await mm.update_step("data_cleaning", "loading", "running")
            await mm.update_ai_thinking("data_cleaning", "I am currently loading the dataset and checking for structural integrity. I'll look for outliers and missing values next.")
            
            cleaning_actions = [] # New: Structured log for report section 3

            
            # Try to get from DataManager (Cache-first)
            df = await data_manager.get_dataframe(file_id, "raw")
            
            if df is None:
                # Fallback to direct read if DataManager failed (unlikely if file exists)
                if dataset_path.endswith('.csv'):
                    df = pd.read_csv(dataset_path)
                else:
                    df = pd.read_excel(dataset_path)
                data_manager.update_cache(file_id, df, "raw")
                
            # VALIDATION: Check for empty dataset
            if df.empty:
                raise ValueError("The uploaded dataset is empty. Please upload a valid file.")
                
            # Auto-fill from metadata if not provided as arguments (Phase 17+)
            if not task_type:
                task_type = (overrides or {}).get("task_type") or metadata.get("task_type") or metadata.get("problem_type")
            if not target_col:
                target_col = (overrides or {}).get("target_column") or metadata.get("target_column")
                # Fallback to possible target if single
                if not target_col and metadata.get("possible_target_columns"):
                    pss = metadata.get("possible_target_columns")
                    if len(pss) == 1:
                        target_col = pss[0]

            if not task_type:
                logger.warning(f"Task type not provided or found for {file_id}. Defaulting to 'regression'.")
                task_type = "regression"

            # 1.5 Manual Overrides: Drop unwanted columns
            if overrides and overrides.get("drop_columns"):
                to_drop = [c for c in overrides["drop_columns"] if c in df.columns]
                if to_drop:
                    df = df.drop(columns=to_drop)
                    logger.info(f"Expert Mode: Dropped manually selected columns: {to_drop}")
                    await mm.add_log("data_cleaning", f"Expert Mode: Manually dropped columns {to_drop}")

            # VALIDATION: Check target existence
            if target_col and target_col not in df.columns:
                raise ValueError(f"Target column '{target_col}' not found in dataset. Available columns: {list(df.columns)}")

            # VALIDATION: Minimum samples for modeling if applicable
            if len(df) < settings.MIN_SAMPLES_MODELING:
                 raise ValueError(f"Dataset is too small for reliable modeling (found {len(df)} rows, need {settings.MIN_SAMPLES_MODELING}).")

            initial_rows = len(df)
            await mm.update_step("data_cleaning", "loading", "completed")
            await mm.add_log("data_cleaning", f"Loaded {initial_rows} rows for cleaning.")
            
            import asyncio
            # 2. Type Correction
            await mm.update_step("data_cleaning", "type_correction", "running")
            feature_types = {
                "numerical_features": metadata.get("numerical_features", []),
                "categorical_features": metadata.get("categorical_features", []),
                "datetime_features": metadata.get("datetime_features", [])
            }
            df = await asyncio.to_thread(type_corrector.correct_types, df, feature_types)
            await mm.update_step("data_cleaning", "type_correction", "completed")
            await mm.add_log("data_cleaning", "Standardized data types across all columns.")
            
            # 3. Duplicate Handling
            await mm.update_step("data_cleaning", "duplicates", "running")
            initial_count = len(df)
            df = await asyncio.to_thread(duplicate_handler.remove_duplicates, df)
            duplicates_removed = initial_count - len(df)
            await mm.update_step("data_cleaning", "duplicates", "completed")
            msg = f"Removed {duplicates_removed} duplicate rows."
            await mm.add_log("data_cleaning", msg)
            if duplicates_removed > 0: 
                cleaning_actions.append(msg)
                await mm.add_step_insight("data_cleaning", f"Redundancy check complete. {duplicates_removed} duplicate records were purged to ensure statistical independence.")
            
            # 4. Outlier Handling
            await mm.update_step("data_cleaning", "outliers", "running")
            df = await asyncio.to_thread(outlier_handler.handle_outliers, df, feature_types["numerical_features"], mode=mode)
            await mm.update_step("data_cleaning", "outliers", "completed")
            msg = "Capped outliers in numerical columns using IQR method." if mode == "fast" else "Removed extreme outliers using IsolationForest."
            await mm.add_log("data_cleaning", msg)
            cleaning_actions.append(msg)
            await mm.update_ai_thinking("data_cleaning", "Moving to advanced outlier detection. Ensuring extreme values don't skew our eventual model's perception.")
            
            # 5. Missing Value Handling
            await mm.update_step("data_cleaning", "missing_values", "running")
            missing_before = df.isnull().sum().sum()
            df = await asyncio.to_thread(missing_handler.handle_missing_values, df, feature_types, target_col, mode=mode)
            missing_after = df.isnull().sum().sum()
            await mm.update_step("data_cleaning", "missing_values", "completed")
            
            imputed_count = int(missing_before - missing_after)
            method = "KNNImputer" if mode == "deep" and imputed_count > 0 else "Statistical Imputation (Mean/Median)"
            msg = f"Imputed {imputed_count} missing values using {method}."
            await mm.add_log("data_cleaning", msg)
            if imputed_count > 0: 
                cleaning_actions.append(msg)
                await mm.add_step_insight("data_cleaning", f"Data sparsity addressed. Imputed {imputed_count} values using {method} to maintain dataset volume.")
            
            # 6. Pipeline Build
            await mm.update_step("data_cleaning", "scaling", "running")
            current_numerical = df.select_dtypes(include=['number']).columns.tolist()
            current_categorical = df.select_dtypes(include=['object', 'category']).columns.tolist()
            
            if target_col in current_numerical: current_numerical.remove(target_col)
            if target_col in current_categorical: current_categorical.remove(target_col)
                
            pipeline_scaler = scaler.get_scaling_strategy(algo_type=task_type)
            # Scaling logic is fast, but let's keep it safe
            pipeline = await asyncio.to_thread(pipeline_builder.build_pipeline, current_numerical, current_categorical, scaler=pipeline_scaler)
            
            await mm.update_step("data_cleaning", "scaling", "completed")
            msg = f"Standardized features using {pipeline_scaler} scaling for {len(current_numerical)} numerical columns."
            await mm.add_log("data_cleaning", msg)
            cleaning_actions.append(msg)
            
            # 7. Split Data
            await mm.update_step("data_cleaning", "splitting", "running")
            X_train, X_test, y_train, y_test = await asyncio.to_thread(splitter.split_data, df, target_col, task_type)
            await mm.update_step("data_cleaning", "splitting", "completed")
            await mm.add_log("data_cleaning", "Split data into training and testing sets (80/20 ratio).")
            
            # 8. Save Artifacts
            await mm.update_step("data_cleaning", "saving", "running")
            train_df = pd.concat([X_train, y_train], axis=1) if X_train is not None else None
            test_df = pd.concat([X_test, y_test], axis=1) if X_test is not None else None
            
            if train_df is not None:
                # Update DataManager Cache
                data_manager.update_cache(file_id, train_df, "train")
                if test_df is not None:
                    data_manager.update_cache(file_id, test_df, "test")

                # Persistent Save (Hybrid: Parquet for speed, CSV for compatibility)
                train_p_parquet = os.path.join(settings.DATASET_DIR, f"{file_id}_train.parquet")
                train_p_csv = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
                
                train_df.to_parquet(train_p_parquet, index=False)
                train_df.to_csv(train_p_csv, index=False)
                
                if test_df is not None:
                    test_p_parquet = os.path.join(settings.DATASET_DIR, f"{file_id}_test.parquet")
                    test_p_csv = os.path.join(settings.DATASET_DIR, f"{file_id}_test.csv")
                    test_df.to_parquet(test_p_parquet, index=False)
                    test_df.to_csv(test_p_csv, index=False)
            
            pipeline_path = os.path.join(settings.DATASET_DIR, f"{file_id}_pipeline.pkl")
            joblib.dump(pipeline, pipeline_path)
            
            # 9. Final Metadata Update
            metadata.update({
                "target_column": target_col,
                "task_type": task_type,
                "numerical_features": current_numerical,
                "categorical_features": current_categorical,
                "clean_rows": len(df),
                "cleaning_actions": cleaning_actions # Store for report section 3
            })
            await mm.save(metadata)
            
            await mm.update_step("data_cleaning", "saving", "completed")
            await mm.update_phase("cleaning", "completed")
            
            report = {"initial_rows": initial_rows, "final_rows": len(df), "success": True}
            return success_response(data=report)

        except Exception as e:
            logger.error(f"Cleaning Service Failure: {e}", exc_info=True)
            return error_response(f"Cleaning failed: {str(e)}")
