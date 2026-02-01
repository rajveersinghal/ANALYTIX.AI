import pandas as pd
import streamlit as st
from modules.utils import Logger

def check_dataset_suitability(df):
    """
    Checks if the dataset is suitable for ML.
    """
    issues = []
    
    if len(df) < 50:
        issues.append("⚠️ Dataset has fewer than 50 rows. Models may be unreliable.")
        
    missing_ratio = df.isnull().sum().sum() / df.size
    if missing_ratio > 0.4:
        issues.append(f"⚠️ High missing value ratio ({missing_ratio:.1%}). Heavy cleaning required.")
        
    if issues:
        st.warning("Dataset Suitability Issues Detected:")
        for issue in issues:
            st.write(issue)
        Logger.log("⚠️ Dataset suitability warning triggered.")
    else:
        Logger.log("✔ Dataset passed basic suitability checks.")

def validate_target(df, target_col, problem_type):
    """
    Validates the target column for common issues.
    """
    if target_col not in df.columns:
        return
        
    if problem_type == "Classification":
        unique_vals = df[target_col].nunique()
        if unique_vals == 1:
            st.error("❌ Target variable has only one class. Cannot train a model.")
            Logger.log("❌ Target validation failed: Single class detected.")
            return False
            
        if unique_vals > 50:
             st.warning(f"⚠️ Target variable has {unique_vals} unique values. Are you sure this is a classification problem?")
             Logger.log(f"⚠️ Target cardinality warning: {unique_vals} classes.")

    Logger.log(f"✔ Target variable '{target_col}' validated successfully.")
    return True
