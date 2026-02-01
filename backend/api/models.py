"""
ML Model API endpoints
Train, list, get metrics, download, delete models
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional

from backend.database import get_db
from backend.dependencies import get_current_active_user, verify_trial_access
from backend.db.models import User, Dataset, MLModel
from backend.models.model import (
    ModelTrainRequest,
    ModelResponse,
    ModelList,
    ModelMetrics,
    ModelTrainResponse
)
from backend.services.ml_service import (
    train_models,
    get_model_metrics,
    delete_model_files
)

router = APIRouter(prefix="/models", tags=["ML Models"])


@router.post("/train", response_model=ModelTrainResponse)
async def train_model(
    request: ModelTrainRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Train ML models on dataset
    - Detects problem type
    - Trains multiple models
    - Saves best model
    - Returns training results
    """
    # Get dataset
    dataset = db.query(Dataset).filter(
        Dataset.id == request.dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    try:
        # Train models (synchronous for now, can be made async with Celery)
        ml_model, results = train_models(
            dataset,
            request.target_column,
            current_user.id,
            request.model_name,
            db
        )
        
        return {
            "job_id": ml_model.id,
            "status": "completed",
            "message": "Model training completed successfully",
            "model_id": ml_model.id
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error training model: {str(e)}"
        )


@router.get("", response_model=ModelList)
async def list_models(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of user's trained models"""
    models = db.query(MLModel).filter(MLModel.user_id == current_user.id).all()
    
    return {
        "total": len(models),
        "models": models
    }


@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get model details"""
    model = db.query(MLModel).filter(
        MLModel.id == model_id,
        MLModel.user_id == current_user.id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    return model


@router.get("/{model_id}/metrics", response_model=ModelMetrics)
async def get_metrics(
    model_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get model performance metrics"""
    model = db.query(MLModel).filter(
        MLModel.id == model_id,
        MLModel.user_id == current_user.id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    try:
        metrics = get_model_metrics(model)
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting metrics: {str(e)}"
        )


@router.get("/{model_id}/download")
async def download_model(
    model_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Download trained model file"""
    model = db.query(MLModel).filter(
        MLModel.id == model_id,
        MLModel.user_id == current_user.id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    import os
    if not os.path.exists(model.model_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model file not found"
        )
    
    return FileResponse(
        path=model.model_path,
        filename=f"{model.name}.pkl",
        media_type="application/octet-stream"
    )


@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete model"""
    model = db.query(MLModel).filter(
        MLModel.id == model_id,
        MLModel.user_id == current_user.id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    # Delete files
    try:
        delete_model_files(model)
    except Exception as e:
        print(f"Error deleting model files: {e}")
    
    # Delete from database
    db.delete(model)
    db.commit()
    
    return None
