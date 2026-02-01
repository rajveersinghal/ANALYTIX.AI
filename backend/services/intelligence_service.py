"""
Intelligence service
Business logic for intent detection, recommendations, insights, and explanations
"""

import pandas as pd
from typing import Dict, Any, List, Optional

from backend.db.models import MLModel, Dataset
from core.modules import insights
from intelligence import recommendations, insights_narrator, explainability, report_generator


def detect_intent(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Detect user intent from dataset
    Returns: Intent detection results
    """
    # Use intent recommender from core modules
    from src.core.intent_recommender import IntentRecommender
    
    recommendations_list = IntentRecommender.recommend_intents(df)
    
    return {
        "recommended_intents": recommendations_list,
        "primary_intent": recommendations_list[0] if recommendations_list else None
    }


def generate_recommendations(
    dataset: Dataset,
    ml_model: Optional[MLModel] = None
) -> List[str]:
    """
    Generate business recommendations
    Returns: List of recommendation strings
    """
    # Load data
    df = pd.read_csv(dataset.file_path)
    
    # Get top features if model exists
    top_features = []
    if ml_model and ml_model.feature_names:
        top_features = ml_model.feature_names[:5]  # Top 5 features
    
    # Generate recommendations
    recs = recommendations.generate_business_recommendations(top_features)
    
    return recs


def generate_insights(
    ml_model: MLModel,
    dataset: Dataset
) -> Dict[str, Any]:
    """
    Generate AI-powered insights
    Returns: Dictionary with insights
    """
    # Load data
    df = pd.read_csv(dataset.file_path)
    
    # Load model
    from backend.services.ml_service import load_model_from_disk
    model = load_model_from_disk(ml_model.model_path)
    
    # Generate insights
    models_dict = {ml_model.model_type: model}
    top_feature = insights.generate_insights(
        models_dict,
        ml_model.feature_names,
        ml_model.problem_type,
        None,  # X_test
        None   # y_test
    )
    
    return {
        "top_feature": top_feature,
        "model_type": ml_model.model_type,
        "problem_type": ml_model.problem_type,
        "feature_count": len(ml_model.feature_names)
    }


def explain_model_predictions(
    ml_model: MLModel,
    dataset: Dataset,
    num_samples: int = 100
) -> Dict[str, Any]:
    """
    Generate SHAP explanations for model
    Returns: Explanation data
    """
    # Load data
    df = pd.read_csv(dataset.file_path)
    
    # Load model
    from backend.services.ml_service import load_model_from_disk
    model = load_model_from_disk(ml_model.model_path)
    
    # Prepare data (use subset for SHAP)
    X = df[ml_model.feature_names].head(num_samples)
    
    # Generate SHAP explanations
    # Note: explainability.explain_model_global uses streamlit, 
    # so we'll return a simplified version
    try:
        import shap
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X)
        
        # Get feature importance
        feature_importance = {}
        if isinstance(shap_values, list):
            # Multi-class
            shap_vals = shap_values[0]
        else:
            shap_vals = shap_values
        
        importance = abs(shap_vals).mean(axis=0)
        for i, feat in enumerate(ml_model.feature_names):
            feature_importance[feat] = float(importance[i])
        
        return {
            "method": "SHAP",
            "feature_importance": feature_importance,
            "samples_analyzed": len(X)
        }
    except Exception as e:
        return {
            "error": f"SHAP explanation failed: {str(e)}",
            "feature_importance": {}
        }


def generate_report(
    dataset: Dataset,
    ml_model: Optional[MLModel] = None
) -> str:
    """
    Generate HTML report
    Returns: HTML string
    """
    # Load data
    df = pd.read_csv(dataset.file_path)
    
    # Collect stats
    stats = report_generator.collect_deep_stats(df)
    
    # Get quality score
    from core.modules.data_quality import calculate_readiness_score
    q_score, q_exp = calculate_readiness_score(df)
    
    # Get model metrics if available
    best_metrics = {}
    if ml_model:
        best_metrics = ml_model.metrics
    
    # Generate recommendations
    recs = generate_recommendations(dataset, ml_model)
    
    # Generate HTML report
    html = report_generator.generate_html_report(
        dataset.name,
        stats,
        best_metrics,
        [],  # alerts
        recs,
        q_score,
        q_exp
    )
    
    return html
