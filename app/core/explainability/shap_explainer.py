# app/core/explainability/shap_explainer.py
try:
    import shap
    sh_available = True
except ImportError:
    sh_available = False
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

def compute_shap_values(model, X_train, X_sample):
    """
    Computes SHAP values with a Lite fallback if shap is not installed.
    """
    estimator = model
    if isinstance(model, Pipeline):
        estimator = model.named_steps.get('model', model.steps[-1][1])
    
    model_type = type(estimator).__name__
    
    # CASE 1: SHAP IS AVAILABLE
    if sh_available:
        explainer = None
        # Tree Explainer
        if any(x in model_type for x in ['RandomForest', 'GradientBoosting', 'XGB', 'Tree', 'CatBoost', 'LGBM']):
            try:
                explainer = shap.TreeExplainer(estimator)
            except: pass
                 
        # Linear Explainer
        if not explainer and any(x in model_type for x in ['Linear', 'Logistic', 'Ridge', 'Lasso']):
            try:
                explainer = shap.LinearExplainer(estimator, X_train)
            except: pass
                
        # Kernel Explainer
        if not explainer:
            try:
                background = shap.kmeans(X_train, 10) if len(X_train) > 100 else X_train
                explainer = shap.KernelExplainer(estimator.predict, background)
            except: pass
            
        if explainer:
            try:
                shap_values = explainer.shap_values(X_sample)
                if isinstance(shap_values, list) and len(shap_values) >= 2:
                    shap_values = shap_values[1]
                elif isinstance(shap_values, list):
                    shap_values = shap_values[0]
                return shap_values, getattr(explainer, 'expected_value', 0)
            except Exception as e:
                print(f"SHAP failed: {e}")

    # CASE 2: LITE FALLBACK (No SHAP installed or it failed)
    print("Using ANALYTIX.AI Lite Explainer fallback.")
    try:
        # Try feature_importances_ (Trees)
        if hasattr(estimator, 'feature_importances_'):
            importances = estimator.feature_importances_
        # Try coef_ (Linear)
        elif hasattr(estimator, 'coef_'):
            importances = np.abs(estimator.coef_).flatten()
        else:
            # Random fallback if all fails
            importances = np.ones(X_sample.shape[1]) / X_sample.shape[1]
            
        # Normalize/Scale to create "Pseudo-SHAP" for the UI
        # We assume effect is importances * (X_sample - mean) or just importances
        # To make it truly row-specific for the demo:
        # effect = (X_sample.iloc[0] - X_train.mean()) * importances
        
        # Simple version: use importances but signed by the direction of the value relative to mean
        means = X_train.mean()
        row = X_sample.iloc[0] if isinstance(X_sample, pd.DataFrame) else X_sample[0]
        signs = np.sign(row - means)
        
        # Pseudo SHAP values
        pseudo_shap = importances * signs.values
        return [pseudo_shap], 0.0
    except Exception as e:
        print(f"Lite Explainer failed: {e}")
        return None, None
