# app/core/eda/target_analysis.py
import pandas as pd

def analyze_target(df: pd.DataFrame, target_col: str, problem_type: str):
    """
    Analyzes target variable distribution.
    """
    insights = []
    
    if not target_col or target_col not in df.columns:
        return insights
        
    if problem_type == "classification":
        # Check imbalance
        counts = df[target_col].value_counts(normalize=True)
        if (counts < 0.2).any(): # Any class less than 20%
             insights.append(f"Class Imbalance detected in target '{target_col}'. Minority class has < 20% share.")
             
    elif problem_type == "regression":
        # Check distribution
        skew = df[target_col].skew()
        if abs(skew) > 1:
            insights.append(f"Target variable '{target_col}' is skewed ({skew:.2f}), which might affect regression models.")
            
    return insights
