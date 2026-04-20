# app/core/eda/insight_generator.py
import pandas as pd
from app.core.eda import univariate, bivariate, correlation, target_analysis

def generate_insights(df: pd.DataFrame, metadata: dict, mode: str = "fast") -> dict:
    """
    Aggregates all EDA insights.
    """
    all_insights = []
    plot_data = {}
    
    feature_types = {
        "numerical_features": metadata.get("numerical_features", []),
        "categorical_features": metadata.get("categorical_features", [])
    }
    target_col = metadata.get("target_column") # Assuming this is injected into metadata earlier or passed
    problem_type = metadata.get("problem_type")
    
    # 1. Target Analysis
    all_insights.extend(target_analysis.analyze_target(df, target_col, problem_type))
    
    # 2. Univariate
    uni_insights, uni_plots = univariate.analyze_univariate(df, feature_types)
    all_insights.extend(uni_insights)
    plot_data.update(uni_plots)
    
    # 3. Correlation (Key Drivers)
    corr_insights, corr_plots = correlation.analyze_correlation(df, feature_types, target_col)
    all_insights.extend(corr_insights)
    plot_data.update(corr_plots)
    
    # 4. Bivariate
    biv_insights, biv_plots = bivariate.analyze_bivariate(df, feature_types, target_col)
    all_insights.extend(biv_insights)
    plot_data.update(biv_plots)
    
    return {
        "insights": all_insights,
        "plot_data": plot_data
    }
