# app/core/data_understanding/target_identifier.py
import pandas as pd
from typing import List, Optional, Tuple

def identify_target(df: pd.DataFrame, numerical_cols: List[str], categorical_cols: List[str], id_cols: List[str]) -> Optional[str]:
    """
    Identifies the possible target column.
    Logic:
    - Hints: 'target', 'label', 'price', 'churn', 'sales'
    - Not an ID column
    """
    hints = ['target', 'label', 'price', 'churn', 'sales', 'class', 'outcome', 'profit', 'revenue']
    
    # Priority 1: Exact hints
    for col in df.columns:
        if col.lower() in hints and col not in id_cols:
            return col
            
    # Priority 2: Partial hints
    for col in df.columns:
        for hint in hints:
            if hint in col.lower() and col not in id_cols:
                return col
                
    # Priority 3: Last column (if simple dataset)
    if df.columns[-1] not in id_cols:
         return df.columns[-1]
         
    return None

def identify_problem_type(df: pd.DataFrame, target_col: Optional[str]) -> str:
    """
    Identifies problem type: Regression, Classification, Clustering, Recommendation.
    """
    if not target_col:
        return "clustering"  # Or potentially recommendation if user overrides
        
    target_series = df[target_col]
    
    # Check for Recommendation (Ranking-like - complicated, simplistic check for now)
    # If target is ratings-like (1-5, 1-10) and we have users/items, potential recommendation.
    # For Phase 1, strictly following rules:
    
    if pd.api.types.is_numeric_dtype(target_series):
        # Check if it's actually classification (binary or few classes encoded as int)
        n_unique = target_series.nunique()
        if n_unique <= 10:
             return "classification" # Binary or Multi-class
        return "regression"
        
    return "classification" # String/Object targets are classification
