# app/core/explainability/feature_importance.py
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline

def get_feature_importance(model, feature_names: list):
    """
    Extracts feature importance from Linear or Tree models.
    Returns sorted list of dicts: [{'feature': 'name', 'importance': 0.5}, ...]
    """
    importances = []
    
    # If model is a Pipeline, get the final estimator
    estimator = model
    if isinstance(model, Pipeline):
        estimator = model.named_steps.get('model', model.steps[-1][1])
        
    # 1. Linear Models (Coefficients)
    if hasattr(estimator, 'coef_'):
        # Normalize coefficients (abs value) for relative importance
        # Handle multi-class (coef_ is array of arrays) -> use average or max
        if estimator.coef_.ndim > 1:
            coeffs = np.mean(np.abs(estimator.coef_), axis=0) # Average impact across classes
        else:
            coeffs = np.abs(estimator.coef_)
        
        # Flatten if needed
        coeffs = np.array(coeffs).flatten()
        
        # Check mismatch
        if len(coeffs) != len(feature_names):
             # Try to match length if possible, else return empty or warn
             # This happens if OneHotEncoder increased features but feature_names passed are original
             # We assume feature_names passed here are *transformed* names
             pass
             
        for name, imp in zip(feature_names, coeffs):
            importances.append({"feature": name, "importance": float(imp)})
            
    # 2. Tree Models (Feature Importances)
    elif hasattr(estimator, 'feature_importances_'):
        coeffs = estimator.feature_importances_
        for name, imp in zip(feature_names, coeffs):
            importances.append({"feature": name, "importance": float(imp)})
            
    else:
        # Fallback or unknown model type
        return []
        
    # Sort descending
    importances.sort(key=lambda x: x['importance'], reverse=True)
    
    # Calculate % contribution
    total = sum(i['importance'] for i in importances)
    if total > 0:
        for i in importances:
            i['pct'] = round((i['importance'] / total) * 100, 2)
            
    return importances
