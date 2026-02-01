from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from scipy import stats
import streamlit as st
from modules.utils import Logger

def generate_profile_report(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generates comprehensive data profiling report.
    
    Args:
        df: Input DataFrame to profile.
        
    Returns:
        Dictionary containing profile statistics.
    """
    report = {
        'overview': get_overview_stats(df),
        'missing_analysis': analyze_missing_values(df),
        'numeric_analysis': analyze_numeric_columns(df),
        'categorical_analysis': analyze_categorical_columns(df),
        'correlations': analyze_correlations(df),
        'outliers': detect_outliers(df),
        'recommendations': generate_recommendations(df)
    }
    
    Logger.log(f"📋 Generated profile report for {df.shape[0]} rows × {df.shape[1]} columns")
    return report

def get_overview_stats(df: pd.DataFrame) -> Dict[str, Any]:
    """Basic dataset statistics."""
    return {
        'rows': df.shape[0],
        'columns': df.shape[1],
        'memory_mb': df.memory_usage(deep=True).sum() / 1024**2,
        'duplicate_rows': df.duplicated().sum(),
        'duplicate_pct': df.duplicated().sum() / len(df) * 100,
        'numeric_cols': len(df.select_dtypes(include=[np.number]).columns),
        'categorical_cols': len(df.select_dtypes(include=['object', 'category']).columns),
        'datetime_cols': len(df.select_dtypes(include=['datetime64']).columns)
    }

def analyze_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Analyzes missing value patterns."""
    missing_df = pd.DataFrame({
        'Column': df.columns,
        'Missing_Count': df.isnull().sum(),
        'Missing_Pct': (df.isnull().sum() / len(df) * 100).round(2),
        'Data_Type': df.dtypes.astype(str)
    })
    
    missing_df = missing_df[missing_df['Missing_Count'] > 0].sort_values('Missing_Pct', ascending=False)
    return missing_df.reset_index(drop=True)

def analyze_numeric_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Analyzes numeric column distributions."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    if len(numeric_cols) == 0:
        return pd.DataFrame()
    
    stats_list = []
    for col in numeric_cols:
        col_data = df[col].dropna()
        if len(col_data) > 0:
            stats_list.append({
                'Column': col,
                'Mean': col_data.mean(),
                'Median': col_data.median(),
                'Std': col_data.std(),
                'Min': col_data.min(),
                'Max': col_data.max(),
                'Skewness': col_data.skew(),
                'Zeros_Pct': (col_data == 0).sum() / len(col_data) * 100
            })
    
    return pd.DataFrame(stats_list)

def analyze_categorical_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Analyzes categorical column characteristics."""
    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    
    if len(cat_cols) == 0:
        return pd.DataFrame()
    
    stats_list = []
    for col in cat_cols:
        col_data = df[col].dropna()
        if len(col_data) > 0:
            unique_count = col_data.nunique()
            stats_list.append({
                'Column': col,
                'Unique_Values': unique_count,
                'Cardinality': 'High' if unique_count > 50 else 'Medium' if unique_count > 10 else 'Low',
                'Most_Common': col_data.value_counts().index[0] if len(col_data) > 0 else None,
                'Most_Common_Pct': col_data.value_counts(normalize=True).iloc[0] * 100 if len(col_data) > 0 else 0
            })
    
    return pd.DataFrame(stats_list)

def analyze_correlations(df: pd.DataFrame, threshold: float = 0.7) -> pd.DataFrame:
    """Finds high correlations between numeric features."""
    numeric_df = df.select_dtypes(include=[np.number])
    
    if numeric_df.shape[1] < 2:
        return pd.DataFrame()
    
    corr_matrix = numeric_df.corr()
    
    # Extract high correlations
    high_corr = []
    for i in range(len(corr_matrix.columns)):
        for j in range(i+1, len(corr_matrix.columns)):
            corr_val = corr_matrix.iloc[i, j]
            if abs(corr_val) >= threshold:
                high_corr.append({
                    'Feature_1': corr_matrix.columns[i],
                    'Feature_2': corr_matrix.columns[j],
                    'Correlation': corr_val,
                    'Strength': 'Very Strong' if abs(corr_val) > 0.9 else 'Strong'
                })
    
    return pd.DataFrame(high_corr).sort_values('Correlation', key=abs, ascending=False) if high_corr else pd.DataFrame()

def detect_outliers(df: pd.DataFrame, method: str = 'iqr') -> Dict[str, int]:
    """Detects outliers using IQR method."""
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    outlier_counts = {}
    
    for col in numeric_cols:
        col_data = df[col].dropna()
        if len(col_data) > 0:
            Q1 = col_data.quantile(0.25)
            Q3 = col_data.quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = ((col_data < lower_bound) | (col_data > upper_bound)).sum()
            if outliers > 0:
                outlier_counts[col] = outliers
    
    return outlier_counts

def generate_recommendations(df: pd.DataFrame) -> List[str]:
    """Generates data quality recommendations."""
    recommendations = []
    
    # Check missing values
    missing_pct = (df.isnull().sum().sum() / (df.shape[0] * df.shape[1])) * 100
    if missing_pct > 10:
        recommendations.append(f"⚠️ High missing data ({missing_pct:.1f}%). Consider imputation or feature removal.")
    
    # Check duplicates
    dup_pct = df.duplicated().sum() / len(df) * 100
    if dup_pct > 5:
        recommendations.append(f"⚠️ {dup_pct:.1f}% duplicate rows detected. Consider deduplication.")
    
    # Check high cardinality
    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    for col in cat_cols:
        if df[col].nunique() > 0.9 * len(df):
            recommendations.append(f"🔍 '{col}' has very high cardinality - likely an ID column.")
    
    # Check skewness
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        skew = df[col].skew()
        if abs(skew) > 2:
            recommendations.append(f"📊 '{col}' is highly skewed ({skew:.2f}). Consider log/sqrt transformation.")
    
    if not recommendations:
        recommendations.append("✅ Data quality looks good! No major issues detected.")
    
    return recommendations
