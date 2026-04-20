# app/core/statistics/stats_summary.py
import pandas as pd
import numpy as np
from app.core.statistics import hypothesis_testing, assumption_checker

def generate_stats_summary(df: pd.DataFrame, metadata: dict) -> dict:
    """
    Computes a comprehensive statistical summary for the dataset.
    Includes advanced moments like skewness and kurtosis for the Insight Engine.
    """
    target = metadata.get("target_column")
    problem_type = metadata.get("problem_type")
    
    feature_types = {
        "numerical_features": metadata.get("numerical_features", []),
        "categorical_features": metadata.get("categorical_features", [])
    }
    
    # Compute numerical column stats including skewness and kurtosis
    column_stats = {}
    for col in feature_types["numerical_features"]:
        if col not in df.columns: continue
        series = df[col].dropna()
        if series.empty: continue
        
        column_stats[col] = {
            "count": int(series.count()),
            "mean": float(series.mean()),
            "std": float(series.std()),
            "min": float(series.min()),
            "25%": float(series.quantile(0.25)),
            "50%": float(series.median()),
            "75%": float(series.quantile(0.75)),
            "max": float(series.max()),
            "skewness": float(series.skew()),
            "kurtosis": float(series.kurtosis()),
            "is_outlier_prone": bool(abs(series.skew()) > 1 or series.kurtosis() > 3)
        }
    
    significant_features = []
    
    # Run Hypothesis Tests against Target
    if target and target in df.columns:
        target_type = "numerical" if problem_type == "regression" else "categorical"
        
        # Test Numericals
        for col in feature_types["numerical_features"]:
            if col == target: continue
            if col in df.columns:
                res = hypothesis_testing.auto_test(df, col, target, "numerical", target_type)
                if res and res['significant']:
                    significant_features.append({
                        "feature": col,
                        "test": res['test'],
                        "p_value": res['p_value'],
                        "insight": "Statistically Significant"
                    })
                    
        # Test Categoricals
        for col in feature_types["categorical_features"]:
            if col == target: continue
            if col in df.columns:
                res = hypothesis_testing.auto_test(df, col, target, "categorical", target_type)
                if res and res['significant']:
                     significant_features.append({
                        "feature": col,
                        "test": res['test'],
                        "p_value": res['p_value'],
                        "insight": "Statistically Significant"
                    })
                    
    # Check Assumptions
    warnings = assumption_checker.check_assumptions(df, metadata)
    
    return {
        "significant_features": significant_features,
        "warnings": warnings
    }
