# app/core/data_cleaning/type_corrector.py
import pandas as pd

def correct_types(df: pd.DataFrame, feature_types: dict) -> pd.DataFrame:
    """
    Ensures columns match their detected types.
    """
    df = df.copy()
    
    # Ensure numericals are numeric
    for col in feature_types.get("numerical_features", []):
         if col in df.columns:
             df[col] = pd.to_numeric(df[col], errors='coerce')
             
    # Ensure datetime
    for col in feature_types.get("datetime_features", []):
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
            
    return df
