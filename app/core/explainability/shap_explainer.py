# app/core/explainability/shap_explainer.py
import shap
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

def compute_shap_values(model, X_train, X_sample):
    """
    Computes SHAP values.
    X_train: Background data (transformed) for KernelExplainer/Linear.
    X_sample: Data to explain (transformed).
    """
    estimator = model
    if isinstance(model, Pipeline):
        estimator = model.named_steps.get('model', model.steps[-1][1])
        
    explainer = None
    
    # 1. Tree Explainer (Fastest for Trees, supports interactions)
    # Check by class name string to avoid importing all libs
    model_type = type(estimator).__name__
    
    if any(x in model_type for x in ['RandomForest', 'GradientBoosting', 'XGB', 'Tree']):
        try:
             explainer = shap.TreeExplainer(estimator)
        except Exception:
             # Fallback if TreeExplainer fails (e.g. sklearn updates)
             pass
             
    # 2. Linear Explainer (Fast for Linear)
    if not explainer and any(x in model_type for x in ['Linear', 'Logistic', 'Ridge', 'Lasso']):
        try:
            # LinearExplainer needs background data sometimes, usually just masker
            explainer = shap.LinearExplainer(estimator, X_train)
        except Exception:
            pass
            
    # 3. Kernel Explainer (Model Agnostic Fallback - Slower)
    if not explainer:
        # Use kmeans summary of background data to speed up
        background = shap.kmeans(X_train, 10) if len(X_train) > 100 else X_train
        explainer = shap.KernelExplainer(estimator.predict, background)
        
    # Compute
    try:
        shap_values = explainer.shap_values(X_sample)
        
        # Handle list output (classification often returns list [class0_shap, class1_shap])
        if isinstance(shap_values, list):
            # For binary classification, usually index 1 is "Positive" class
            # For multi-class, we might need a strategy.
            # Default to index 1 if available, else 0
            if len(shap_values) >= 2:
                shap_values = shap_values[1]
            else:
                shap_values = shap_values[0]
                
        return shap_values, explainer.expected_value
    except Exception as e:
        print(f"SHAP computation failed: {e}")
        return None, None
