# app/core/data_cleaning/outlier_handler.py
import pandas as pd
import numpy as np

def handle_outliers(df: pd.DataFrame, numerical_features: list) -> pd.DataFrame:
    """
    Caps outliers using IQR method for robustness.
    """
    df = df.copy()
    
    for col in numerical_features:
        if col not in df.columns: continue
        
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        # Cap values
        df[col] = np.where(df[col] < lower_bound, lower_bound, df[col])
        df[col] = np.where(df[col] > upper_bound, upper_bound, df[col])
        
    return df
