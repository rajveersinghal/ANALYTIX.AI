"""
Intelligence API endpoints
Intent detection, recommendations, insights, SHAP explanations, reports
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any

from backend.database import get_db
from backend.dependencies import get_current_active_user, verify_trial_access
from backend.db.models import User, Dataset, MLModel
from backend.services.intelligence_service import (
    detect_intent,
    generate_recommendations,
    generate_insights,
    explain_model_predictions,
    generate_report
)
import pandas as pd

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])


class IntentDetectionResponse(BaseModel):
    """Intent detection response"""
    recommended_intents: List[str]
    primary_intent: str = None


class RecommendationsResponse(BaseModel):
    """Recommendations response"""
    recommendations: List[str]


class InsightsResponse(BaseModel):
    """Insights response"""
    top_feature: str = None
    model_type: str
    problem_type: str
    feature_count: int


class ExplanationResponse(BaseModel):
    """SHAP explanation response"""
    method: str
    feature_importance: Dict[str, float]
    samples_analyzed: int


@router.post("/{dataset_id}/intent", response_model=IntentDetectionResponse)
async def detect_user_intent(
    dataset_id: str,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Detect user intent from dataset
    - Analyzes dataset characteristics
    - Recommends ML tasks
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
        df = pd.read_csv(dataset.file_path)
        intent_result = detect_intent(df)
        return intent_result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error detecting intent: {str(e)}"
        )


@router.get("/{dataset_id}/recommendations", response_model=RecommendationsResponse)
async def get_recommendations(
    dataset_id: str,
    model_id: str = None,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Generate business recommendations
    - Based on dataset and model
    - Actionable insights
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
    
    ml_model = None
    if model_id:
        ml_model = db.query(MLModel).filter(
            MLModel.id == model_id,
            MLModel.user_id == current_user.id
        ).first()
    
    try:
        recs = generate_recommendations(dataset, ml_model)
        return {"recommendations": recs}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recommendations: {str(e)}"
        )


@router.get("/{model_id}/insights", response_model=InsightsResponse)
async def get_insights(
    model_id: str,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered insights
    - Feature importance
    - Model interpretation
    """
    model = db.query(MLModel).filter(
        MLModel.id == model_id,
        MLModel.user_id == current_user.id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    dataset = db.query(Dataset).filter(Dataset.id == model.dataset_id).first()
    
    try:
        insights = generate_insights(model, dataset)
        return insights
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating insights: {str(e)}"
        )


@router.get("/{model_id}/explain", response_model=ExplanationResponse)
async def explain_model(
    model_id: str,
    num_samples: int = 100,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Generate SHAP explanations
    - Model interpretability
    - Feature contributions
    """
    model = db.query(MLModel).filter(
        MLModel.id == model_id,
        MLModel.user_id == current_user.id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    dataset = db.query(Dataset).filter(Dataset.id == model.dataset_id).first()
    
    try:
        explanation = explain_model_predictions(model, dataset, num_samples)
        return explanation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating explanations: {str(e)}"
        )


@router.get("/{dataset_id}/report", response_class=HTMLResponse)
async def get_report(
    dataset_id: str,
    model_id: str = None,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Generate comprehensive HTML report
    - Dataset analysis
    - Model performance
    - Recommendations
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
    
    ml_model = None
    if model_id:
        ml_model = db.query(MLModel).filter(
            MLModel.id == model_id,
            MLModel.user_id == current_user.id
        ).first()
    
    try:
        html_report = generate_report(dataset, ml_model)
        return HTMLResponse(content=html_report)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating report: {str(e)}"
        )
