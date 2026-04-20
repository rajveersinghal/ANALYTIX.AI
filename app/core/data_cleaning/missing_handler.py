# app/core/data_cleaning/missing_handler.py
import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from app.logger import logger

def handle_missing_values(df: pd.DataFrame, feature_types: dict, target_col: str = None, mode: str = "fast") -> pd.DataFrame:
    """
    Handles missing values based on intelligent AI-driven logic:
    - Target: Drop rows if missing.
    - Categorical: Mode or 'Unknown'.
    - Numerical (Fast Mode): Mean/Median based on percentage.
    - Numerical (Deep Mode): KNNImputer for 5-50% missingness.
    """
    df = df.copy()
    
    # 1. Handle Target
    if target_col and target_col in df.columns:
        df = df.dropna(subset=[target_col])
        
    nrows = len(df)
    if nrows == 0: return df

    # 2. Handle Numerical
    num_cols = [col for col in feature_types.get("numerical_features", []) if col in df.columns]
    
    if num_cols:
        if mode == "deep" and nrows < 50000: # Limit KNN to reasonable size
            try:
                # Use KNN Imputer for columns with significant missingness
                cols_to_impute = []
                for col in num_cols:
                    pct = (df[col].isnull().sum() / nrows) * 100
                    if 5 <= pct <= 50:
                        cols_to_impute.append(col)
                
                if cols_to_impute:
                    logger.info(f"Using KNNImputer for columns: {cols_to_impute}")
                    imputer = KNNImputer(n_neighbors=5)
                    # We need some non-missing columns to help KNN, or just use all num_cols
                    df[num_cols] = imputer.fit_transform(df[num_cols])
            except Exception as e:
                logger.warning(f"KNN Implantation failed, falling back to simple: {e}")
                mode = "fast"

        if mode == "fast" or nrows >= 50000:
            for col in num_cols:
                missing_count = df[col].isnull().sum()
                if missing_count == 0: continue
                
                pct_missing = (missing_count / nrows) * 100
                
                if pct_missing < 5:
                    df[col] = df[col].fillna(df[col].mean())
                elif pct_missing <= 50:
                    df[col] = df[col].fillna(df[col].median())
                else:
                    # > 50%, too much missing data
                    df = df.drop(columns=[col])
                
    # 3. Handle Categorical
    for col in feature_types.get("categorical_features", []):
        if col not in df.columns: continue
        
        if df[col].isnull().sum() > 0:
            # Fill with mode or 'Unknown'
            mode_val = df[col].mode()
            fill_val = mode_val[0] if not mode_val.empty else "Unknown"
            df[col] = df[col].fillna(fill_val)
            
    return df
