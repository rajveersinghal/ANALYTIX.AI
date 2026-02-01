"""
MongoDB Configuration
Settings for MongoDB connection and application configuration
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "ANALYTIX.AI"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "analytix_ai_prod"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:3000"
    ]
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MODEL_DIR: str = "models"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_EXTENSIONS: List[str] = ["csv", "xlsx", "xls"]
    
    # Trial
    TRIAL_DURATION_DAYS: int = 14
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
