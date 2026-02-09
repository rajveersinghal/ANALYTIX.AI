import json
import os
import datetime
from app.config import settings

class MetadataManager:
    def __init__(self, dataset_id: str):
        self.dataset_id = dataset_id
        # Ensure directory exists (Settings does this but MetadataManager stays robust)
        self.dir_path = settings.METADATA_DIR
        os.makedirs(self.dir_path, exist_ok=True)
        self.path = os.path.join(self.dir_path, f"{dataset_id}.json")

    def load(self):
        if not os.path.exists(self.path):
            return self.create_default()
        try:
            with open(self.path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if not data:
                    return self.create_default()
                return data
        except Exception as e:
            from app.logger import logger
            logger.error(f"Failed to load metadata for {self.dataset_id}: {e}")
            # DO NOT call create_default here as it would overwrite the corrupted file
            # returning a minimal dict to avoid full crash but preserving the file for inspection
            return {"dataset_id": self.dataset_id, "error": "Metadata corrupted"}

    def create_default(self):
        # Default Structure
        data = {
            "dataset_id": self.dataset_id,
            "created_at": str(datetime.datetime.now()),
            "last_updated": str(datetime.datetime.now()),
            "execution_mode": "fast", # Default
            "pipeline_state": {
                "data_understanding": "pending",
                "data_cleaning": "pending",
                "eda": "pending",
                "statistics": "pending",
                "modeling": "pending",
                "explainability": "pending",
                "decision": "pending",
                "report": "pending"
            },
            "artifacts": {
                "raw_data": None,
                "clean_data": None,
                "model": None,
                "report": None
            },
            "errors": {}
        }
        self.save(data)
        return data

    def _clean_nan(self, obj):
        import numpy as np
        if isinstance(obj, dict):
            return {k: self._clean_nan(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._clean_nan(x) for x in obj]
        elif isinstance(obj, (float, np.float32, np.float64)):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        elif isinstance(obj, (int, np.int32, np.int64)):
            return int(obj)
        elif isinstance(obj, (np.bool_)):
            return bool(obj)
        return obj

    def save(self, data):
        data["last_updated"] = str(datetime.datetime.now())
        clean_data = self._clean_nan(data)
        
        # Atomic Write: Write to tmp then rename
        tmp_path = f"{self.path}.tmp"
        try:
            with open(tmp_path, "w", encoding='utf-8') as f:
                json.dump(clean_data, f, indent=4)
            
            # Replace old file with new one
            if os.path.exists(self.path):
                os.remove(self.path)
            os.rename(tmp_path, self.path)
        except Exception as e:
            from app.logger import logger
            logger.error(f"Failed to save metadata: {e}")
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def update_phase(self, phase: str, status: str, details: str = None):
        data = self.load()
        if "pipeline_state" not in data:
            data = self.create_default()
            
        data["pipeline_state"][phase] = status
        if status == "failed" and details:
            if "errors" not in data: data["errors"] = {}
            data["errors"][phase] = details
            
        self.save(data)

    def update_artifact(self, key: str, path: str):
        data = self.load()
        if "artifacts" not in data:
             data["artifacts"] = {}
        data["artifacts"][key] = path
        self.save(data)
        
    def set_mode(self, mode: str):
        data = self.load()
        data["execution_mode"] = mode
        self.save(data)
        
    def update_config(self, key: str, value: str):
        data = self.load()
        data[key] = value
        self.save(data)
        
    def update_step(self, phase: str, step: str, status: str):
        """Replaces ProcessTracker. Updates sub-step status within a phase."""
        data = self.load()
        if "steps" not in data: data["steps"] = {}
        if phase not in data["steps"]: data["steps"][phase] = {}
        
        data["steps"][phase][step] = status
        self.save(data)

    def add_log(self, phase: str, message: str):
        """Replaces ProcessExplainer. Appends a log message to a phase."""
        data = self.load()
        if "logs" not in data: data["logs"] = {}
        if phase not in data["logs"]: data["logs"][phase] = []
        
        if message not in data["logs"][phase]:
            data["logs"][phase].append(message)
        self.save(data)

    def get_state(self):
        return self.load()
