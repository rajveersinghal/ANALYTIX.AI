from typing import Dict, List, Any
import pandas as pd
import numpy as np
from scipy import stats
import streamlit as st

def calculate_significance(group_a: pd.Series, group_b: pd.Series, metric_type: str = 'continuous') -> Dict[str, Any]:
    """
    Calculates statistical significance between two groups.
    
    Args:
        group_a: Control group data.
        group_b: Treatment group data.
        metric_type: 'continuous' (t-test) or 'binary' (chi-square/proportion test).
        
    Returns:
        Dictionary with test results: statistic, p_value, significant, effect_size.
    """
    if metric_type == 'continuous':
        # Independent t-test
        statistic, p_value = stats.ttest_ind(group_a, group_b, nan_policy='omit')
        
        # Cohen's d effect size
        pooled_std = np.sqrt((group_a.std()**2 + group_b.std()**2) / 2)
        effect_size = (group_b.mean() - group_a.mean()) / pooled_std if pooled_std > 0 else 0
        
    else:  # binary
        # Proportion test
        n_a, n_b = len(group_a), len(group_b)
        p_a, p_b = group_a.mean(), group_b.mean()
        
        # Pooled proportion
        p_pool = (group_a.sum() + group_b.sum()) / (n_a + n_b)
        
        # Z-test for proportions
        se = np.sqrt(p_pool * (1 - p_pool) * (1/n_a + 1/n_b))
        statistic = (p_b - p_a) / se if se > 0 else 0
        p_value = 2 * (1 - stats.norm.cdf(abs(statistic)))
        
        # Effect size (relative uplift)
        effect_size = (p_b - p_a) / p_a if p_a > 0 else 0
    
    return {
        'statistic': float(statistic),
        'p_value': float(p_value),
        'significant': p_value < 0.05,
        'effect_size': float(effect_size),
        'group_a_mean': float(group_a.mean()),
        'group_b_mean': float(group_b.mean()),
        'group_a_size': len(group_a),
        'group_b_size': len(group_b)
    }

def calculate_sample_size(baseline_rate: float, mde: float, alpha: float = 0.05, power: float = 0.8) -> int:
    """
    Calculates required sample size per group for A/B test.
    
    Args:
        baseline_rate: Current conversion rate (e.g., 0.10 for 10%).
        mde: Minimum Detectable Effect (e.g., 0.02 for 2% absolute increase).
        alpha: Significance level (default: 0.05).
        power: Statistical power (default: 0.8).
        
    Returns:
        int: Required sample size per group.
    """
    # Z-scores
    z_alpha = stats.norm.ppf(1 - alpha/2)
    z_beta = stats.norm.ppf(power)
    
    # Variance
    p1 = baseline_rate
    p2 = baseline_rate + mde
    
    # Sample size formula
    n = ((z_alpha * np.sqrt(2 * p1 * (1 - p1)) + 
          z_beta * np.sqrt(p1 * (1 - p1) + p2 * (1 - p2)))**2) / (mde**2)
    
    return int(np.ceil(n))

def calculate_confidence_interval(data: pd.Series, confidence: float = 0.95) -> tuple:
    """
    Calculates confidence interval for a sample mean.
    
    Args:
        data: Sample data.
        confidence: Confidence level (default: 0.95 for 95% CI).
        
    Returns:
        tuple: (lower_bound, upper_bound)
    """
    mean = data.mean()
    se = stats.sem(data, nan_policy='omit')
    margin = se * stats.t.ppf((1 + confidence) / 2, len(data) - 1)
    
    return (mean - margin, mean + margin)

def interpret_ab_test(results: Dict[str, Any]) -> str:
    """
    Generates human-readable interpretation of A/B test results.
    
    Args:
        results: Output from calculate_significance().
        
    Returns:
        str: Interpretation text.
    """
    p_val = results['p_value']
    effect = results['effect_size']
    sig = results['significant']
    
    interpretation = f"**Test Results:**\n\n"
    
    if sig:
        direction = "increase" if effect > 0 else "decrease"
        interpretation += f"✅ **Statistically Significant** (p = {p_val:.4f})\n\n"
        interpretation += f"The treatment group shows a **{abs(effect):.1%} {direction}** compared to control.\n\n"
        
        if abs(effect) < 0.02:
            interpretation += "⚠️ However, the effect size is very small. Consider if this is practically meaningful.\n"
        elif abs(effect) > 0.2:
            interpretation += "🎯 **Large effect size** - This is a substantial improvement!\n"
    else:
        interpretation += f"❌ **Not Statistically Significant** (p = {p_val:.4f})\n\n"
        interpretation += "We cannot conclude that the treatment has a real effect. Possible reasons:\n"
        interpretation += "- Sample size too small\n"
        interpretation += "- True effect is negligible\n"
        interpretation += "- High variance in data\n"
    
    interpretation += f"\n**Group Sizes:** Control = {results['group_a_size']}, Treatment = {results['group_b_size']}\n"
    interpretation += f"**Means:** Control = {results['group_a_mean']:.4f}, Treatment = {results['group_b_mean']:.4f}"
    
    return interpretation
