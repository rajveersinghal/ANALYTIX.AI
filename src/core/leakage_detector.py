from typing import Dict, List, Tuple, Any
import pandas as pd
import numpy as np
from scipy.stats import pearsonr
from modules.utils import Logger
import streamlit as st

def detect_data_leakage(df: pd.DataFrame, target_col: str, threshold: float = 0.95) -> Dict[str, Any]:
    """
    Detects potential data leakage by finding features highly correlated with target.
    
    Data leakage occurs when training data contains information about the target
    that wouldn't be available at prediction time, artificially inflating accuracy.
    
    Args:
        df: Input DataFrame with features and target.
        target_col: Name of target column.
        threshold: Correlation threshold for flagging (default: 0.95).
        
    Returns:
        Dictionary with 'leakage_detected', 'suspicious_features', and 'report'.
    """
    if target_col not in df.columns:
        return {'leakage_detected': False, 'suspicious_features': [], 'report': []}
    
    suspicious_features = []
    report = []
    
    # Get numeric columns only
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    feature_cols = [c for c in numeric_cols if c != target_col]
    
    target_data = df[target_col]
    
    for col in feature_cols:
        try:
            # Calculate correlation
            corr, p_value = pearsonr(df[col].fillna(0), target_data.fillna(0))
            
            # Check for suspiciously high correlation
            if abs(corr) >= threshold:
                suspicious_features.append({
                    'feature': col,
                    'correlation': corr,
                    'p_value': p_value,
                    'severity': 'CRITICAL' if abs(corr) > 0.99 else 'HIGH'
                })
                
                severity_icon = "🚨" if abs(corr) > 0.99 else "⚠️"
                report.append(
                    f"{severity_icon} **{col}**: Correlation = {corr:.4f} "
                    f"(p={p_value:.4f}) - Potential leakage!"
                )
        except:
            continue
    
    # Check for duplicate columns (perfect correlation with each other)
    for i, col1 in enumerate(feature_cols):
        for col2 in feature_cols[i+1:]:
            try:
                corr, _ = pearsonr(df[col1].fillna(0), df[col2].fillna(0))
                if abs(corr) > 0.999:
                    report.append(
                        f"🔄 **{col1}** and **{col2}** are nearly identical "
                        f"(r={corr:.4f}) - Remove one!"
                    )
            except:
                continue
    
    leakage_detected = len(suspicious_features) > 0
    
    if leakage_detected:
        Logger.log(f"🚨 Data Leakage Detected: {len(suspicious_features)} suspicious features")
    else:
        Logger.log("✅ No data leakage detected")
    
    return {
        'leakage_detected': leakage_detected,
        'suspicious_features': suspicious_features,
        'report': report
    }

def check_temporal_leakage(df: pd.DataFrame, target_col: str) -> List[str]:
    """
    Checks for temporal leakage (future information in features).
    
    Args:
        df: Input DataFrame.
        target_col: Target column name.
        
    Returns:
        List of warnings about potential temporal leakage.
    """
    warnings = []
    
    # Check for date columns that might leak future information
    datetime_cols = df.select_dtypes(include=['datetime64']).columns
    
    for col in datetime_cols:
        if 'future' in col.lower() or 'next' in col.lower() or 'after' in col.lower():
            warnings.append(
                f"⏰ **{col}** contains temporal keywords - "
                f"Ensure this data is available at prediction time!"
            )
    
    # Check for aggregated statistics that might leak
    suspicious_keywords = ['total', 'sum', 'count', 'avg', 'mean', 'cumulative']
    for col in df.columns:
        if col != target_col:
            col_lower = col.lower()
            if any(keyword in col_lower for keyword in suspicious_keywords):
                if target_col.lower() in col_lower:
                    warnings.append(
                        f"📊 **{col}** might contain aggregated target information - "
                        f"Verify it doesn't leak future data!"
                    )
    
    return warnings

def get_leakage_recommendations(suspicious_features: List[Dict]) -> List[str]:
    """
    Generates actionable recommendations for handling data leakage.
    
    Args:
        suspicious_features: List of suspicious features from detect_data_leakage().
        
    Returns:
        List of recommendation strings.
    """
    if not suspicious_features:
        return ["✅ No data leakage detected. Your features look clean!"]
    
    recommendations = [
        "### 🛠️ Recommended Actions:",
        "",
        "1. **Investigate High-Correlation Features**:"
    ]
    
    for feat in suspicious_features:
        recommendations.append(
            f"   - Remove `{feat['feature']}` or verify it's available at prediction time"
        )
    
    recommendations.extend([
        "",
        "2. **Common Leakage Sources to Check**:",
        "   - Features derived from the target variable",
        "   - Future information (data from after the prediction time)",
        "   - Aggregated statistics that include the target",
        "   - IDs that perfectly identify target classes",
        "",
        "3. **Verification Steps**:",
        "   - Ask: 'Would this feature be available when making real predictions?'",
        "   - Check if removing the feature drastically drops accuracy (sign of leakage)",
        "   - Review feature engineering code for target variable usage"
    ])
    
    return recommendations
