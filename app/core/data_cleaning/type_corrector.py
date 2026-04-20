# app/core/data_cleaning/type_corrector.py
import pandas as pd
import numpy as np
import re

def correct_types(df: pd.DataFrame, feature_types: dict) -> pd.DataFrame:
    """
    Ensures columns match their detected types.
    Handles common data science hurdles like ranges and special chars in numeric columns.
    """
    df = df.copy()
    
    # 1. Strip column names (Prevents " Price " vs "Price" issues)
    df.columns = [c.strip() for c in df.columns]
    
    # 2. Robust Numeric Conversion
    for col in feature_types.get("numerical_features", []):
         if col in df.columns:
             # Handle Bangalore House Price 'ranges' (e.g., '2100 - 2850')
             if df[col].dtype == 'object':
                 def handle_range(val):
                     if not isinstance(val, str): return val
                     # Check for range: '1440 - 2100'
                     if '-' in val:
                         parts = val.split('-')
                         try:
                             return (float(parts[0].strip()) + float(parts[1].strip())) / 2
                         except:
                             return np.nan
                     # Remove any non-numeric except dot
                     val = re.sub(r'[^\d.]', '', val)
                     try:
                         return float(val) if val else np.nan
                     except:
                         return np.nan
                 
                 df[col] = df[col].apply(handle_range)
             
             # Fallback standard conversion
             df[col] = pd.to_numeric(df[col], errors='coerce')
             
    # 3. Ensure Datetime
    for col in feature_types.get("datetime_features", []):
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
            
    return df
