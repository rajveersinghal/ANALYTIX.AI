# app/services/explainability_service.py
import os
import json
from app.config import settings
from app.logger import logger
from app.utils.metadata_manager import MetadataManager
import pandas as pd
import numpy as np
from app.utils.response_schema import success_response, error_response

class ExplainabilityService:
    def __init__(self):
        # Placeholder for sub-components (shap, importance etc)
        pass

    def get_global_explanation(self, file_id: str):
        """
        Extracts feature importances from the trained model using multiple strategies.
        """
        try:
            import joblib
            import numpy as np
            from sklearn.pipeline import Pipeline
            from sklearn.inspection import permutation_importance
            
            model_path = os.path.join(settings.MODEL_DIR, f"{file_id}_model.pkl")
            train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
            
            if not os.path.exists(model_path):
                return {"importances": []}
            
            pipeline = joblib.load(model_path)
            model = pipeline.named_steps['model'] if isinstance(pipeline, Pipeline) else pipeline
            
            # 1. Try to get features from model itself (best source of truth)
            if hasattr(model, "feature_names_in_"):
                feature_names = model.feature_names_in_.tolist()
            else:
                # Fallback to metadata
                mm = MetadataManager(file_id)
                metadata = mm.load()
                feature_names = metadata.get("numerical_features", []) # Assuming numericals are what HGB sees
            
            importances_list = []
            
            # Strategy A: Standard feature_importances_
            if hasattr(model, "feature_importances_"):
                vals = model.feature_importances_
                if len(feature_names) == len(vals):
                    for name, val in zip(feature_names, vals):
                        importances_list.append({"feature": name, "importance": float(val)})
            
            # Strategy B: Permutation Importance (Fall-back/Validation)
            if not importances_list and os.path.exists(train_path):
                df = pd.read_csv(train_path)
                mm = MetadataManager(file_id)
                metadata = mm.load()
                target = metadata.get("target_column")
                
                # Sample the whole dataframe to keep X and y aligned
                df_sample = df.sample(min(200, len(df)), random_state=42)
                X = df_sample.drop(columns=[target]) if target in df_sample.columns else df_sample
                y = df_sample[target] if target in df_sample.columns else None
                
                if y is not None:
                    r = permutation_importance(pipeline, X, y, n_repeats=5, random_state=42)
                    for i, name in enumerate(X.columns):
                        importances_list.append({"feature": name, "importance": float(max(0, r.importances_mean[i]))})

            return {"importances": importances_list}
        except Exception as e:
            logger.error(f"Global Importance Extraction Failed: {e}")
            return {"importances": []}

    def get_shap_values(self, file_id: str):
        """
        Computes SHAP values optimized for Tree models.
        """
        try:
            mm = MetadataManager(file_id)
            metadata = mm.load()
            problem_type = metadata.get("problem_type", "regression")
            
            if problem_type in ["clustering", "anomaly_detection", "optimization"]:
                return {"shap_values": None, "note": f"SHAP not supported for {problem_type}"}
            
            import joblib
            import shap
            import pandas as pd
            import numpy as np
            from sklearn.pipeline import Pipeline
            
            model_path = os.path.join(settings.MODEL_DIR, f"{file_id}_model.pkl")
            train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
            
            if not os.path.exists(model_path) or not os.path.exists(train_path):
                return {"shap_values": None}
            
            pipeline = joblib.load(model_path)
            df = pd.read_csv(train_path)
            target = metadata.get("target_column")
            X = df.drop(columns=[target]) if target in df.columns else df
            
            X_sample = X.sample(min(100, len(X)), random_state=42)
            
            # Optimization: If it's a pipeline, get the model and transform data first
            if isinstance(pipeline, Pipeline):
                preprocessor = pipeline.named_steps.get('preprocessor')
                model = pipeline.named_steps['model']
                if preprocessor:
                    X_transformed = preprocessor.transform(X_sample)
                    # Feature names after preprocessing
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

            # Use TreeExplainer for HGB/RandomForest
            try:
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(X_transformed)
                
                # Handle SHAP output format inconsistencies (classification vs regression)
                if isinstance(shap_values, list): # Multi-class
                    shap_values = shap_values[0]
                elif len(shap_values.shape) == 3: # Some versions return (obs, feat, class)
                    shap_values = shap_values[:, :, 0]
                
                return {
                    "shap_values": shap_values.tolist(),
                    "feature_names": feature_names
                }
            except:
                # Fallback to Kernel/Explainer
                explainer = shap.Explainer(pipeline.predict, X_sample)
                shap_values = explainer(X_sample)
                return {
                    "shap_values": shap_values.values.tolist(),
                    "feature_names": X_sample.columns.tolist()
                }
        except Exception as e:
            logger.error(f"SHAP Computation Failed: {e}")
            return {"shap_values": None}

    def run_explainability(self, file_id: str):
        """
        Orchestrates full explainability pipeline.
        """
        try:
            mm = MetadataManager(file_id)
            metadata = mm.load()
            mm.update_phase("explainability", "running")

            # 1. Global Explanation
            mm.update_step("explainability", "global_importance", "running")
            global_exp = self.get_global_explanation(file_id)
            mm.update_step("explainability", "global_importance", "completed")
            mm.add_log("explainability", "Calculated global feature importance.")
            
            # 2. SHAP Values
            mm.update_step("explainability", "shap_values", "running")
            shap_data = self.get_shap_values(file_id)
            mm.update_step("explainability", "shap_values", "completed")
            mm.add_log("explainability", "Computed SHAP values for prediction impact.")
                
            results = {
                "global_explanation": global_exp,
                "shap_analysis": shap_data
            }
            
            # Sync to Metadata
            metadata["explainability_results"] = results
            mm.save(metadata)
            mm.update_phase("explainability", "completed")
            
            return success_response(data=results)
            
        except Exception as e:
            logger.error(f"Explainability Service Failure: {e}")
            return error_response(f"Explainability failed: {str(e)}")
