from typing import List, Optional, Union
import pandas as pd
import numpy as np
from modules.utils import Logger
import streamlit as st

def create_mathematical_feature(df: pd.DataFrame, col: str, operation: str) -> pd.DataFrame:
    """
    Creates new feature using mathematical transformation.
    
    Args:
        df: Input DataFrame.
        col: Column to transform.
        operation: 'square', 'sqrt', 'log', 'reciprocal', 'abs'.
        
    Returns:
        DataFrame with new feature added.
    """
    df_new = df.copy()
    new_col_name = f"{col}_{operation}"
    
    if operation == 'square':
        df_new[new_col_name] = df[col] ** 2
    elif operation == 'sqrt':
        df_new[new_col_name] = np.sqrt(np.abs(df[col]))
    elif operation == 'log':
        df_new[new_col_name] = np.log1p(np.abs(df[col]))
    elif operation == 'reciprocal':
        df_new[new_col_name] = 1 / (df[col] + 1e-6)
    elif operation == 'abs':
        df_new[new_col_name] = np.abs(df[col])
    
    Logger.log(f"✨ Created feature: {new_col_name}")
    return df_new

def create_binned_feature(df: pd.DataFrame, col: str, n_bins: int = 5, labels: Optional[List[str]] = None) -> pd.DataFrame:
    """
    Creates binned/categorical version of numeric feature.
    
    Args:
        df: Input DataFrame.
        col: Column to bin.
        n_bins: Number of bins.
        labels: Optional custom labels.
        
    Returns:
        DataFrame with binned feature added.
    """
    df_new = df.copy()
    new_col_name = f"{col}_binned"
    
    try:
        df_new[new_col_name] = pd.qcut(df[col], q=n_bins, labels=labels, duplicates='drop')
        Logger.log(f"📊 Created binned feature: {new_col_name} ({n_bins} bins)")
    except:
        df_new[new_col_name] = pd.cut(df[col], bins=n_bins, labels=labels)
        Logger.log(f"📊 Created binned feature: {new_col_name} ({n_bins} bins)")
    
    return df_new

def create_interaction_feature(df: pd.DataFrame, col1: str, col2: str, operation: str = 'multiply') -> pd.DataFrame:
    """
    Creates interaction feature between two columns.
    
    Args:
        df: Input DataFrame.
        col1: First column.
        col2: Second column.
        operation: 'multiply', 'add', 'subtract', 'divide', 'ratio'.
        
    Returns:
        DataFrame with interaction feature added.
    """
    df_new = df.copy()
    new_col_name = f"{col1}_{operation}_{col2}"
    
    if operation == 'multiply':
        df_new[new_col_name] = df[col1] * df[col2]
    elif operation == 'add':
        df_new[new_col_name] = df[col1] + df[col2]
    elif operation == 'subtract':
        df_new[new_col_name] = df[col1] - df[col2]
    elif operation == 'divide':
        df_new[new_col_name] = df[col1] / (df[col2] + 1e-6)
    elif operation == 'ratio':
        df_new[new_col_name] = df[col1] / (df[col1] + df[col2] + 1e-6)
    
    Logger.log(f"🔗 Created interaction: {new_col_name}")
    return df_new

def create_aggregation_feature(df: pd.DataFrame, cols: List[str], operation: str = 'mean') -> pd.DataFrame:
    """
    Creates aggregation across multiple columns.
    
    Args:
        df: Input DataFrame.
        cols: Columns to aggregate.
        operation: 'mean', 'sum', 'max', 'min', 'std'.
        
    Returns:
        DataFrame with aggregated feature.
    """
    df_new = df.copy()
    new_col_name = f"{operation}_of_{'_'.join(cols[:2])}"
    
    if operation == 'mean':
        df_new[new_col_name] = df[cols].mean(axis=1)
    elif operation == 'sum':
        df_new[new_col_name] = df[cols].sum(axis=1)
    elif operation == 'max':
        df_new[new_col_name] = df[cols].max(axis=1)
    elif operation == 'min':
        df_new[new_col_name] = df[cols].min(axis=1)
    elif operation == 'std':
        df_new[new_col_name] = df[cols].std(axis=1)
    
    Logger.log(f"📈 Created aggregation: {new_col_name}")
    return df_new

def delete_features(df: pd.DataFrame, cols_to_delete: List[str]) -> pd.DataFrame:
    """
    Safely deletes features from DataFrame.
    
    Args:
        df: Input DataFrame.
        cols_to_delete: List of columns to remove.
        
    Returns:
        DataFrame with columns removed.
    """
    df_new = df.copy()
    existing_cols = [c for c in cols_to_delete if c in df_new.columns]
    
    if existing_cols:
        df_new = df_new.drop(columns=existing_cols)
        Logger.log(f"🗑️ Deleted {len(existing_cols)} features: {', '.join(existing_cols)}")
    
    return df_new
