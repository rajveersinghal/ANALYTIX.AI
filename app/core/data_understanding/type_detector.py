# app/core/data_understanding/type_detector.py
import pandas as pd
from typing import Dict, List

def detect_feature_types(df: pd.DataFrame) -> Dict[str, List[str]]:
    """
    Classifies columns into Numerical, Categorical, Datetime, or ID.
    Logic:
    - Numeric dtype -> Numerical
    - Object + low cardinality -> Categorical
    - Date-like values -> Datetime
    - Unique per row -> ID (ignored later)
    """
    feature_types = {
        "numerical_features": [],
        "categorical_features": [],
        "datetime_features": [],
        "id_features": []
    }
    
    nrows = len(df)
    
    for col in df.columns:
        # Check for ID (Unique per row and high cardinality, usually string or int)
        if df[col].nunique() == nrows:
            feature_types["id_features"].append(col)
            continue
            
        # Check for Datetime
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            feature_types["datetime_features"].append(col)
            continue
            
        # Check for Numerical
        if pd.api.types.is_numeric_dtype(df[col]):
            feature_types["numerical_features"].append(col)
            continue
            
        # Check for Categorical (Object or Category)
        # Low cardinality heuristic: less than 50 unique values or less than 5% of rows if rows > 1000
        n_unique = df[col].nunique()
        if n_unique < 50 or (nrows > 1000 and n_unique / nrows < 0.05):
             feature_types["categorical_features"].append(col)
             continue
             
        # Fallback to categorical if it's object/string but didn't match ID
        feature_types["categorical_features"].append(col)
        
    return feature_types
