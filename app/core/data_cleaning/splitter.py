# app/core/data_cleaning/splitter.py
from sklearn.model_selection import train_test_split
import pandas as pd

def split_data(df: pd.DataFrame, target_col: str, problem_type: str):
    """
    Splits data into Train/Test.
    Stratified if Classification.
    Random if Regression.
    """
    if target_col and target_col in df.columns:
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        stratify = y if problem_type == "classification" else None
        
        try:
             X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=stratify
            )
             return X_train, X_test, y_train, y_test
        except ValueError:
            # Fallback if stratification fails (e.g. single class)
             X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
             return X_train, X_test, y_train, y_test
            
    return df, None, None, None # Should not happen if target exists
