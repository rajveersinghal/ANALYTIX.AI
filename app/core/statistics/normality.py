# app/core/statistics/normality.py
import pandas as pd
from scipy import stats

def check_normality(series: pd.Series):
    """
    Checks if a distribution is normal using Shapiro-Wilk test.
    Note: Shapiro-Wilk is sensitive to sample size. For large N (>5000), 
    we might prefer D'Agostino's K^2 test or just skewness/kurtosis check.
    """
    n = len(series)
    if n < 3:
        return {"is_normal": False, "test": "N/A", "p_value": 0.0, "reason": "Sample too small"}
    
    # Using Shapiro-Wilk for N < 5000 is standard
    try:
        stat, p_value = stats.shapiro(series)
        is_normal = p_value > 0.05 # Null hypothesis: Data is normal
        
        return {
            "is_normal": is_normal,
            "test": "Shapiro-Wilk",
            "p_value": p_value,
            "reason": "Normal" if is_normal else f"Significant deviation (p={p_value:.4f})"
        }
    except Exception as e:
         return {"is_normal": False, "test": "Error", "p_value": 0.0, "reason": str(e)}
