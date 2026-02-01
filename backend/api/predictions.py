"""
Prediction API endpoints
Single predictions, batch predictions, what-if analysis
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.dependencies import get_current_active_user, verify_trial_access
from backend.db.models import User, MLModel, Prediction
from backend.models.prediction import (
    PredictionRequest,
    BatchPredictionRequest,
    PredictionResponse,
    BatchPredictionResponse,
    WhatIfRequest,
    WhatIfResponse
)
from backend.services.ml_service import make_prediction, make_batch_predictions

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/single", response_model=PredictionResponse)
async def single_prediction(
    request: PredictionRequest,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Make single prediction
    - Loads model
    - Processes input
    - Returns prediction with confidence
    """
    # Get model
    model = db.query(MLModel).filter(
        MLModel.id == request.model_id,
        MLModel.user_id == current_user.id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    try:
        prediction, confidence = make_prediction(model, request.input_data, db)
        
        # Get the prediction record
        pred_record = db.query(Prediction).filter(
            Prediction.model_id == model.id
        ).order_by(Prediction.created_at.desc()).first()
        
        return {
            "prediction_id": pred_record.id,
            "model_id": model.id,
            "prediction": prediction,
            "confidence": confidence,
            "created_at": pred_record.created_at
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error making prediction: {str(e)}"
        )


@router.post("/batch", response_model=BatchPredictionResponse)
async def batch_prediction(
    request: BatchPredictionRequest,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Make batch predictions
    - Processes multiple inputs at once
    - Returns list of predictions
    """
    # Get model
    model = db.query(MLModel).filter(
        MLModel.id == request.model_id,
        MLModel.user_id == current_user.id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    try:
        predictions = make_batch_predictions(model, request.input_data, db)
        
        return {
            "model_id": model.id,
            "predictions": predictions,
            "total": len(predictions)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error making batch predictions: {str(e)}"
        )


@router.post("/whatif", response_model=WhatIfResponse)
async def whatif_analysis(
    request: WhatIfRequest,
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    What-if analysis
    - Varies one feature across a range
    - Shows how predictions change
    """
    # Get model
    model = db.query(MLModel).filter(
        MLModel.id == request.model_id,
        MLModel.user_id == current_user.id
    ).first()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    try:
        results = []
        
        # Make predictions for each value in range
        for value in request.variation_range:
            input_data = request.base_input.copy()
            input_data[request.feature_to_vary] = value
            
            prediction, confidence = make_prediction(model, input_data, db)
            
            results.append({
                "value": value,
                "prediction": prediction,
                "confidence": confidence
            })
        
        return {
            "model_id": model.id,
            "feature_varied": request.feature_to_vary,
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in what-if analysis: {str(e)}"
        )


@router.get("/history")
async def prediction_history(
    model_id: str = None,
    limit: int = 50,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get prediction history"""
    query = db.query(Prediction).join(MLModel).filter(
        MLModel.user_id == current_user.id
    )
    
    if model_id:
        query = query.filter(Prediction.model_id == model_id)
    
    predictions = query.order_by(Prediction.created_at.desc()).limit(limit).all()
    
    return {
        "total": len(predictions),
        "predictions": [
            {
                "id": p.id,
                "model_id": p.model_id,
                "prediction": p.prediction,
                "confidence": p.confidence,
                "created_at": p.created_at
            }
            for p in predictions
        ]
    }
