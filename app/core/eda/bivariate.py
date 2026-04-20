# app/core/eda/bivariate.py
import pandas as pd

def analyze_bivariate(df: pd.DataFrame, feature_types: dict, target_col: str):
    """
    Analyzes relationships primarily involved with the target.
    Returns: insights, plot_data
    """
    insights = []
    plot_data = {"scatter": []}
    
    if not target_col or target_col not in df.columns:
        return insights, plot_data
        
    # 1. Categorical vs Target (Impact)
    if target_col in feature_types.get("numerical_features", []):
        for col in feature_types.get("categorical_features", []):
            if col in df.columns:
                try:
                    means = df.groupby(col)[target_col].mean()
                    diff = means.max() - means.min()
                    insights.append(f"Feature '{col}' creates groups with variation in '{target_col}' (Range: {diff:.2f}). Relevant for prediction.")
                except:
                    pass
    
    # 2. Top Numerical vs Target (Scatter Plot)
    nums = [c for c in feature_types.get("numerical_features", []) if c in df.columns and c != target_col]
    if nums and target_col in df.columns:
        try:
            # Find most correlated feature to target
            corrs = df[nums + [target_col]].corr()[target_col].drop(target_col).abs().sort_values(ascending=False)
            if not corrs.empty:
                top_feature = corrs.index[0]
                
                # Sample for scatter plot (max 100 points for frontend performance)
                sample_df = df[[top_feature, target_col]].dropna().sample(min(100, len(df)), random_state=42)
                plot_data["scatter"] = [
                    {"x": float(row[top_feature]), "y": float(row[target_col])} 
                    for _, row in sample_df.iterrows()
                ]
                plot_data["scatter_meta"] = {"x_label": top_feature, "y_label": target_col}
        except Exception as e:
            from app.logger import logger
            logger.warning(f"Bivariate scatter generation failed: {e}")

    return insights, plot_data
