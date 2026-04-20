# app/core/data_understanding/profiler.py
import pandas as pd
from typing import Dict, Any

def extract_metadata(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Extracts basic metadata from the dataframe using vectorized operations.
    """
    # 1. Basic Counts (Vectorized)
    null_counts = df.isnull().sum()
    null_pcts = df.isnull().mean()
    unique_counts = df.nunique()
    dtypes = df.dtypes.astype(str)
    
    # 2. Outlier Detection (Vectorized across numerical columns)
    num_df = df.select_dtypes(include=['number'])
    outlier_counts = {}
    
    if not num_df.empty:
        # Vectorized IQR for all numeric columns at once
        Q1 = num_df.quantile(0.25)
        Q3 = num_df.quantile(0.75)
        IQR = Q3 - Q1
        
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        
        # Count outliers per column
        outliers_mask = (num_df < lower_bound) | (num_df > upper_bound)
        outlier_counts = outliers_mask.sum().to_dict()

    # 3. Consolidate Column Info
    column_info = {}
    for col in df.columns:
        column_info[col] = {
            "dtype": str(dtypes[col]),
            "missing_count": int(null_counts[col]),
            "missing_pct": float(null_pcts[col]),
            "unique_count": int(unique_counts[col]),
            "outlier_count": int(outlier_counts.get(col, 0)),
            "is_constant": bool(unique_counts[col] <= 1)
        }

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "column_info": column_info,
        "duplicate_rows": int(df.duplicated().sum()) if len(df) < 100000 else -1, # Skip full check for very large datasets
        "memory_usage": int(df.memory_usage(deep=True).sum())
    }
