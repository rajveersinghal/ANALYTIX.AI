# app/core/eda/bivariate.py
import pandas as pd

def analyze_bivariate(df: pd.DataFrame, feature_types: dict, target_col: str):
    """
    Analyzes relationships primarily involved with the target.
    """
    insights = []
    
    if not target_col or target_col not in df.columns:
        return insights
        
    # Categorical vs Target (Impact)
    if target_col in feature_types.get("numerical_features", []):
        # Target is numerical (Regression)
        for col in feature_types.get("categorical_features", []):
            if col in df.columns:
                # Check variance of target across groups
                try:
                    means = df.groupby(col)[target_col].mean()
                    diff = means.max() - means.min()
                    # Heuristic: If significant spread?
                    insights.append(f"Feature '{col}' creates groups with variation in '{target_col}' (Range: {diff:.2f}). Relevant for prediction.")
                except:
                    pass
                    
    return insights
