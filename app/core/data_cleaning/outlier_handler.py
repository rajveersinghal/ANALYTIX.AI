# app/core/data_cleaning/outlier_handler.py
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from app.logger import logger

def handle_outliers(df: pd.DataFrame, numerical_features: list, mode: str = "fast") -> pd.DataFrame:
    """
    Handles outliers using either IQR Capping (Fast) or Isolation Forest (Deep).
    """
    df = df.copy()
    num_cols = [col for col in numerical_features if col in df.columns]
    
    if not num_cols:
        return df

    if mode == "deep":
        try:
            logger.info(f"Running IsolationForest for outlier detection on {len(num_cols)} features.")
            iso = IsolationForest(contamination=0.05, random_state=42)
            # We must drop NaNs for IsolationForest, but they should be handled by now
            preds = iso.fit_predict(df[num_cols].fillna(df[num_cols].median()))
            
            # Instead of dropping, for robustness we might want to cap the 'outliers' 
            # to the 1st/99th percentile or just remove them.
            # Design choice: Remove extreme outliers in deep mode.
            initial_len = len(df)
            df = df[preds == 1]
            removed = initial_len - len(df)
            if removed > 0:
                logger.info(f"IsolationForest removed {removed} outliers.")
            return df
        except Exception as e:
            logger.warning(f"IsolationForest failed, falling back to IQR: {e}")
            mode = "fast"

    if mode == "fast":
        for col in num_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            # Cap values
            df[col] = np.where(df[col] < lower_bound, lower_bound, df[col])
            df[col] = np.where(df[col] > upper_bound, upper_bound, df[col])
        
    return df
