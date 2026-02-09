# app/core/statistics/stats_summary.py
import pandas as pd
from app.core.statistics import hypothesis_testing, assumption_checker

def generate_stats_summary(df: pd.DataFrame, metadata: dict):
    """
    Runs tests and aggregates findings.
    """
    target = metadata.get("target_column")
    problem_type = metadata.get("problem_type")
    
    feature_types = {
        "numerical_features": metadata.get("numerical_features", []),
        "categorical_features": metadata.get("categorical_features", [])
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
