import os
import asyncio
import pandas as pd
import gc
import psutil
from app.config import settings
from app.logger import logger
from app.utils.decision_utils import load_model, MetadataManager

class InferenceService:
    def _check_memory_safety(self):
        """Pre-flight check to ensure we have enough RAM for operations."""
        ram_percent = psutil.virtual_memory().percent
        if ram_percent > 92:
            logger.error(f"System memory critical ({ram_percent}%). Aborting heavy task.")
            raise MemoryError("System RAM is nearly exhausted. Try again after some time.")
        return True

    async def predict_batch(self, dataset_id: str, input_file_path: str):
        """
        Runs batch inference on a new file with memory-safe cleanup.
        """
        import numpy as np
        try:
            self._check_memory_safety()
            
            # 1. Load Model Pipeline
            model = await asyncio.to_thread(load_model, dataset_id)
            if not model:
                raise ValueError("No trained model found for this dataset ID.")

            # 2. Load Input Data
            df = await asyncio.to_thread(pd.read_csv if input_file_path.endswith('.csv') else pd.read_excel, input_file_path)

            if df.empty:
                raise ValueError("Input file for inference is empty.")

            # 3. Validation: Ensure required features exist
            if hasattr(model, 'feature_names_in_'):
                expected_features = model.feature_names_in_
                for col in expected_features:
                    if col not in df.columns:
                        df[col] = 0
                df = df[expected_features]
            
            # 4. Generate Predictions
            predictions = await asyncio.to_thread(model.predict, df)
            
            # 5. Add Predictions to DataFrame
            mm = MetadataManager(dataset_id)
            metadata = await mm.load()
            target_name = metadata.get("target_column", "prediction")
            
            df[f"predicted_{target_name}"] = np.round(predictions, 4)
            
            # 6. Save results
            output_filename = f"{dataset_id}_predictions.csv"
            output_path = os.path.join(settings.REPORT_DIR, output_filename)
            await asyncio.to_thread(df.to_csv, output_path, index=False)
            
            # Register artifact
            await mm.update_artifact("batch_predictions", f"storage/reports/{output_filename}")
            
            result = {
                "file_path": f"storage/reports/{output_filename}",
                "row_count": len(df),
                "sample_results": df.head(10).to_dict(orient="records")
            }
            
            # 7. CRITICAL: Cleanup for long-running stability
            del model
            del df
            gc.collect() 
            
            return result

        except Exception as e:
            logger.error(f"Batch Inference Failed: {e}")
            gc.collect() # Cleanup even on failure
            raise e

    async def predict_single(self, dataset_id: str, inputs: dict):
        """
        Runs prediction for a single row with thread-pool optimization.
        """
        try:
            # We don't bother checking RAM status for single rows, usually safe
            model = await asyncio.to_thread(load_model, dataset_id)
            if not model:
                raise ValueError("No trained model found.")

            df = pd.DataFrame([inputs])

            # Validation: Ensure required features exist
            if hasattr(model, 'feature_names_in_'):
                expected_features = model.feature_names_in_
                for col in expected_features:
                    if col not in df.columns:
                        df[col] = 0
                df = df[expected_features]

            prediction = await asyncio.to_thread(model.predict, df)
            prediction = prediction[0]
            
            mm = MetadataManager(dataset_id)
            metadata = await mm.load()
            pt = metadata.get("problem_type", "regression")
            
            import time
            res = {}
            if pt == "classification":
                if hasattr(model, "predict_proba"):
                    proba = model.predict_proba(df)[0]
                    res = {
                        "prediction": str(prediction),
                        "confidence": float(max(proba)),
                        "probabilities": {str(c): float(p) for c, p in zip(model.classes_, proba)},
                        "lastUpdated": time.time()
                    }
                else:
                    res = {"prediction": str(prediction), "lastUpdated": time.time()}
            else:
                res = {
                    "prediction": float(round(prediction, 4)),
                    "lastUpdated": time.time()
                }
            
            # Minimal cleanup for single predictions
            del model
            return res

        except Exception as e:
            logger.error(f"Single Prediction Failed: {e}")
            raise e

    async def list_samples(self):
        """Returns the list of available sample datasets from index."""
        import json
        index_path = os.path.join(settings.STORAGE_DIR, "samples", "samples_index.json")
        if not os.path.exists(index_path):
            return []
        try:
            # Simple synchronous read is fine for small metadata files
            with open(index_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read samples index: {e}")
            return []
