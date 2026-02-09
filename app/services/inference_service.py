# app/services/inference_service.py
import os
import pandas as pd
from app.config import settings
from app.logger import logger
from app.utils.decision_utils import load_model, MetadataManager

class InferenceService:
    def predict_batch(self, dataset_id: str, input_file_path: str):
        """
        Runs batch inference on a new file using a trained model.
        """
        try:
            # 1. Load Model Pipeline
            model = load_model(dataset_id)
            if not model:
                raise ValueError("No trained model found for this dataset ID.")

            # 2. Load Input Data
            if input_file_path.endswith('.csv'):
                df = pd.read_csv(input_file_path)
            else:
                df = pd.read_excel(input_file_path)

            if df.empty:
                raise ValueError("Input file for inference is empty.")

            # 3. Validation: Ensure required features exist
            # Align input DataFrame columns with the expected features of the model pipeline
            if hasattr(model, 'feature_names_in_'):
                expected_features = model.feature_names_in_
                # Fill missing columns with 0 or default values if necessary, 
                # but better to warn or error if critical columns are missing.
                # Here we just ensure order and handle missing by providing a clear error or using default 0.
                for col in expected_features:
                    if col not in df.columns:
                        logger.warning(f"Feature '{col}' missing in inference data. Filling with 0.")
                        df[col] = 0
                
                df = df[expected_features]
            
            # 4. Generate Predictions
            predictions = model.predict(df)
            
            # 5. Add Predictions to DataFrame
            # We add a generic column name or use the target name from metadata if possible
            mm = MetadataManager(dataset_id)
            metadata = mm.load()
            target_name = metadata.get("target_column", "prediction")
            domain = metadata.get("domain", "general")
            pt = metadata.get("problem_type", "regression")
            
            from app.utils.domain_config import get_unit
            unit = get_unit(domain, pt)
            
            df[f"predicted_{target_name}"] = predictions.round(4)
            
            # 6. Save results
            output_filename = f"{dataset_id}_predictions.csv"
            output_path = os.path.join(settings.REPORT_DIR, output_filename)
            df.to_csv(output_path, index=False)
            
            # Register artifact
            mm.update_artifact("batch_predictions", f"storage/reports/{output_filename}")
            
            # Prepare preview with rounding and units
            preview_df = df.head(10).copy()
            pred_col = f"predicted_{target_name}"
            preview_df[pred_col] = preview_df[pred_col].round(2)
            
            if unit:
                preview_df[f"{pred_col} ({unit})"] = preview_df[pred_col]
            
            return {
                "file_path": f"storage/reports/{output_filename}",
                "row_count": len(df),
                "preview": preview_df.to_dict(orient="records")
            }

        except Exception as e:
            logger.error(f"Batch Inference Failed: {e}")
            raise e
    def list_samples(self):
        """Returns the list of available sample datasets from index."""
        import json
        index_path = os.path.join(settings.STORAGE_DIR, "samples", "samples_index.json")
        if not os.path.exists(index_path):
            return []
        try:
            with open(index_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read samples index: {e}")
            return []
