from typing import Dict, List, Tuple, Any, Optional
import pandas as pd
import numpy as np
import streamlit as st
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import HistGradientBoostingRegressor, HistGradientBoostingClassifier
from sklearn.dummy import DummyRegressor, DummyClassifier
from modules.utils import Logger, safe_execution
from modules import metrics, imbalance_handler

def detect_problem_type(df: pd.DataFrame, target_col: str) -> str:
    """
    Heuristic to detect if problem is Regression or Classification based on target cardinality.
    """
    if df[target_col].nunique() < 20 or df[target_col].dtype == 'object':
        return "Classification"
    else:
        return "Regression"

@safe_execution
def train_and_evaluate(df: pd.DataFrame, target_col: str, problem_type: str) -> Tuple[Dict[str, Any], Dict[str, Any], List[str], pd.DataFrame, pd.Series]:
    """
    High-fidelity training pipeline with automated hyperparameter tuning.
    Returns: (results, models, feature_names, X_test, y_test)
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    # Train-test split (Fixed seed for reproducibility)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Handle Imbalance (Only on Train set to prevent leakage!)
    if problem_type == "Classification":
        X_train, y_train = imbalance_handler.handle_imbalance(X_train, y_train)
        
    results = {}
    models = {}
    
    # 1. Baseline Model
    if problem_type == "Regression":
        baseline = DummyRegressor(strategy="mean")
        baseline.fit(X_train, y_train)
        results["Baseline (Mean)"] = metrics.evaluate_model(baseline, X_test, y_test, problem_type)
        
    else:
        baseline = DummyClassifier(strategy="most_frequent")
        baseline.fit(X_train, y_train)
        results["Baseline (Mode)"] = metrics.evaluate_model(baseline, X_test, y_test, problem_type)
        
    Logger.log(f"✔ Trained Baseline Model ({problem_type}).")

    # 2. Models & Tuning
    if problem_type == "Regression":
        # Linear Regression
        lr = LinearRegression(n_jobs=-1)
        lr.fit(X_train, y_train)
        results["Linear Regression"] = metrics.evaluate_model(lr, X_test, y_test, problem_type)
        models["Linear Regression"] = lr
        
        # PRO: Optimized Gradient Boosting
        gb = HistGradientBoostingRegressor(random_state=42)
        param_grid = {
            'max_iter': [100, 200],
            'learning_rate': [0.01, 0.1, 0.2],
            'max_depth': [3, 5, 8],
            'l2_regularization': [0, 0.1, 1.0]
        }
        
        with st.spinner("🚀 Tuning Gradient Boosting for maximum accuracy..."):
             search = RandomizedSearchCV(gb, param_grid, n_iter=10, cv=3, random_state=42, n_jobs=-1)
             search.fit(X_train, y_train)
             best_gb = search.best_estimator_
             results["Gradient Boosting (Optimized)"] = metrics.evaluate_model(best_gb, X_test, y_test, problem_type)
             models["Gradient Boosting"] = best_gb
             Logger.log(f"🏆 Best Params: {search.best_params_}")
        
    elif problem_type == "Classification":
        # Logistic Regression
        lr = LogisticRegression(max_iter=5000, n_jobs=-1)
        lr.fit(X_train, y_train)
        results["Logistic Regression"] = metrics.evaluate_model(lr, X_test, y_test, problem_type)
        models["Logistic Regression"] = lr
        
        # PRO: Optimized Gradient Boosting
        gb = HistGradientBoostingClassifier(random_state=42)
        param_grid = {
            'max_iter': [100, 200],
            'learning_rate': [0.01, 0.1, 0.2],
            'max_depth': [3, 5, 8],
            'l2_regularization': [0, 0.1, 1.0]
        }
        
        with st.spinner("🚀 Tuning Gradient Boosting for maximum accuracy..."):
             search = RandomizedSearchCV(gb, param_grid, n_iter=10, cv=3, random_state=42, n_jobs=-1)
             search.fit(X_train, y_train)
             best_gb = search.best_estimator_
             results["Gradient Boosting (Optimized)"] = metrics.evaluate_model(best_gb, X_test, y_test, problem_type)
             models["Gradient Boosting"] = best_gb
             Logger.log(f"🏆 Best Params: {search.best_params_}")
        
    return results, models, X.columns.tolist(), X_test, y_test
