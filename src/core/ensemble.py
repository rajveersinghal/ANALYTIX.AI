from typing import Dict, List, Any
import pandas as pd
import numpy as np
from sklearn.ensemble import VotingClassifier, VotingRegressor, StackingClassifier, StackingRegressor
from sklearn.linear_model import LogisticRegression, Ridge
from modules.utils import Logger

def create_voting_ensemble(models: Dict[str, Any], problem_type: str, voting: str = 'soft') -> Any:
    """
    Creates a voting ensemble from multiple models.
    
    Args:
        models: Dictionary of {name: model} pairs.
        problem_type: 'Classification' or 'Regression'.
        voting: 'soft' (probabilities) or 'hard' (majority vote) for classification.
        
    Returns:
        Voting ensemble model.
    """
    estimators = [(name, model) for name, model in models.items()]
    
    if problem_type == "Classification":
        ensemble = VotingClassifier(estimators=estimators, voting=voting, n_jobs=-1)
        Logger.log(f"🎯 Created Voting Classifier ({voting} voting) with {len(models)} models")
    else:
        ensemble = VotingRegressor(estimators=estimators, n_jobs=-1)
        Logger.log(f"🎯 Created Voting Regressor with {len(models)} models")
    
    return ensemble

def create_stacking_ensemble(models: Dict[str, Any], problem_type: str, meta_learner=None) -> Any:
    """
    Creates a stacking ensemble with meta-learner.
    
    Args:
        models: Dictionary of {name: model} pairs (base learners).
        problem_type: 'Classification' or 'Regression'.
        meta_learner: Meta-learner model (default: LogisticRegression or Ridge).
        
    Returns:
        Stacking ensemble model.
    """
    estimators = [(name, model) for name, model in models.items()]
    
    if meta_learner is None:
        meta_learner = LogisticRegression(max_iter=1000) if problem_type == "Classification" else Ridge()
    
    if problem_type == "Classification":
        ensemble = StackingClassifier(
            estimators=estimators,
            final_estimator=meta_learner,
            cv=5,
            n_jobs=-1
        )
        Logger.log(f"🏗️ Created Stacking Classifier with {len(models)} base models")
    else:
        ensemble = StackingRegressor(
            estimators=estimators,
            final_estimator=meta_learner,
            cv=5,
            n_jobs=-1
        )
        Logger.log(f"🏗️ Created Stacking Regressor with {len(models)} base models")
    
    return ensemble

def compare_models(results: Dict[str, Dict[str, float]], problem_type: str) -> pd.DataFrame:
    """
    Creates comparison table of model performances.
    
    Args:
        results: Dictionary of {model_name: {metric: value}}.
        problem_type: 'Classification' or 'Regression'.
        
    Returns:
        DataFrame with model comparison.
    """
    comparison_data = []
    
    for model_name, metrics in results.items():
        row = {'Model': model_name}
        row.update(metrics)
        comparison_data.append(row)
    
    df_comparison = pd.DataFrame(comparison_data)
    
    # Sort by primary metric
    if problem_type == "Classification":
        if 'Accuracy' in df_comparison.columns:
            df_comparison = df_comparison.sort_values('Accuracy', ascending=False)
    else:
        if 'R2' in df_comparison.columns:
            df_comparison = df_comparison.sort_values('R2', ascending=False)
    
    return df_comparison.reset_index(drop=True)

def get_ensemble_feature_importance(ensemble, feature_names: List[str], problem_type: str) -> pd.DataFrame:
    """
    Extracts feature importance from ensemble models.
    
    Args:
        ensemble: Trained ensemble model.
        feature_names: List of feature names.
        problem_type: 'Classification' or 'Regression'.
        
    Returns:
        DataFrame with aggregated feature importances.
    """
    importances = []
    
    # Get importances from each base estimator
    for name, estimator in ensemble.estimators_:
        if hasattr(estimator, 'feature_importances_'):
            importances.append(estimator.feature_importances_)
        elif hasattr(estimator, 'coef_'):
            importances.append(np.abs(estimator.coef_).flatten())
    
    if importances:
        # Average importances
        avg_importance = np.mean(importances, axis=0)
        
        df_importance = pd.DataFrame({
            'Feature': feature_names,
            'Importance': avg_importance
        }).sort_values('Importance', ascending=False)
        
        return df_importance
    
    return pd.DataFrame()
