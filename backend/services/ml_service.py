"""
ML service
Business logic for model training, prediction, and model management
"""

import pandas as pd
import pickle
import os
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session

from backend.config import settings
from backend.db.models import Dataset, MLModel, Prediction, Experiment
from core.modules import modeling, model_persistence
from core.modules.prediction_interface import PredictionInterface


def train_models(
    dataset: Dataset,
    target_column: str,
    user_id: str,
    model_name: Optional[str],
    db: Session
) -> Tuple[MLModel, Dict[str, Any]]:
    """
    Train ML models on dataset
    Returns: (MLModel instance, training results)
    """
    # Load data
    df = pd.read_csv(dataset.file_path)
    
    # Detect problem type
    problem_type = modeling.detect_problem_type(df, target_column)
    
    # Validate target
    from core.modules.data_validator import validate_target
    if not validate_target(df, target_column, problem_type):
        raise ValueError(f"Invalid target column: {target_column}")
    
    # Train models
    results, models, feature_names, X_test, y_test = modeling.train_and_evaluate(
        df, target_column, problem_type
    )
    
    # Get best model
    valid_models = [m for m in results if "Baseline" not in m]
    if problem_type == "Regression":
        best_model_name = min(valid_models, key=lambda k: results[k]['RMSE'])
    else:
        metric = "F1 Score" if "F1 Score" in results[valid_models[0]] else "Accuracy"
        best_model_name = max(valid_models, key=lambda k: results[k][metric])
    
    # Get the actual model object
    model_key = best_model_name.replace(" (Optimized)", "")
    best_model_obj = models.get(model_key) or models.get("Gradient Boosting")
    
    # Save model to disk
    model_dir = os.path.join(settings.MODEL_DIR, user_id)
    os.makedirs(model_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_filename = f"model_{timestamp}.pkl"
    model_path = os.path.join(model_dir, model_filename)
    
    with open(model_path, 'wb') as f:
        pickle.dump(best_model_obj, f)
    
    # Create model record
    ml_model = MLModel(
        user_id=user_id,
        dataset_id=dataset.id,
        name=model_name or f"{best_model_name} - {dataset.name}",
        model_type=best_model_name,
        problem_type=problem_type,
        target_column=target_column,
        model_path=model_path,
        feature_names=feature_names,
        metrics=results[best_model_name],
        training_config={
            "dataset_shape": df.shape,
            "trained_at": datetime.utcnow().isoformat()
        },
        is_deployed=False
    )
    
    db.add(ml_model)
    db.commit()
    db.refresh(ml_model)
    
    return ml_model, results


def load_model_from_disk(model_path: str):
    """Load model from disk"""
    with open(model_path, 'rb') as f:
        return pickle.load(f)


def make_prediction(
    ml_model: MLModel,
    input_data: Dict[str, Any],
    db: Session
) -> Tuple[Any, Optional[float]]:
    """
    Make single prediction
    Returns: (prediction, confidence)
    """
    # Load model
    model = load_model_from_disk(ml_model.model_path)
    
    # Prepare input
    input_df = pd.DataFrame([input_data])
    
    # Ensure columns match training features
    for col in ml_model.feature_names:
        if col not in input_df.columns:
            input_df[col] = 0  # Default value for missing features
    
    input_df = input_df[ml_model.feature_names]
    
    # Make prediction
    prediction = model.predict(input_df)[0]
    
    # Get confidence if available (for classifiers)
    confidence = None
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(input_df)[0]
        confidence = float(max(proba))
    
    # Save prediction to database
    pred_record = Prediction(
        model_id=ml_model.id,
        input_data=input_data,
        prediction=float(prediction) if isinstance(prediction, (int, float)) else str(prediction),
        confidence=confidence
    )
    
    db.add(pred_record)
    db.commit()
    db.refresh(pred_record)
    
    return prediction, confidence


def make_batch_predictions(
    ml_model: MLModel,
    input_data_list: List[Dict[str, Any]],
    db: Session
) -> List[Dict[str, Any]]:
    """
    Make batch predictions
    Returns: List of prediction results
    """
    # Load model
    model = load_model_from_disk(ml_model.model_path)
    
    # Prepare input
    input_df = pd.DataFrame(input_data_list)
    
    # Ensure columns match
    for col in ml_model.feature_names:
        if col not in input_df.columns:
            input_df[col] = 0
    
    input_df = input_df[ml_model.feature_names]
    
    # Make predictions
    predictions = model.predict(input_df)
    
    # Get confidences if available
    confidences = None
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(input_df)
        confidences = [float(max(p)) for p in proba]
    
    # Format results
    results = []
    for i, pred in enumerate(predictions):
        result = {
            "input": input_data_list[i],
            "prediction": float(pred) if isinstance(pred, (int, float)) else str(pred),
            "confidence": confidences[i] if confidences else None
        }
        results.append(result)
    
    return results


def get_model_metrics(ml_model: MLModel) -> Dict[str, Any]:
    """Get detailed model metrics"""
    return {
        "model_id": ml_model.id,
        "model_type": ml_model.model_type,
        "problem_type": ml_model.problem_type,
        "metrics": ml_model.metrics,
        "feature_count": len(ml_model.feature_names),
        "features": ml_model.feature_names
    }


def delete_model_files(ml_model: MLModel):
    """Delete model files from disk"""
    if os.path.exists(ml_model.model_path):
        os.remove(ml_model.model_path)
