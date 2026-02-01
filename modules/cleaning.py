import pandas as pd
import numpy as np
from modules.utils import Logger

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Automatically cleans the dataset by handling missing values and removing duplicates.
    
    Cleaning Strategy:
    - Removes duplicate rows
    - Fills missing numeric values with column mean
    - Fills missing categorical values with mode (or 'Unknown' if no mode)
    
    Args:
        df: Input DataFrame to clean.
        
    Returns:
        pd.DataFrame with duplicates removed and missing values filled.
        
    Side Effects:
        Logs all cleaning actions to the Decision Log.
    """
    df_clean = df.copy()
    
    # 1. Remove Duplicates
    initial_rows = len(df_clean)
    df_clean = df_clean.drop_duplicates()
    if len(df_clean) < initial_rows:
        Logger.log(f"✔ Removed {initial_rows - len(df_clean)} duplicate rows.")
    
    # 2. Handle Missing Values
    # Numeric -> Mean
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df_clean[col].isnull().sum() > 0:
            df_clean[col] = df_clean[col].fillna(df_clean[col].mean())
            Logger.log(f"✔ Filled missing values in '{col}' with mean.")
            
    # Categorical -> Mode
    cat_cols = df_clean.select_dtypes(include=['object', 'category']).columns
    for col in cat_cols:
        if df_clean[col].isnull().sum() > 0:
            if not df_clean[col].mode().empty:
                df_clean[col] = df_clean[col].fillna(df_clean[col].mode()[0])
            else:
                df_clean[col] = df_clean[col].fillna("Unknown")
            Logger.log(f"✔ Filled missing values in '{col}' with mode.")
            
    return df_clean

def handle_skewness(df: pd.DataFrame) -> pd.DataFrame:
    """
    Automatic Skewness Detection & Correction for numeric features.
    
    Transformation Strategy:
    - If |skew| > 1 and all values positive: Apply log1p transformation
    - If |skew| > 1 and all values non-negative: Apply sqrt transformation
    - Otherwise: No transformation
    
    Args:
        df: Input DataFrame with numeric columns to transform.
        
    Returns:
        pd.DataFrame with skewed columns transformed.
        
    Side Effects:
        Logs all transformations to the Decision Log.
        
    Note:
        Only applies to numeric columns (float64, int64).
    """
    df_skew = df.copy()
    numeric_cols = df_skew.select_dtypes(include=['float64', 'int64']).columns
    
    for col in numeric_cols:
        skew_val = df_skew[col].skew()
        
        if abs(skew_val) > 1:
            # Check for positivity before log
            if (df_skew[col] > 0).all():
                df_skew[col] = np.log1p(df_skew[col])
                Logger.log(f"✔ Applied Log1p transformation to '{col}' (skew={skew_val:.2f}).")
            else:
                # Fallback to Sqrt if non-negative
                if (df_skew[col] >= 0).all():
                     df_skew[col] = np.sqrt(df_skew[col])
                     Logger.log(f"✔ Applied Sqrt transformation to '{col}' (skew={skew_val:.2f}).")
                     
    return df_skew
