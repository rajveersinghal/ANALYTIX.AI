import pandas as pd
import numpy as np
from scipy import stats

def calculate_psi(expected, actual, buckets=10):
    """
    Calculate the Population Stability Index (PSI) for a single feature.
    """
    def scale_range (input, min, max):
        input += (1e-6) # handled zero
        input /= (1e-6 + max - min)
        input *= (buckets - 1)
        return input

    breakpoints = np.arange(0, buckets + 1) / (buckets) * 100
    
    if len(expected) == 0 or len(actual) == 0:
        return 0
        
    # Simple binning for numeric
    try:
        # Quantile buckets based on expected (training) data
        breakpoints = np.percentile(expected, breakpoints)
        
        expected_percents = np.histogram(expected, breakpoints)[0] / len(expected)
        actual_percents = np.histogram(actual, breakpoints)[0] / len(actual)
        
        # Avoid division by zero
        expected_percents = np.where(expected_percents == 0, 0.0001, expected_percents)
        actual_percents = np.where(actual_percents == 0, 0.0001, actual_percents)
        
        psi_value = np.sum((actual_percents - expected_percents) * np.log(actual_percents / expected_percents))
        return psi_value
    except:
        return 0

def detect_drift(reference_df, current_df, threshold=0.2):
    """
    Checks for feature drift between reference (train) and current (test/live) data.
    Returns a dict of drift scores.
    """
    drift_report = {}
    
    # Only checks numeric common columns
    common_cols = list(set(reference_df.select_dtypes(include=np.number).columns) & 
                       set(current_df.select_dtypes(include=np.number).columns))
    
    for col in common_cols:
        psi = calculate_psi(reference_df[col].dropna(), current_df[col].dropna())
        status = "Prior" # Base
        if psi > 0.2:
            status = "🔴 DRIFT DETECTED"
        elif psi > 0.1:
            status = "⚠️ Slight Shift"
        else:
            status = "✅ Stable"
            
        drift_report[col] = {"PSI": round(psi, 3), "Status": status}
        
    return pd.DataFrame(drift_report).T

def detect_target_drift(y_ref: pd.Series, y_curr: pd.Series, problem_type: str) -> Dict[str, Any]:
    """
    Checks if the distribution of the target variable has shifted.
    Useful for detecting concept drift or market regime changes.
    """
    report = {"Status": "✅ Stable", "Details": ""}
    
    if problem_type == "Classification":
        ref_dist = y_ref.value_counts(normalize=True).to_dict()
        curr_dist = y_curr.value_counts(normalize=True).to_dict()
        
        major_shifts = []
        for cls, prob in ref_dist.items():
            curr_prob = curr_dist.get(cls, 0)
            diff = abs(curr_prob - prob)
            if diff > 0.15: # 15% absolute shift
                major_shifts.append(f"Class '{cls}' shifted {diff:+.1%}")
                
        if major_shifts:
            report["Status"] = "⚠️ TARGET SHIFT"
            report["Details"] = "; ".join(major_shifts)
            
    else:
        ref_mean, ref_std = y_ref.mean(), y_ref.std()
        curr_mean, curr_std = y_curr.mean(), y_curr.std()
        
        mean_diff = abs(curr_mean - ref_mean) / (ref_mean + 1e-6)
        if mean_diff > 0.2: # 20% relative shift in mean
            report["Status"] = "⚠️ TARGET SHIFT"
            report["Details"] = f"Average target value shifted by {mean_diff:.1%}"
            
    return report
