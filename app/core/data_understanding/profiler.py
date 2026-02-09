# app/core/data_understanding/profiler.py
import pandas as pd
from typing import Dict, Any

def extract_metadata(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Extracts basic metadata from the dataframe.
    Mimics the first 5 minutes of a data analyst.
    """
    # Detailed Column Info
    column_info = {}
    for col in df.columns:
        null_count = int(df[col].isnull().sum())
        null_pct = float(df[col].isnull().mean())
        unique_count = int(df[col].nunique())
        dtype = str(df[col].dtype)
        
        # Simple Outlier Detection (IQR) for numerical columns
        outliers = 0
        if pd.api.types.is_numeric_dtype(df[col]) and unique_count > 10:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = int(((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))).sum())

        column_info[col] = {
            "dtype": dtype,
            "missing_count": null_count,
            "missing_pct": null_pct,
            "unique_count": unique_count,
            "outlier_count": outliers,
            "is_constant": unique_count <= 1
        }

    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "column_names": df.columns.tolist(),
        "column_info": column_info,
        "duplicate_rows": int(df.duplicated().sum()),
        "memory_usage": int(df.memory_usage(deep=True).sum())
    }
