# app/services/modeling_service.py
import os
import pandas as pd
import json
import joblib
from app.config import settings
from app.logger import logger
from app.core.modeling import problem_router, model_registry, trainer, model_selector, model_persistence
from app.utils.response_schema import success_response, error_response
from app.utils.metadata_manager import MetadataManager

class ModelingService:
    def run_automl(self, file_id: str, mode: str = "fast", task_type: str = None):
        """
        Runs AutoML Pipeline:
        1. Load Processed Clean Data
        2. Load Phase 2 Pipeline (Preprocessor)
        3. Train Models
        4. Select Best
        5. Save Final Pipeline (Preprocessor + Model)
        """
        logger.info(f"Starting AutoML process for dataset {file_id} (Mode: {mode})")
        
        try:
            # Unified Metadata Manager
            mm = MetadataManager(file_id)
            metadata = mm.load()
            mm.update_phase("modeling", "running")
            
            # 1. Load Data
            mm.update_step("modeling", "loading", "running")
            
            train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
            if not os.path.exists(train_path):
                 return error_response("Cleaned training data not found. Run cleaning first.")
                 
            df_train = pd.read_csv(train_path)
            
            # VALIDATION
            if df_train.empty:
                raise ValueError("Training data is empty. Please check the cleaning step.")
            if len(df_train) < settings.MIN_SAMPLES_MODELING:
                raise ValueError(f"Not enough data for reliable modeling (found {len(df_train)} rows, need {settings.MIN_SAMPLES_MODELING}).")
            
            target_col = metadata.get("target_column")
            if not target_col:
                 raise ValueError("Target column not defined. Please select a target first.")
            if target_col not in df_train.columns:
                 raise ValueError(f"Target column '{target_col}' missing from training data.")
            
            X = df_train.drop(columns=[target_col])
            y = df_train[target_col]
            
            mm.update_step("modeling", "loading", "completed")
            mm.add_log("modeling", f"Loaded {len(X)} samples for training.")
            
            # Load Preprocessor (if exists)
            pipeline_path = os.path.join(settings.DATASET_DIR, f"{file_id}_pipeline.pkl")
            preprocessor = joblib.load(pipeline_path) if os.path.exists(pipeline_path) else None
            
            if preprocessor:
                try:
                    # Specialized Handling: Some tasks (Forecasting) might need different fitting
                    X_transformed = preprocessor.fit_transform(X)
                except Exception as e:
                    logger.error(f"Preprocessor fit_transform failed: {e}")
                    X_transformed = X.select_dtypes(include=['number'])
            else:
                X_transformed = X.select_dtypes(include=['number'])
                
            mode_config = settings.EXECUTION_MODES.get(mode, settings.EXECUTION_MODES["fast"])
            cv_folds = mode_config.get("cv_folds", 2)
            enable_fallback = mode_config.get("enable_fallback_model", False)
            
            mm.add_log("modeling", f"Running '{mode}' mode in domain: {metadata.get('domain', 'general')}")

            mm.update_step("modeling", "problem_detection", "running")
            # Force detected problem type to the user selected one if provided
            problem_type = task_type or problem_router.detect_problem_type(metadata)
            mm.update_step("modeling", "problem_detection", "completed")
            mm.add_log("modeling", f"Task: {problem_type} for Target: {target_col}")
            
            # 3. Training
            mm.update_step("modeling", "model_selection", "running")
            candidates = model_registry.get_fast_models(problem_type)
            mm.update_step("modeling", "model_selection", "completed")
            
            mm.update_step("modeling", "training", "running")
            # For Clustering, we don't use y
            if problem_type == "clustering":
                results = trainer.train_and_evaluate(candidates, X_transformed, None, problem_type, cv=cv_folds)
            else:
                results = trainer.train_and_evaluate(candidates, X_transformed, y, problem_type, cv=cv_folds)
            
            if enable_fallback and results and problem_type in ['regression', 'classification']:
                best_score = results[0]['mean_score']
                threshold = 0.0 if problem_type == 'regression' else 0.5
                if best_score < threshold:
                     mm.add_log("modeling", "Entering fallback mode for better performance.")
                     from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
                     fallback = {"Random Forest": RandomForestRegressor(n_estimators=50) if problem_type == 'regression' else RandomForestClassifier(n_estimators=50)}
                     results.extend(trainer.train_and_evaluate(fallback, X_transformed, y, problem_type, cv=cv_folds))
            
            mm.update_step("modeling", "training", "completed")
            mm.add_log("modeling", f"Trained {len(results)} candidate models.")

            # 4. Evaluation
            mm.update_step("modeling", "evaluation", "running")
            best_model_info = model_selector.select_best_model(results)
            if not best_model_info: raise ValueError("No valid models trained.")
            # NaN Safeguard
            import numpy as np
            for r in results:
                if np.isnan(r.get('mean_score', 0)): r['mean_score'] = 0.0
            
            leaderboard = [{"model": r['model_name'], "score": round(r['mean_score'], 4)} for r in results]
            mm.update_step("modeling", "evaluation", "completed")
            mm.add_log("modeling", f"Selected best model: {best_model_info['model_name']} (Score: {best_model_info['mean_score'] or 0.0:.4f})")
                
            # 5. Save Final Artifacts
            mm.update_step("modeling", "saving", "running")
            from sklearn.pipeline import Pipeline
            final_pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('model', best_model_info['model_obj'])]) if preprocessor else best_model_info['model_obj']
            
            best_model_info['model_obj'] = final_pipeline
            saved_path = model_persistence.save_best_model(file_id, best_model_info)
            
            result_data = {
                "best_model": best_model_info['model_name'],
                "best_score": round(best_model_info['mean_score'], 4),
                "metric": best_model_info['metric'],
                "leaderboard": leaderboard,
                "saved_at": saved_path
            }
            
            # Sync to Central Metadata
            metadata["modeling_results"] = result_data
            mm.save(metadata)
            
            mm.update_step("modeling", "saving", "completed")
            mm.update_phase("modeling", "completed")
            return success_response(data=result_data)

        except Exception as e:
            logger.error(f"Modeling Service Failure: {e}", exc_info=True)
            return error_response(f"Modeling failed: {str(e)}")
