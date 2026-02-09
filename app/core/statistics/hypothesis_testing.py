# app/core/statistics/hypothesis_testing.py
import pandas as pd
from scipy import stats

def auto_test(df: pd.DataFrame, feature: str, target: str, feature_type: str, target_type: str):
    """
    Automatically selects the correct statistical test.
    """
    result = {}
    
    import numpy as np
    
    # 1. Numerical vs Numerical (Correlation Significance)
    if feature_type == "numerical" and target_type == "numerical":
        try:
            res = stats.pearsonr(df[feature], df[target])
            result = {
                "test": "Pearson Correlation",
                "stat": float(np.nan_to_num(res.statistic)),
                "p_value": float(np.nan_to_num(res.pvalue, nan=1.0)),
                "significant": bool(res.pvalue < 0.05) if not np.isnan(res.pvalue) else False
            }
        except Exception:
            return None
        
    # 2. Numerical vs Categorical (T-test / ANOVA)
    elif feature_type == "categorical" and target_type == "numerical":
        groups = [group[target].dropna().values for name, group in df.groupby(feature)]
        
        # Guard: Need at least 2 groups with variance
        groups = [g for g in groups if len(g) > 1 and np.var(g) > 0]
        
        if len(groups) < 2:
            return None
            
        try:
            if len(groups) == 2:
                res = stats.ttest_ind(*groups)
                test_name = "T-Test"
            else:
                res = stats.f_oneway(*groups)
                test_name = "ANOVA"
                
            result = {
                "test": test_name,
                "stat": float(np.nan_to_num(res.statistic)),
                "p_value": float(np.nan_to_num(res.pvalue, nan=1.0)),
                "significant": bool(res.pvalue < 0.05) if not np.isnan(res.pvalue) else False
            }
        except Exception:
            return None
        
    # 3. Categorical vs Categorical (Chi-Square)
    elif feature_type == "categorical" and target_type == "categorical":
        try:
            contingency = pd.crosstab(df[feature], df[target])
            if contingency.empty or contingency.size == 0: return None
            
            res = stats.chi2_contingency(contingency)
            result = {
                "test": "Chi-Square",
                "stat": float(np.nan_to_num(res[0])),
                "p_value": float(np.nan_to_num(res[1], nan=1.0)),
                "significant": bool(res[1] < 0.05) if not np.isnan(res[1]) else False
            }
        except Exception:
            return None
        
    return result
