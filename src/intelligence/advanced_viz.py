from typing import List, Tuple, Optional
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from sklearn.model_selection import learning_curve
from sklearn.inspection import partial_dependence
import streamlit as st

def plot_partial_dependence(model, X: pd.DataFrame, features: List[str], problem_type: str):
    """
    Creates Partial Dependence Plots showing feature impact on predictions.
    
    Args:
        model: Trained sklearn model.
        X: Feature DataFrame.
        features: List of feature names to plot (max 4).
        problem_type: 'Classification' or 'Regression'.
    """
    features = features[:4]  # Limit to 4 for readability
    
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=[f"PDP: {f}" for f in features[:4]]
    )
    
    for idx, feature in enumerate(features):
        if feature not in X.columns:
            continue
            
        row = (idx // 2) + 1
        col = (idx % 2) + 1
        
        try:
            # Calculate partial dependence
            pd_result = partial_dependence(
                model, X, features=[feature],
                grid_resolution=50
            )
            
            fig.add_trace(
                go.Scatter(
                    x=pd_result['grid_values'][0],
                    y=pd_result['average'][0],
                    mode='lines',
                    name=feature,
                    line=dict(color='#4f46e5', width=3)
                ),
                row=row, col=col
            )
        except:
            st.warning(f"Could not generate PDP for {feature}")
    
    fig.update_layout(
        height=600,
        showlegend=False,
        title_text="Partial Dependence Plots - Feature Impact Analysis"
    )
    
    st.plotly_chart(fig, use_container_width=True)

def plot_learning_curve(model, X: pd.DataFrame, y: pd.Series, cv: int = 5):
    """
    Plots learning curves showing model performance vs training size.
    
    Args:
        model: Sklearn model (untrained).
        X: Features.
        y: Target.
        cv: Cross-validation folds.
    """
    train_sizes, train_scores, val_scores = learning_curve(
        model, X, y, cv=cv, n_jobs=-1,
        train_sizes=np.linspace(0.1, 1.0, 10),
        scoring='neg_mean_squared_error' if hasattr(model, 'predict') else 'accuracy'
    )
    
    train_mean = -train_scores.mean(axis=1) if 'neg' in str(train_scores[0][0]) else train_scores.mean(axis=1)
    val_mean = -val_scores.mean(axis=1) if 'neg' in str(val_scores[0][0]) else val_scores.mean(axis=1)
    
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=train_sizes, y=train_mean,
        mode='lines+markers',
        name='Training Score',
        line=dict(color='#10b981', width=3)
    ))
    
    fig.add_trace(go.Scatter(
        x=train_sizes, y=val_mean,
        mode='lines+markers',
        name='Validation Score',
        line=dict(color='#ef4444', width=3)
    ))
    
    fig.update_layout(
        title="Learning Curve - Performance vs Training Size",
        xaxis_title="Training Examples",
        yaxis_title="Score",
        height=500
    )
    
    st.plotly_chart(fig, use_container_width=True)

def plot_residuals(y_true: pd.Series, y_pred: pd.Series):
    """
    Creates residual plot for regression models.
    
    Args:
        y_true: Actual values.
        y_pred: Predicted values.
    """
    residuals = y_true - y_pred
    
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=["Residuals vs Predicted", "Residual Distribution"]
    )
    
    # Residual scatter
    fig.add_trace(
        go.Scatter(
            x=y_pred, y=residuals,
            mode='markers',
            marker=dict(color='#4f46e5', opacity=0.6),
            name='Residuals'
        ),
        row=1, col=1
    )
    
    # Zero line
    fig.add_hline(y=0, line_dash="dash", line_color="red", row=1, col=1)
    
    # Residual histogram
    fig.add_trace(
        go.Histogram(
            x=residuals,
            marker=dict(color='#7c3aed'),
            name='Distribution'
        ),
        row=1, col=2
    )
    
    fig.update_layout(height=400, showlegend=False)
    st.plotly_chart(fig, use_container_width=True)

def plot_feature_interactions(model, X: pd.DataFrame, feature_pairs: List[Tuple[str, str]]):
    """
    Visualizes 2D feature interactions.
    
    Args:
        model: Trained model.
        X: Features.
        feature_pairs: List of (feature1, feature2) tuples to plot.
    """
    for f1, f2 in feature_pairs[:2]:  # Limit to 2 pairs
        if f1 not in X.columns or f2 not in X.columns:
            continue
        
        # Create grid
        x1_range = np.linspace(X[f1].min(), X[f1].max(), 20)
        x2_range = np.linspace(X[f2].min(), X[f2].max(), 20)
        x1_grid, x2_grid = np.meshgrid(x1_range, x2_range)
        
        # Create prediction grid
        grid_df = X.iloc[:1].copy()
        predictions = []
        
        for i in range(len(x1_range)):
            for j in range(len(x2_range)):
                grid_df[f1] = x1_grid[j, i]
                grid_df[f2] = x2_grid[j, i]
                pred = model.predict(grid_df)[0]
                predictions.append(pred)
        
        pred_grid = np.array(predictions).reshape(x1_grid.shape)
        
        fig = go.Figure(data=go.Contour(
            x=x1_range,
            y=x2_range,
            z=pred_grid,
            colorscale='Viridis'
        ))
        
        fig.update_layout(
            title=f"Feature Interaction: {f1} vs {f2}",
            xaxis_title=f1,
            yaxis_title=f2,
            height=500
        )
        
        st.plotly_chart(fig, use_container_width=True)
