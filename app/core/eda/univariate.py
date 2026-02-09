# app/core/eda/univariate.py
import pandas as pd
import numpy as np

def analyze_univariate(df: pd.DataFrame, feature_types: dict):
    """
    Analyzes numerical features for skewness and range.
    """
    insights = []
    
    # Analyze numericals
    for col in feature_types.get("numerical_features", []):
         if col not in df.columns: continue
         
         skew = df[col].skew()
         mean_val = df[col].mean()
         
         # Rule: Extreme skewness
         if abs(skew) > 1:
             direction = "right" if skew > 0 else "left"
             insights.append(f"Feature '{col}' is highly {direction}-skewed ({skew:.2f}). Consider log transformation.")
             
         # Rule: High variance/range? (simplified)
         
    return insights
