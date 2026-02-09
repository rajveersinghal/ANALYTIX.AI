# app/core/eda/correlation.py
import pandas as pd

def analyze_correlation(df: pd.DataFrame, feature_types: dict, target_col: str = None):
    """
    Computes correlation matrix and extracts key drivers.
    """
    insights = []
    plot_data = {}
    
    # Only numericals
    nums = [c for c in feature_types.get("numerical_features", []) if c in df.columns]
    
    if len(nums) < 2:
        return insights, plot_data
        
    corr_matrix = df[nums].corr()
    
    # Store for plotting heatmap
    plot_data['correlation_matrix'] = corr_matrix.to_dict()
    
    # Insight: Key Drivers
    if target_col and target_col in nums:
        target_corr = corr_matrix[target_col].drop(target_col)
        
        # Strong positive
        strong_pos = target_corr[target_corr > 0.5]
        for idx, val in strong_pos.items():
            insights.append(f"Target '{target_col}' has a strong positive relationship with '{idx}' ({val:.2f}).")
            
        # Strong negative
        strong_neg = target_corr[target_corr < -0.5]
        for idx, val in strong_neg.items():
            insights.append(f"Target '{target_col}' has a strong negative relationship with '{idx}' ({val:.2f}).")
            
    # Insight: Multi-collinearity (feature vs feature)
    # simplified loop
    
    return insights, plot_data
