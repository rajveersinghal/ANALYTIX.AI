"""
Data processing API endpoints
Quality checks, cleaning, EDA, feature engineering
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any

from backend.database import get_db
from backend.dependencies import get_current_active_user, verify_trial_access
from backend.db.models import User, Dataset
from backend.services.data_service import (
    run_quality_check,
    clean_dataset,
    generate_eda_visualizations,
    apply_feature_engineering
)

router = APIRouter(prefix="/processing", tags=["Data Processing"])


class QualityCheckResponse(BaseModel):
    """Quality check response"""
    score: float
    explanation: str


class FeatureEngineeringRequest(BaseModel):
    """Feature engineering request"""
    target_column: str
    optimize_accuracy: bool = False


@router.post("/{dataset_id}/quality-check", response_model=QualityCheckResponse)
async def quality_check(
    dataset_id: str,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Run quality assessment on dataset
    - Checks data readiness
    - Returns quality score and explanation
    """
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    try:
        score, explanation = run_quality_check(dataset)
        return {
            "score": score,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running quality check: {str(e)}"
        )


@router.post("/{dataset_id}/clean")
async def clean_data(
    dataset_id: str,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Auto-clean dataset
    - Handles missing values
    - Fixes skewness
    - Updates dataset with cleaned version
    """
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    try:
        cleaned_dataset = clean_dataset(dataset, db)
        return {
            "message": "Dataset cleaned successfully",
            "dataset_id": cleaned_dataset.id,
            "is_cleaned": cleaned_dataset.is_cleaned
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cleaning dataset: {str(e)}"
        )


@router.post("/{dataset_id}/eda")
async def generate_eda(
    dataset_id: str,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Generate EDA visualizations
    - Summary statistics
    - Missing values analysis
    - Data type information
    """
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    try:
        eda_results = generate_eda_visualizations(dataset)
        return eda_results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating EDA: {str(e)}"
        )


@router.post("/{dataset_id}/feature-engineering")
async def feature_engineering(
    dataset_id: str,
    request: FeatureEngineeringRequest,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Apply feature engineering
    - Feature selection
    - Feature creation
    - Encoding and scaling
    """
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    try:
        engineered_dataset = apply_feature_engineering(
            dataset,
            request.target_column,
            request.optimize_accuracy,
            db
        )
        return {
            "message": "Feature engineering completed",
            "dataset_id": engineered_dataset.id,
            "file_path": engineered_dataset.file_path
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in feature engineering: {str(e)}"
        )
