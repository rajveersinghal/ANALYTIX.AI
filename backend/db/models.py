"""
MongoDB Document Models
Beanie ODM models for MongoDB collections
"""

from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class PlanType(str, Enum):
    """Subscription plan types"""
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class User(Document):
    """User collection"""
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    full_name: str
    is_active: bool = True
    is_verified: bool = False
    plan: PlanType = PlanType.FREE
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"


class OnboardingData(Document):
    """Onboarding data collection"""
    user_id: str
    goal: str
    experience_level: str
    dataset_choice: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "onboarding_data"


class Dataset(Document):
    """Dataset collection"""
    user_id: str
    name: str
    filename: str
    file_path: str
    file_size: int
    rows: int
    columns: int
    column_names: List[str]
    column_types: Dict[str, str]
    missing_values: int
    fingerprint: str
    quality_score: Optional[float] = None
    is_processed: bool = False
    is_cleaned: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "datasets"


class MLModel(Document):
    """ML Model collection"""
    user_id: str
    dataset_id: str
    name: str
    model_type: str
    problem_type: str
    target_column: str
    model_path: str
    feature_names: List[str]
    metrics: Dict[str, Any]
    training_config: Dict[str, Any] = {}
    is_deployed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "ml_models"


class Prediction(Document):
    """Prediction collection (Time-Series)"""
    model_id: str
    input_data: Dict[str, Any]
    prediction: Any
    confidence: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "predictions"
        timeseries = {
            "timeField": "created_at",
            "metaField": "model_id",
            "granularity": "seconds"
        }


class Experiment(Document):
    """Experiment tracking collection"""
    user_id: str
    dataset_id: str
    name: str
    description: Optional[str] = None
    parameters: Dict[str, Any] = {}
    metrics: Dict[str, Any] = {}
    artifacts: Dict[str, str] = {}
    status: str = "running"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Settings:
        name = "experiments"


class Session(Document):
    """User session collection"""
    user_id: str
    token: str
    refresh_token: Optional[str] = None
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "sessions"
