from typing import Dict, List, Any, Tuple, Union
import pandas as pd
import numpy as np
from sklearn.metrics import confusion_matrix
import streamlit as st

def analyze_errors(model, X_test: pd.DataFrame, y_test: pd.Series, problem_type: str) -> pd.DataFrame:
    """
    Identifies samples where the model performed poorly (Error Analysis).
    
    For Regression: Returns samples sorted by absolute residual (highest errors first).
    For Classification: Returns only misclassified samples.
    
    Args:
        model: Trained sklearn model with predict() method.
        X_test: Test features DataFrame.
        y_test: True target values.
        problem_type: Either "Regression" or "Classification".
        
    Returns:
        pd.DataFrame with columns:
        - All original features
        - 'Actual': True target value
        - 'Predicted': Model prediction
        - 'Residual' (Regression) or 'Is_Correct' (Classification)
        
    Use Case:
        Identify which specific data points the model struggles with.
    """
    y_pred = model.predict(X_test)
    df_error = X_test.copy()
    df_error['Actual'] = y_test
    df_error['Predicted'] = y_pred
    
    if problem_type == "Regression":
        df_error['Residual'] = np.abs(df_error['Actual'] - df_error['Predicted'])
        df_error = df_error.sort_values(by='Residual', ascending=False)
    else:
        # For classification, 1 = Incorrect, 0 = Correct
        df_error['Is_Correct'] = (df_error['Actual'] == df_error['Predicted']).astype(int)
        df_error = df_error[df_error['Is_Correct'] == 0] # Keep only mismatches
        
    return df_error

def get_top_error_segments(df_errors: pd.DataFrame, problem_type: str) -> List[str]:
    """
    Identifies demographic/categorical segments with disproportionately high errors.
    
    Uses heuristic: If a single category accounts for >40% of all errors,
    it's flagged as a "High Error Segment" (potential bias indicator).
    
    Args:
        df_errors: DataFrame of error samples (output from analyze_errors).
        problem_type: Either "Regression" or "Classification".
        
    Returns:
        List of human-readable insight strings describing error patterns.
        
    Example Output:
        ["🔴 High Error Segment: 65.3% of all errors occur in the Age: >60 segment."]
        
    Use Case:
        Detect if model is systematically failing on specific demographics.
    """
    insights = []
    
    # Analyze categorical columns
    cat_cols = df_errors.select_dtypes(include=['object', 'category']).columns
    for col in cat_cols:
        top_error_val = df_errors[col].value_counts(normalize=True).idxmax()
        top_pct = df_errors[col].value_counts(normalize=True).max()
        if top_pct > 0.4: # If one category accounts for >40% of errors
            insights.append(f"🔴 **High Error Segment**: {top_pct:.1%} of all errors occur in the **{col}: {top_error_val}** segment.")

    if not insights:
        insights.append("✅ No single demographic/category dominates the error count. Errors are distributed evenly.")
        
    return insights

def evaluate_by_segment(df: pd.DataFrame, y_true: pd.Series, y_pred: pd.Series, segment_col: str, problem_type: str) -> pd.DataFrame:
    """
    Calculates performance metrics for each unique segment/group.
    
    This is "Slice-Based Evaluation" - essential for detecting bias and 
    understanding model performance across different demographics or categories.
    
    Args:
        df: Original DataFrame containing the segment column.
        y_true: True target values.
        y_pred: Model predictions.
        segment_col: Column name to slice by (e.g., "Age_Group", "Region").
        problem_type: Either "Regression" or "Classification".
        
    Returns:
        pd.DataFrame with columns:
        - 'Segment': Unique segment identifier
        - 'Sample Size': Number of samples in segment
        - 'RMSE' and 'R2' (Regression) or 'Accuracy' (Classification)
        
    Note:
        - Numeric columns are automatically binned into quartiles
        - Segments with <2 samples may have unreliable metrics
        
    Use Case:
        Detect if model performs worse for specific age groups, regions, etc.
    """
    results = []
    
    # If numeric, we bin it first
    if pd.api.types.is_numeric_dtype(df[segment_col]):
        try:
            temp_col = f"{segment_col}_bin"
            df[temp_col] = pd.qcut(df[segment_col], q=4, duplicates='drop')
            group_col = temp_col
        except:
            group_col = segment_col
    else:
        group_col = segment_col
        
    unique_groups = df[group_col].unique()
    
    for group in unique_groups:
        mask = (df[group_col] == group)
        g_true = y_true[mask]
        g_pred = y_pred[mask]
        
        if len(g_true) == 0: continue
        
        row = {"Segment": str(group), "Sample Size": len(g_true)}
        
        if problem_type == "Regression":
            mse = np.mean((g_true - g_pred)**2)
            row["RMSE"] = np.sqrt(mse)
            # R2 requires more than 1 sample
            if len(g_true) > 1:
                u = ((g_true - g_pred)**2).sum()
                v = ((g_true - g_true.mean())**2).sum()
                row["R2"] = 1 - (u/v) if v != 0 else 0
            else:
                row["R2"] = 0
        else:
            correct = (g_true == g_pred).sum()
            row["Accuracy"] = correct / len(g_true)
            
        results.append(row)
        
    return pd.DataFrame(results).sort_values(by="Sample Size", ascending=False)
