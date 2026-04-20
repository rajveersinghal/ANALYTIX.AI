# app/api/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = "Analytix Guest"
    tier: Optional[str] = "free"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Session Schemas
class AnalysisSessionBase(BaseModel):
    dataset_id: str
    filename: str
    project_id: Optional[str] = None
    problem_type: Optional[str] = None
    status: str = "pending"

class AnalysisSessionCreate(AnalysisSessionBase):
    user_id: str

class AnalysisSessionResponse(AnalysisSessionBase):
    id: str
    created_at: datetime
    last_updated: datetime
    metadata: Dict[str, Any]

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
