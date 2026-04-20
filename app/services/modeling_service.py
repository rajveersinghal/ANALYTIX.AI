# app/services/modeling_service.py
import os
import pandas as pd
import numpy as np
import json
import joblib
from app.config import settings
from app.logger import logger
from app.core.modeling import problem_router, model_registry, trainer, model_selector, model_persistence
from app.utils.response_schema import success_response, error_response
from app.utils.metadata_manager import MetadataManager
from app.utils.data_manager import data_manager

class ModelingService:
    async def run_automl(self, file_id: str, mode: str = "fast", task_type: str = None, user_id: str = None, project_id: str = None, overrides: dict = None):
        """
        Runs AutoML Pipeline with Expert Mode support.
        """
        logger.info(f"Starting AutoML process for dataset {file_id} (Mode: {mode}, Expert: {bool(overrides)})")
        
        try:
            # Unified Metadata Manager
            mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
            metadata = await mm.load()
            await mm.update_phase("modeling", "running")
            
            # 1. Load Data
            await mm.update_step("modeling", "loading", "running")
            
            # Use DataManager (Cache-first)
            df_train = data_manager.get_dataframe(file_id, "train")
            
            if df_train is None:
                train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
                if not os.path.exists(train_path):
                     return error_response("Cleaned training data not found. Run cleaning first.")
                df_train = pd.read_csv(train_path)
                data_manager.update_cache(file_id, df_train, "train")
            
            # VALIDATION
            if df_train.empty:
                raise ValueError("Training data is empty. Please check the cleaning step.")
            if len(df_train) < settings.MIN_SAMPLES_MODELING:
                raise ValueError(f"Not enough data for reliable modeling (found {len(df_train)} rows, need {settings.MIN_SAMPLES_MODELING}).")
            
            target_col = (overrides or {}).get("target_column") or metadata.get("target_column")
            if not target_col:
                 raise ValueError("Target column not defined. Please select a target first.")
            if target_col not in df_train.columns:
                 raise ValueError(f"Target column '{target_col}' missing from training data.")
            
            X = df_train.drop(columns=[target_col])
            y = df_train[target_col]
            
            await mm.update_step("modeling", "loading", "completed")
            await mm.add_log("modeling", f"Loaded {len(X)} samples for training.")
            
            # Load Preprocessor (if exists)
            pipeline_path = os.path.join(settings.DATASET_DIR, f"{file_id}_pipeline.pkl")
            preprocessor = joblib.load(pipeline_path) if os.path.exists(pipeline_path) else None
            
            if preprocessor:
                try:
                    # Specialized Handling: Some tasks (Forecasting) might need different fitting
                    X_transformed = preprocessor.fit_transform(X)
                except Exception as e:
                    logger.error(f"ModelingService: Preprocessor fit_transform failed: {e}")
                    # EMERGENCY FALLBACK: Only keep columns that are already numeric or have low cardinality
                    X_transformed = X.select_dtypes(include=['number'])
                    if X_transformed.empty:
                        # If no numbers, try to just use anything and hope the model handles it (e.g. HistGradient)
                        X_transformed = X.copy()
            else:
                # No preprocessor at all - try to keep just numbers as a safe base
                X_transformed = X.select_dtypes(include=['number'])
                if X_transformed.empty:
                     X_transformed = X.copy()
                
            # SAFETY CHECK: Automated Imputation Fallback
            def has_nulls(obj):
                if isinstance(obj, pd.DataFrame) or isinstance(obj, pd.Series):
                    return obj.isnull().values.any()
                return np.isnan(obj).any()

            if has_nulls(X_transformed):
                logger.warning(f"Modeling Service: NaNs detected in X_transformed. Performing emergency imputation.")
                if isinstance(X_transformed, pd.DataFrame):
                    X_transformed = X_transformed.fillna(X_transformed.mean().fillna(0))
                else:
                    X_transformed = np.nan_to_num(X_transformed)
            
            # Inf check for numpy or pandas
            if isinstance(X_transformed, pd.DataFrame):
                has_inf = np.isinf(X_transformed.values).any()
            else:
                has_inf = np.isinf(X_transformed).any()

            if has_inf:
                logger.warning(f"Modeling Service: Inf detected in X_transformed. Clipping values.")
                X_transformed = np.nan_to_num(X_transformed, nan=0.0, posinf=1e9, neginf=-1e9)

            if (isinstance(y, pd.Series) and y.isnull().any()) or (not isinstance(y, pd.Series) and np.isnan(y).any()):
                logger.warning(f"Modeling Service: NaNs detected in target variable. Dropping invalid rows.")
                if isinstance(y, pd.Series):
                    mask = y.notnull()
                    y = y[mask]
                    X_transformed = X_transformed[mask] if isinstance(X_transformed, pd.DataFrame) else X_transformed[mask.values]
                else:
                    mask = ~np.isnan(y)
                    y = y[mask]
                    X_transformed = X_transformed[mask]
                
            mode_config = settings.EXECUTION_MODES.get(mode, settings.EXECUTION_MODES["fast"])
            cv_folds = (overrides or {}).get("cv_folds") or mode_config.get("cv_folds", 2)
            enable_fallback = mode_config.get("enable_fallback_model", False)
            
            await mm.add_log("modeling", f"Running '{mode}' mode in domain: {metadata.get('domain', 'general')}")

            await mm.update_step("modeling", "problem_detection", "running")
            # Force detected problem type to the user selected one if provided
            problem_type = (overrides or {}).get("task_type") or task_type or problem_router.detect_problem_type(metadata)
            await mm.update_step("modeling", "problem_detection", "completed")
            await mm.add_log("modeling", f"Task: {problem_type} for Target: {target_col}")
            logger.info(f"ModelingService: Final training shapes - X: {X_transformed.shape}, y: {len(y) if y is not None else 0}")
            
            if len(X_transformed) == 0:
                 raise ValueError("Dataset is empty after cleaning. Please check for missing values in your target column.")

            # 3. Training
            await mm.update_step("modeling", "model_selection", "running")
            # Expert Mode: Filter candidates if user selected specific ones
            if overrides and overrides.get("selected_models"):
                 full_candidates = model_registry.get_deep_models(problem_type) if mode == "deep" else model_registry.get_fast_models(problem_type)
                 candidates = {k: v for k, v in full_candidates.items() if k in overrides["selected_models"]}
                 if not candidates:
                      logger.warning(f"No models from {overrides['selected_models']} found for task {problem_type}. Using defaults.")
                      candidates = full_candidates
            else:
                candidates = model_registry.get_deep_models(problem_type) if mode == "deep" else model_registry.get_fast_models(problem_type)
                
            await mm.update_step("modeling", "model_selection", "completed")
            
            import asyncio
            await mm.update_step("modeling", "training", "running")
            # For Clustering, we don't use y
            if problem_type == "clustering":
                results = await asyncio.to_thread(trainer.train_and_evaluate, candidates, X_transformed, None, problem_type, cv=cv_folds)
            else:
                results = await asyncio.to_thread(trainer.train_and_evaluate, candidates, X_transformed, y, problem_type, cv=cv_folds)
            
            if enable_fallback and results and problem_type in ['regression', 'classification']:
                best_score = results[0]['mean_score']
                threshold = 0.0 if problem_type == 'regression' else 0.5
                if best_score < threshold:
                     await mm.add_log("modeling", "Entering fallback mode for better performance.")
                     from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
                     fallback = {"Random Forest": RandomForestRegressor(n_estimators=50) if problem_type == 'regression' else RandomForestClassifier(n_estimators=50)}
                     results.extend(trainer.train_and_evaluate(fallback, X_transformed, y, problem_type, cv=cv_folds))
            
            await mm.update_step("modeling", "training", "completed")
            await mm.add_log("modeling", f"Trained {len(results)} candidate models.")

            # 4. Evaluation
            await mm.update_step("modeling", "evaluation", "running")
            best_model_info = model_selector.select_best_model(results)
            if not best_model_info: raise ValueError("No valid models trained.")
            # NaN Safeguard
            leaderboard = [{"model": r['model_name'], "score": round(r.get('mean_score', 0), 4), "time": r.get('training_time', 0)} for r in results]
            await mm.update_step("modeling", "evaluation", "completed")
            await mm.add_log("modeling", f"Selected best model: {best_model_info['model_name']} (Score: {best_model_info['mean_score'] or 0.0:.4f})")
                
            # 5. Save Final Artifacts
            await mm.update_step("modeling", "saving", "running")
            from sklearn.pipeline import Pipeline
            final_pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', best_model_info['model_obj'])]) if preprocessor else best_model_info['model_obj']
            
            best_model_info['model_obj'] = final_pipeline
            saved_path = await model_persistence.save_best_model(file_id, best_model_info)
            
            result_data = {
                "best_model": {
                    "name": best_model_info['model_name'],
                    "accuracy": round(best_model_info['mean_score'] * 100, 2) if best_model_info['mean_score'] <= 1.0 else best_model_info['mean_score']
                },
                "metric": best_model_info['metric'],
                "leaderboard": leaderboard,
                "saved_at": saved_path
            }
            
            # Sync to Central Metadata
            metadata["modeling_results"] = result_data
            await mm.save(metadata)
            
            await mm.update_step("modeling", "saving", "completed")
            await mm.update_phase("modeling", "completed")
            return success_response(data=result_data)

        except Exception as e:
            logger.error(f"Modeling Service Failure: {e}", exc_info=True)
            return error_response(f"Modeling failed: {str(e)}")

    async def run_tuning(self, file_id: str, mode: str = "fast", user_id: str = None, project_id: str = None, overrides: dict = None):
        """
        Refines the best model discovered in the AutoML phase.
        1. Fetch Winners from Metadata
        2. Run Hyperparameter Search
        3. Save Final Optimized Pipeline
        """
        logger.info(f"Starting Hyperparameter Tuning for {file_id}")
        import asyncio
        from app.core.modeling import optimizer
        
        try:
            mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
            metadata = await mm.load()
            await mm.update_phase("tuning", "running")

            # 1. Load Training Data
            df_train = data_manager.get_dataframe(file_id, "train")
            if df_train is None: raise ValueError("Training data missing for tuning.")
            
            target = metadata.get("target_column")
            X = df_train.drop(columns=[target])
            y = df_train[target]
            
            # Load Preprocessor & Best Model logic
            res = metadata.get("modeling_results", {})
            best_name = res.get("best_model", {}).get("name")
            if not best_name: raise ValueError("No best model found to tune.")

            # Load full pipeline to extract the model step
            model_path = os.path.join(settings.MODEL_DIR, f"{file_id}_model.pkl")
            if not os.path.exists(model_path): raise ValueError("Final model artifact missing for tuning.")
            
            pipeline_full = joblib.load(model_path)
            from sklearn.pipeline import Pipeline
            
            # Extract internal model and problem type
            internal_model = pipeline_full.steps[-1][1] if isinstance(pipeline_full, Pipeline) else pipeline_full
            pt = metadata.get("problem_type", "regression")
            
            # Use Preprocessor for optimization features
            preprocessor = pipeline_full.steps[0][1] if isinstance(pipeline_full, Pipeline) else None
            X_transformed = preprocessor.transform(X) if preprocessor else X.select_dtypes(include=['number'])

            # 2. RUN OPTIMIZATION (Offload to thread)
            n_iter = 10 if mode == "deep" else 5
            await mm.add_log("tuning", f"Optimizing {best_name} using RandomizedSearchCV ({n_iter} iterations)...")
            
            best_est, best_params = await asyncio.to_thread(optimizer.tune_model, internal_model, X_transformed, y, pt, n_iter=n_iter)
            
            # 3. SAVE FINAL ARTIFACT
            await mm.update_step("tuning", "saving", "running")
            final_pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', best_est)]) if preprocessor else best_est
            
            # Save final refined artifact
            joblib.dump(final_pipeline, model_path)
            
            # Update Metadata with optimized results
            res["best_model"]["params"] = {k: str(v) for k, v in best_params.items()}
            metadata["modeling_results"] = res
            await mm.add_log("tuning", f"Optimization complete. Parameters: {list(best_params.keys())}")
            
            await mm.save(metadata)
            await mm.update_phase("tuning", "completed")
            return success_response(data={"message": "Optimization Complete", "params": best_params})

        except Exception as e:
            logger.error(f"Tuning Service Failure: {e}", exc_info=True)
            await mm.update_phase("tuning", "failed", details=str(e))
            return error_response(f"Tuning failed: {str(e)}")
