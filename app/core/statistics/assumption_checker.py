# app/core/statistics/assumption_checker.py
import pandas as pd
from app.core.statistics import normality, multicollinearity

def check_assumptions(df: pd.DataFrame, metadata: dict):
    """
    Checks general statistical assumptions.
    """
    warnings = []
    
    feature_types = {
        "numerical_features": metadata.get("numerical_features", []),
        "categorical_features": metadata.get("categorical_features", [])
    }
    
    # 1. Helper function to check VIF
    vif_results = multicollinearity.check_multicollinearity(df, feature_types)
    for vif in vif_results:
        if vif['risk'] == 'High':
             warnings.append(f"Severe Multicollinearity detected in '{vif['feature']}' (VIF: {vif['vif']}).")
        elif vif['risk'] == 'Moderate':
             warnings.append(f"Moderate Multicollinearity detected in '{vif['feature']}' (VIF: {vif['vif']}).")
             
    # 2. Check Normality for target (if regression)
    target = metadata.get("target_column")
    if target and metadata.get("problem_type") == "regression":
        if target in df.columns:
            norm_res = normality.check_normality(df[target])
            if not norm_res['is_normal']:
                warnings.append(f"Target '{target}' is not normally distributed (p={norm_res['p_value']:.4f}). Linear models may require transformation.")
                
    return warnings
