# app/services/explainability_service.py
import os
import json
import joblib
import pandas as pd
import numpy as np
try:
    import shap
    sh_available = True
except ImportError:
    sh_available = False
try:
    from lime import lime_tabular
    lime_available = True
except ImportError:
    lime_available = False
from sklearn.pipeline import Pipeline
from app.config import settings
from app.logger import logger
from app.utils.metadata_manager import MetadataManager
from app.utils.data_manager import data_manager
from app.utils.response_schema import success_response, error_response
import asyncio

class ExplainabilityService:
    async def get_global_explanation(self, file_id: str, **kwargs):
        """
        Extracts feature importances from the trained model using multiple strategies.
        """
        try:
            from sklearn.inspection import permutation_importance
            
            model_path = os.path.join(settings.MODEL_DIR, f"{file_id}_model.pkl")
            train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
            
            if not os.path.exists(model_path):
                return {"feature_importance": {}}
            
            pipeline = joblib.load(model_path)
            model = pipeline.named_steps['model'] if isinstance(pipeline, Pipeline) else pipeline
            
            # 1. Try to get features from model itself
            if hasattr(model, "feature_names_in_"):
                feature_names = model.feature_names_in_.tolist()
            else:
                mm = MetadataManager(file_id, user_id=kwargs.get("user_id"))
                metadata = await mm.load()
                feature_names = metadata.get("numerical_features", [])
            
            importances_list = []
            
            if hasattr(model, "feature_importances_"):
                vals = model.feature_importances_
                if len(feature_names) == len(vals):
                    for name, val in zip(feature_names, vals):
                        importances_list.append({"feature": name, "importance": float(val)})
            
            if not importances_list:
                df = await data_manager.get_dataframe(file_id, "train")
                if df is None and os.path.exists(train_path):
                    df = pd.read_csv(train_path)
                    data_manager.update_cache(file_id, df, "train")

                mm = MetadataManager(file_id, user_id=kwargs.get("user_id"), project_id=kwargs.get("project_id"))
                metadata = await mm.load()
                target = metadata.get("target_column")
                
                df_sample = df.sample(min(200, len(df)), random_state=42)
                X = df_sample.drop(columns=[target]) if target in df_sample.columns else df_sample
                y = df_sample[target] if target in df_sample.columns else None
                
                if y is not None:
                    r = await asyncio.to_thread(permutation_importance, pipeline, X, y, n_repeats=5, random_state=42)
                    for i, name in enumerate(X.columns):
                        importances_list.append({"feature": name, "importance": float(max(0, r.importances_mean[i]))})

            importance_map = {}
            for item in importances_list:
                importance_map[item["feature"]] = item["importance"]
                
            return {"feature_importance": importance_map}
        except Exception as e:
            logger.error(f"Global Importance Extraction Failed: {e}")
            return {"feature_importance": {}}

    async def get_shap_values(self, file_id: str, **kwargs):
        """
        Computes SHAP values optimized for Tree models.
        """
        if not sh_available:
             return {"shap_values": None, "note": "ANALYTIX-Lite: SHAP engine omitted to save space."}
        try:
            mm = MetadataManager(file_id, user_id=kwargs.get("user_id"), project_id=kwargs.get("project_id"))
            metadata = await mm.load()
            problem_type = metadata.get("problem_type", "regression")
            
            if problem_type in ["clustering", "anomaly_detection", "optimization"]:
                return {"shap_values": None, "note": f"SHAP not supported for {problem_type}"}
            
            model_path = os.path.join(settings.MODEL_DIR, f"{file_id}_model.pkl")
            train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
            
            if not os.path.exists(model_path) or not os.path.exists(train_path):
                return {"shap_values": None}
            
            pipeline = joblib.load(model_path)
            
            df = await data_manager.get_dataframe(file_id, "train")
            if df is None:
                df = pd.read_csv(train_path)
                data_manager.update_cache(file_id, df, "train")

            target = metadata.get("target_column")
            X = df.drop(columns=[target]) if target in df.columns else df
            X_sample = X.sample(min(100, len(X)), random_state=42)
            
            if isinstance(pipeline, Pipeline):
                preprocessor = pipeline.named_steps.get('preprocessor')
                model = pipeline.named_steps['model']
                if preprocessor:
                    X_transformed = preprocessor.transform(X_sample)
                    if hasattr(preprocessor, 'get_feature_names_out'):
                        feature_names = preprocessor.get_feature_names_out().tolist()
                    else:
                        feature_names = [f"Feature {i}" for i in range(X_transformed.shape[1])]
                else:
                    X_transformed = X_sample
                    feature_names = X_sample.columns.tolist()
            else:
                model = pipeline
                X_transformed = X_sample
                feature_names = X_sample.columns.tolist()

            try:
                # 1. Preferred: TreeExplainer
                explainer = await asyncio.to_thread(shap.TreeExplainer, model)
                shap_values = await asyncio.to_thread(explainer.shap_values, X_transformed)
                
                if isinstance(shap_values, list): 
                    shap_values = shap_values[1] if len(shap_values) == 2 else shap_values[0]
                elif len(shap_values.shape) == 3:
                     shap_values = shap_values[..., 1] if shap_values.shape[2] == 2 else shap_values[..., 0]
                
                return {
                    "shap_values": shap_values.tolist(),
                    "feature_names": feature_names,
                    "explainer_type": "TreeExplainer"
                }
            except Exception:
                # 2. Fallback: Universal Explainer
                X_bg = await asyncio.to_thread(shap.sample, X_transformed, 50) 
                explainer = await asyncio.to_thread(shap.Explainer, model.predict, X_bg)
                shap_values = await asyncio.to_thread(explainer, X_transformed)
                return {
                    "shap_values": shap_values.values.tolist(),
                    "feature_names": feature_names,
                    "explainer_type": "UniversalExplainer"
                }
        except Exception as e:
            logger.error(f"SHAP Orchestration Failed: {e}")
            return {"shap_values": None}

    async def get_local_explanation(self, file_id: str, instance_idx: int = 0, **kwargs):
        """
        Computes LIME for a specific instance to provide local 'Trust'.
        """
        if not lime_available:
            return {"local_exp": [], "note": "ANALYTIX-Lite: LIME engine omitted to save space."}
        try:
            mm = MetadataManager(file_id, user_id=kwargs.get("user_id"), project_id=kwargs.get("project_id"))
            metadata = await mm.load()
            
            model_path = os.path.join(settings.MODEL_DIR, f"{file_id}_model.pkl")
            pipeline = joblib.load(model_path)
            
            df = await data_manager.get_dataframe(file_id, "train")
            target = metadata.get("target_column")
            X = df.drop(columns=[target]) if target in df.columns else df
            
            # RAM PROTECTION: Sample training data for explainer if too large
            X_lime_bg = X.values
            if len(X) > 500:
                logger.info(f"ExplainabilityService: Sampling LIME background (500/{len(X)})")
                X_lime_bg = X.sample(500, random_state=42).values

            explainer = lime_tabular.LimeTabularExplainer(
                training_data=X_lime_bg,
                feature_names=X.columns.tolist(),
                class_names=['Target'],
                mode='regression' if metadata.get('problem_type') == 'regression' else 'classification'
            )
            
            idx = min(instance_idx, len(X)-1)
            exp = explainer.explain_instance(X.values[idx], pipeline.predict)
            
            return {
                "local_exp": exp.as_list(),
                "intercept": float(exp.intercept[0]) if hasattr(exp, 'intercept') else 0
            }
        except Exception as e:
            logger.error(f"LIME local explanation failed: {e}")
            return {"local_exp": []}

    async def get_dashboard_data(self, file_id: str, **kwargs):
        """
        Retrieves all explainability results in the format expected by the frontend dashboard.
        """
        try:
            mm = MetadataManager(file_id, user_id=kwargs.get("user_id"), project_id=kwargs.get("project_id"))
            metadata = await mm.load()
            
            explain_results = metadata.get("explainability_results")
            if not explain_results:
                logger.info(f"Explainability results missing for {file_id}. Triggering generation.")
                run_res = await self.run_explainability(file_id, **kwargs)
                if isinstance(run_res, dict) and run_res.get("status") == "success":
                    explain_results = run_res.get("data")
                else:
                    return None

            # 1. Transform Feature Importance for Dashboard
            # Dashboard expects: features: [{ name, importance }]
            global_exp = explain_results.get("global_explanation", {})
            feature_importance = global_exp.get("feature_importance", {})
            formatted_features = []
            for name, imp in feature_importance.items():
                formatted_features.append({"name": name, "importance": float(imp)})
            
            # Sort by importance
            formatted_features.sort(key=lambda x: x["importance"], reverse=True)

            # 2. Extract Default Inputs for Simulator
            # Dashboard expects: default_inputs: { col: val }, categorical_options: { col: [options] }
            train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
            raw_path = os.path.join(settings.DATASET_DIR, f"{file_id}.csv")
            default_inputs = {}
            categorical_options = {}
            
            # Target path prioritizes processed train data, fallbacks to raw
            path_to_read = train_path if os.path.exists(train_path) else (raw_path if os.path.exists(raw_path) else None)
            
            if path_to_read:
                try:
                    df = pd.read_csv(path_to_read, nrows=5)
                    target = metadata.get("target_column")
                    X = df.drop(columns=[target]) if target in df.columns else df
                    
                    if not X.empty:
                        # Take the first row as default
                        sample_row = X.iloc[0].to_dict()
                        for k, v in sample_row.items():
                            if pd.isna(v):
                                default_inputs[k] = 0 if X[k].dtype != 'object' else "Unknown"
                            else:
                                if isinstance(v, (np.integer, np.floating)):
                                    default_inputs[k] = float(v)
                                else:
                                    default_inputs[k] = str(v)
                    
                    # Get options for categorical
                    cat_cols = metadata.get("categorical_features", [])
                    for col in cat_cols:
                        if col in X.columns:
                            categorical_options[col] = [str(x) for x in X[col].dropna().unique().tolist()[:20]]
                except Exception as e:
                    logger.error(f"Simulator Data fallback read failed: {e}")

            # 3. Last Resort: Metadata Reconstruction (If files are gone or locked)
            # 3. Strategic Intelligence Layer (Architecture V2)
            from app.core.nlp.insight_engine import insight_engine
            
            # Calculate metrics for logic
            best_model_score = metadata.get("modeling_results", {}).get("best_model", {}).get("accuracy", 0)
            confidence = insight_engine.get_confidence_level(best_model_score / 100) # Convert to 0-1
            
            # Identify High-Level Risks/Opps from feature importance
            risks = insight_engine.detect_risks(feature_importance)
            opportunities = insight_engine.detect_opportunities(feature_importance)
            
            # Generate actionable recommendations from top features
            recommendations = await insight_engine.generate_consulting_recommendations(formatted_features)
            
            dashboard_data = {
                "features": formatted_features,
                "default_inputs": default_inputs,
                "categorical_options": categorical_options,
                "confidence": confidence,
                "risks": risks,
                "opportunities": opportunities,
                "recommendations": recommendations,
                "note": "Intelligence engine decrypted successfully."
            }
            
            res = metadata.get("modeling_results", {})
            if res.get("best_model", {}).get("name") == "Stability Fallback":
                dashboard_data["note"] = "Explainer restricted: Baseline model in use."

            return dashboard_data
        except Exception as e:
            logger.error(f"Failed to fetch explainability dashboard data: {e}", exc_info=True)
            return None

    async def run_explainability(self, file_id: str, user_id: str = None, project_id: str = None, overrides: dict = None):
        """
        Orchestrates full explainability pipeline with Business Brain (Architecture V2).
        """
        try:
            mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
            metadata = await mm.load()
            await mm.update_phase("explain", "running")
            await mm.update_ai_thinking("explainability", "I am deciphering the 'Black Box'. I am using SHAP and LIME to understand why the model makes specific predictions.")

            # 1. Global (What matters overall?)
            await mm.update_step("explainability", "global_importance", "running")
            global_exp = await self.get_global_explanation(file_id, user_id=user_id, project_id=project_id)
            await mm.update_step("explainability", "global_importance", "completed")
            
            # 2. SHAP (How much does each feature contribute?)
            await mm.update_step("explainability", "shap_values", "running")
            shap_data = await self.get_shap_values(file_id, user_id=user_id, project_id=project_id)
            await mm.update_step("explainability", "shap_values", "completed")

            # 3. LIME (Local Trust/Validation)
            await mm.update_step("explainability", "local_explanation", "running")
            local_exp = await self.get_local_explanation(file_id, user_id=user_id, project_id=project_id)
            await mm.update_step("explainability", "local_explanation", "completed")
                
            # 4. NEW: Business Brain Layer
            feature_importance = global_exp.get("feature_importance", {})
            business_brain = []
            for feat, imp in list(feature_importance.items())[:3]:
                business_brain.append({
                    "feature": feat,
                    "meaning": f"'{feat}' is a critical driver for your {metadata.get('target_column')}.",
                    "decision": f"Our analysis suggests that proactively managing '{feat}' could yield significant lift."
                })

            results = {
                "global_explanation": global_exp,
                "shap_analysis": shap_data,
                "local_explanation": local_exp,
                "business_brain": business_brain
            }
            
            metadata["explainability_results"] = results
            await mm.save(metadata)
            
            await mm.add_step_insight("explainability", f"Strategic drivers identified. Focused on top {len(business_brain)} factors for maximum ROI.")
            await mm.update_phase("explain", "completed")
            return success_response(data=results)
            
        except Exception as e:
            logger.error(f"Explainability Failure: {e}")
            return error_response(f"Explainability failed: {str(e)}")
