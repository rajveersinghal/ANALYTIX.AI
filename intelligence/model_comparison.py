from typing import Dict, List
import pandas as pd
import plotly.graph_objects as go
import streamlit as st

def create_model_comparison_radar(results: Dict[str, Dict[str, float]], problem_type: str):
    """
    Creates radar chart comparing multiple models across metrics.
    
    Args:
        results: Dictionary of {model_name: {metric: value}}.
        problem_type: 'Classification' or 'Regression'.
    """
    # Determine metrics to plot
    if problem_type == "Classification":
        metrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score']
    else:
        # For regression, normalize metrics to 0-1 scale
        metrics = ['R2', 'Normalized_RMSE', 'Normalized_MAE']
    
    fig = go.Figure()
    
    for model_name, model_metrics in results.items():
        # Extract values for each metric
        values = []
        display_metrics = []
        
        for metric in metrics:
            if metric in model_metrics:
                val = model_metrics[metric]
                
                # Normalize regression metrics
                if problem_type == "Regression" and 'Normalized' not in metric:
                    if metric == 'R2':
                        val = max(0, min(1, val))  # Clip to [0, 1]
                    else:
                        # For error metrics, invert (lower is better)
                        val = 1 / (1 + val)
                
                values.append(val)
                display_metrics.append(metric)
        
        # Close the radar chart
        values.append(values[0])
        display_metrics.append(display_metrics[0])
        
        fig.add_trace(go.Scatterpolar(
            r=values,
            theta=display_metrics,
            fill='toself',
            name=model_name
        ))
    
    fig.update_layout(
        polar=dict(
            radialaxis=dict(
                visible=True,
                range=[0, 1]
            )
        ),
        showlegend=True,
        title="Model Performance Comparison",
        height=500
    )
    
    st.plotly_chart(fig, use_container_width=True)

def compare_feature_selection_methods(df: pd.DataFrame, target_col: str, problem_type: str, n_features: int = 10) -> pd.DataFrame:
    """
    Compares different feature selection methods.
    
    Args:
        df: Input DataFrame.
        target_col: Target column name.
        problem_type: 'Classification' or 'Regression'.
        n_features: Number of features to select.
        
    Returns:
        DataFrame comparing selected features across methods.
    """
    from sklearn.feature_selection import SelectKBest, mutual_info_classif, mutual_info_regression, RFE, f_classif, f_regression
    from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
    from sklearn.linear_model import LassoCV, LogisticRegression
    
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    results = {}
    
    # 1. Mutual Information
    if problem_type == "Classification":
        selector = SelectKBest(mutual_info_classif, k=n_features)
    else:
        selector = SelectKBest(mutual_info_regression, k=n_features)
    
    selector.fit(X, y)
    results['Mutual_Information'] = X.columns[selector.get_support()].tolist()
    
    # 2. F-statistic
    if problem_type == "Classification":
        selector = SelectKBest(f_classif, k=n_features)
    else:
        selector = SelectKBest(f_regression, k=n_features)
    
    selector.fit(X, y)
    results['F_Statistic'] = X.columns[selector.get_support()].tolist()
    
    # 3. RFE with Random Forest
    if problem_type == "Classification":
        estimator = RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1)
    else:
        estimator = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
    
    selector = RFE(estimator, n_features_to_select=n_features, step=1)
    selector.fit(X, y)
    results['RFE_RandomForest'] = X.columns[selector.support_].tolist()
    
    # 4. LASSO/L1 Regularization
    try:
        if problem_type == "Classification":
            lasso = LogisticRegression(penalty='l1', solver='liblinear', random_state=42, max_iter=1000)
        else:
            lasso = LassoCV(cv=5, random_state=42, n_jobs=-1)
        
        lasso.fit(X, y)
        if hasattr(lasso, 'coef_'):
            coef = lasso.coef_.flatten() if len(lasso.coef_.shape) > 1 else lasso.coef_
            top_indices = abs(coef).argsort()[-n_features:][::-1]
            results['LASSO'] = X.columns[top_indices].tolist()
    except:
        results['LASSO'] = []
    
    # Create comparison DataFrame
    max_len = max(len(v) for v in results.values())
    comparison_data = {}
    
    for method, features in results.items():
        # Pad with empty strings
        comparison_data[method] = features + [''] * (max_len - len(features))
    
    comparison_df = pd.DataFrame(comparison_data)
    
    return comparison_df
