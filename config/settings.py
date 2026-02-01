"""
Application Settings and Configuration

This module contains all application-level configuration settings.
"""

import os
from pathlib import Path

# Base Directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Data Directories
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = DATA_DIR / "models"

# Logs Directory
LOGS_DIR = BASE_DIR / "logs"

# Create directories if they don't exist
for directory in [DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR, LOGS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Model Settings
MODEL_RANDOM_STATE = int(os.getenv("MODEL_RANDOM_STATE", "42"))
MODEL_TEST_SIZE = float(os.getenv("MODEL_TEST_SIZE", "0.2"))
MODEL_CV_FOLDS = int(os.getenv("MODEL_CV_FOLDS", "5"))

# Database Settings
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DATA_DIR}/analytix.db")

# Streamlit Page Configuration
PAGE_TITLE = "ANALYTIX.AI - Decision Intelligence System"
PAGE_ICON = "🚀"
LAYOUT = "wide"

# Feature Engineering Settings
MAX_FEATURES = int(os.getenv("MAX_FEATURES", "100"))
VARIANCE_THRESHOLD = float(os.getenv("VARIANCE_THRESHOLD", "0.01"))

# Logging Settings
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_FILE = LOGS_DIR / "analytix.log"

# Application Version
APP_VERSION = "5.0.0"
