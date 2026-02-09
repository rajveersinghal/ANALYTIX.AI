# app/core/data_cleaning/missing_handler.py
import pandas as pd
import numpy as np

def handle_missing_values(df: pd.DataFrame, feature_types: dict, target_col: str = None) -> pd.DataFrame:
    """
    Handles missing values based on logic:
    - Target: Drop rows if missing.
    - Categorical: Mode or 'Unknown'.
    - Numerical: 
        - < 5%: Mean
        - 5-30%: Median
        - > 30%: KNN (simplified to median/constant for Phase 2 speed, or drop if very high)
    """
    df = df.copy()
    
    # 1. Handle Target
    if target_col and target_col in df.columns:
        df = df.dropna(subset=[target_col])
        
    nrows = len(df)
    
    # 2. Handle Numerical
    for col in feature_types.get("numerical_features", []):
        if col not in df.columns: continue
        
        missing_count = df[col].isnull().sum()
        if missing_count == 0: continue
        
        pct_missing = (missing_count / nrows) * 100
        
        if pct_missing < 5:
            df[col] = df[col].fillna(df[col].mean())
        elif pct_missing <= 30:
            df[col] = df[col].fillna(df[col].median())
        else:
            # > 30%, strict rule might be to drop column or advanced imputation.
            # For robustness in this MVP, we'll use Median to avoid losing data, 
            # effectively flagging it. Or if VERY high (>50%), drop col.
            if pct_missing > 50:
                df = df.drop(columns=[col])
            else:
                df[col] = df[col].fillna(df[col].median())
                
    # 3. Handle Categorical
    for col in feature_types.get("categorical_features", []):
        if col not in df.columns: continue
        
        if df[col].isnull().sum() > 0:
            # Fill with mode or 'Unknown'
            mode_val = df[col].mode()
            fill_val = mode_val[0] if not mode_val.empty else "Unknown"
            df[col] = df[col].fillna(fill_val)
            
    return df
