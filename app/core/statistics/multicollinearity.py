# app/core/statistics/multicollinearity.py
import pandas as pd
import numpy as np

# We'll calculate VIF manually or use statsmodels if available. 
# Implementing basic VIF logic using LinearRegression is safer if statsmodels isn't desired heavy dep,
# but we have sklearn. So let's use sklearn to check R^2 for each feature.
# VIF_i = 1 / (1 - R_i^2)

from sklearn.linear_model import LinearRegression

def check_multicollinearity(df: pd.DataFrame, feature_types: dict):
    """
    Calculates Variance Inflation Factor (VIF) for numerical features.
    """
    numerical_cols = [c for c in feature_types.get("numerical_features", []) if c in df.columns]
    
    # Need to handle NaN if any (should be cleaned, but safety check)
    df_num = df[numerical_cols].dropna()
    
    vif_data = []
    
    if len(numerical_cols) < 2:
        return vif_data
        
    for i, col in enumerate(numerical_cols):
        X = df_num.drop(columns=[col])
        y = df_num[col]
        
        try:
            model = LinearRegression().fit(X, y)
            r_squared = model.score(X, y)
            
            if r_squared == 1.0:
                 vif = float('inf')
            else:
                 vif = 1 / (1 - r_squared)
                 
            if vif > 5: # Threshold is usually 5 or 10
                 risk = "High" if vif > 10 else "Moderate"
                 vif_data.append({
                     "feature": col,
                     "vif": round(vif, 2),
                     "risk": risk
                 })
        except:
            pass
            
    return vif_data
