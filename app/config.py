# app/config.py
import os
from dotenv import load_dotenv

load_dotenv(override=True)

class Settings:
    # 1. App Info
    APP_NAME = "AnalytixAI"
    APP_VERSION = "2.1.0" # Hardened Release
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

    # 2. Base Paths
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    
    # Unified Storage in Root
    STORAGE_DIR = os.path.join(BASE_DIR, "storage")
    
    DATASET_DIR = os.path.join(STORAGE_DIR, "datasets")
    METADATA_DIR = os.path.join(STORAGE_DIR, "metadata")
    MODEL_DIR = os.path.join(STORAGE_DIR, "models")
    REPORT_DIR = os.path.join(STORAGE_DIR, "reports")

    # 3. Execution & Scaling Limits
    MIN_SAMPLES_MODELING = 30
    MAX_UPLOAD_SIZE_MB = 150 # Reduced slightly for stability on shared hosts
    MAX_PARALLEL_PIPELINES = int(os.getenv("MAX_PARALLEL_PIPELINES", "2"))
    
    # 4. Pipeline Configuration
    EXECUTION_MODES = {
        "fast": {
            "cv_folds": 2, 
            "enable_fallback_model": False,
            "deep_stats": False
        },
        "deep": {
            "cv_folds": 4, # Reduced from 5 to 4 to save memory/time
            "enable_fallback_model": True,
            "deep_stats": True
        }
    }
    
    # 5. Generative AI
    GENAI_API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GENAI_API_KEY", ""))

    # 5. Security & Persistence (Phase 11)
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "analytix_db")
    
    # CRITICAL: Use a persistent secret from env for stability across restarts
    JWT_SECRET = os.getenv("JWT_SECRET", "analytixai-production-secret-99-fixed")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 Hours

    # 6. Billing (Stripe)
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    def __init__(self):
        # Ensure all storage directories exist
        paths = [self.STORAGE_DIR, self.DATASET_DIR, self.METADATA_DIR, self.MODEL_DIR, self.REPORT_DIR]
        for path in paths:
            try:
                os.makedirs(path, exist_ok=True)
            except Exception as e:
                print(f"Config: Warning - could not create {path}: {e}")

settings = Settings()
