from typing import List, Tuple, Optional, Union
import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler, LabelEncoder, PolynomialFeatures
from sklearn.feature_selection import SelectKBest, mutual_info_classif, mutual_info_regression, RFE
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from modules.utils import Logger, safe_execution
import streamlit as st

@safe_execution
def robust_feature_selection(df: pd.DataFrame) -> pd.DataFrame:
    """
    Applies guardrails to remove problematic features before engineering.
    
    Removes:
    - ID columns (>95% unique values)
    - Constant columns (only 1 unique value)
    - Columns with >95% missing values
    
    Args:
        df: Input DataFrame
        
    Returns:
        pd.DataFrame with problematic columns removed
        
    Side Effects:
        Logs removed columns to Decision Log
    """
    df_clean = df.copy()
    removed_cols = []
    
    # 1. Remove ID columns (>95% unique)
    for col in df_clean.columns:
        if df_clean[col].nunique() > 0.95 * len(df_clean):
            removed_cols.append(f"{col} (ID column)")
            df_clean = df_clean.drop(columns=[col])
    
    # 2. Remove constant columns
    for col in df_clean.columns:
        if df_clean[col].nunique() == 1:
            removed_cols.append(f"{col} (constant)")
            df_clean = df_clean.drop(columns=[col])
    
    # 3. Remove columns with >95% missing
    for col in df_clean.columns:
        missing_pct = (df_clean[col].isnull().sum() / len(df_clean)) * 100
        if missing_pct > 95:
            removed_cols.append(f"{col} ({missing_pct:.1f}% missing)")
            df_clean = df_clean.drop(columns=[col])
    
    if removed_cols:
        Logger.log(f"🛡️ Guardrails: Removed {len(removed_cols)} problematic features: {', '.join(removed_cols[:5])}")
    else:
        Logger.log("✅ Guardrails: No problematic features detected")
    
    return df_clean


@safe_execution
def select_best_features_accuracy(df: pd.DataFrame, target_col: str, problem_type: str, n_features: int = 10) -> pd.DataFrame:
    """
    Selects features that DIRECTLY maximize model performance using RFE.
    
    This is the "Precision Mode" - uses Recursive Feature Elimination with a 
    Random Forest estimator to identify the exact subset of features that 
    contribute most to prediction accuracy.
    
    Args:
        df: Input DataFrame with all features and target.
        target_col: Name of the target variable column.
        problem_type: Either "Regression" or "Classification".
        n_features: Number of top features to select (default: 10).
        
    Returns:
        pd.DataFrame containing only selected features + target column.
        
    Side Effects:
        - Logs progress to Decision Log
        - Displays spinner in Streamlit UI
        
    Note:
        This is computationally expensive for large datasets (>5000 rows).
        Uses n_jobs=-1 for parallel processing.
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    # Use a fast estimator for RFE
    if problem_type == "Regression":
        estimator = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42, n_jobs=-1)
    else:
        estimator = RandomForestClassifier(n_estimators=50, max_depth=5, random_state=42, n_jobs=-1)
        
    Logger.log(f"🎯 Accuracy Mode: Running Recursive Feature Elimination (RFE) for top {n_features} features...")
    
    with st.spinner("Finding best features for Maximum Accuracy..."):
        selector = RFE(estimator, n_features_to_select=n_features, step=1)
        selector = selector.fit(X, y)
        
        selected_cols = X.columns[selector.support_].tolist()
        Logger.log(f"🏆 Best Features Found: {len(selected_cols)} features selected for peak performance.")
        
        df_final = df[selected_cols + [target_col]].copy()
        return df_final

@safe_execution
def engineer_features(df: pd.DataFrame, target_col: Optional[str] = None, problem_type: str = "Classification", optimize_accuracy: bool = False) -> pd.DataFrame:
    """
    Standardized Feature Engineering pipeline: Encoding -> Scaling -> Interactions -> AI Selection.
    Includes an 'Optimization' mode for peak accuracy.
    """
    df_processed = df.copy()
    
    # 0. Date Feature Extraction
    date_cols = df_processed.select_dtypes(include=['datetime64']).columns
    for col in date_cols:
        if col != target_col:
            df_processed[f"{col}_year"] = df_processed[col].dt.year
            df_processed[f"{col}_month"] = df_processed[col].dt.month
            df_processed[f"{col}_day"] = df_processed[col].dt.day
            df_processed = df_processed.drop(columns=[col]) 
            Logger.log(f"✔ Feature Engineering: Extracted Year/Month/Day from '{col}'.")
    
    # Re-scan column types
    cols_to_transform = [c for c in df_processed.columns if c != target_col]
    cat_cols = [c for c in cols_to_transform if df_processed[c].dtype == 'object']
    
    # 1. Handle Categoricals
    if cat_cols:
        low_card_cols = [c for c in cat_cols if df_processed[c].nunique() < 20]
        high_card_cols = [c for c in cat_cols if df_processed[c].nunique() >= 20]
        
        if low_card_cols:
             df_processed = pd.get_dummies(df_processed, columns=low_card_cols, drop_first=True)
             Logger.log(f"✔ Applied One-Hot Encoding to {len(low_card_cols)} features.")
             
        if high_card_cols:
             for col in high_card_cols:
                 freq_map = df_processed[col].value_counts(normalize=True)
                 df_processed[col] = df_processed[col].map(freq_map)
             Logger.log(f"🛡️ Shield: Applied Frequency Encoding to high-cardinality features: {high_card_cols}")

    # 2. Scaling (Robust Scaler)
    numeric_cols = [c for c in df_processed.columns if c != target_col and pd.api.types.is_numeric_dtype(df_processed[c])]
    if numeric_cols:
        scaler = RobustScaler()
        df_processed[numeric_cols] = scaler.fit_transform(df_processed[numeric_cols])
        Logger.log("✔ Applied RobustScaler (Outlier-safe) to numeric features.")
        
    # 3. Interaction Terms (Accuracy Boost)
    if len(numeric_cols) >= 2 and len(df_processed) < 2000: 
        try:
            poly = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
            subset_cols = numeric_cols[:5] 
            interactions = poly.fit_transform(df_processed[subset_cols])
            interaction_names = poly.get_feature_names_out(subset_cols)
            interaction_df = pd.DataFrame(interactions, columns=interaction_names, index=df_processed.index)
            new_features = [c for c in interaction_names if c not in subset_cols]
            
            if new_features:
                 df_processed = pd.concat([df_processed, interaction_df[new_features]], axis=1)
                 Logger.log(f"🚀 Boosting: Created {len(new_features)} interaction features.")
        except Exception as e:
            Logger.log(f"⚠️ Interaction skipped: {e}")

    # 4. Feature Selection
    if target_col and target_col in df_processed.columns:
        # A. Advanced Optimization Mode (User Requested)
        if optimize_accuracy:
            return select_best_features_accuracy(df_processed, target_col, problem_type)
            
        # B. Standard Statistical Mode (MI)
        X = df_processed.drop(columns=[target_col])
        y = df_processed[target_col]
        k_best = min(20, int(X.shape[1] * 0.8))
        k_best = max(k_best, 1)
        
        if X.shape[1] > k_best:
            try:
                metric = mutual_info_regression if problem_type == "Regression" else mutual_info_classif
                selector = SelectKBest(score_func=metric, k=k_best)
                X_new = selector.fit_transform(X, y)
                selected_columns = X.columns[selector.get_support()].tolist()
                
                df_final = pd.DataFrame(X_new, columns=selected_columns, index=df_processed.index)
                df_final[target_col] = y
                return df_final
            except Exception as e:
                Logger.log(f"⚠️ Selection fallback: {e}")
                
    return df_processed
