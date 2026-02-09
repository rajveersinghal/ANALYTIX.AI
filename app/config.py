# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # 1. App Info
    APP_NAME = "AnalytixAI"
    APP_VERSION = "1.0.0"
    DEBUG = False

    # 2. Base Paths
    # Current file: r:\2026\Project\AnalytixAI\app\config.py
    # BASE_DIR should be r:\2026\Project\AnalytixAI
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # Unified Storage in Root
    STORAGE_DIR = os.path.join(BASE_DIR, "storage")
    
    DATASET_DIR = os.path.join(STORAGE_DIR, "datasets")
    METADATA_DIR = os.path.join(STORAGE_DIR, "metadata")
    MODEL_DIR = os.path.join(STORAGE_DIR, "models")
    REPORT_DIR = os.path.join(STORAGE_DIR, "reports")

    # 3. Execution Limits
    MIN_SAMPLES_MODELING = 30
    MAX_UPLOAD_SIZE_MB = 200
    
    # 4. Pipeline Configuration
    EXECUTION_MODES = {
        "fast": {
            "cv_folds": 2, 
            "enable_fallback_model": False,
            "deep_stats": False
        },
        "deep": {
            "cv_folds": 5,
            "enable_fallback_model": True,
            "deep_stats": True
        }
    }

    def __init__(self):
        # Ensure all storage directories exist
        for path in [self.STORAGE_DIR, self.DATASET_DIR, self.METADATA_DIR, self.MODEL_DIR, self.REPORT_DIR]:
            os.makedirs(path, exist_ok=True)

settings = Settings()
