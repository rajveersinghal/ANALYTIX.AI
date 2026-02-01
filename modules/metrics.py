from sklearn.metrics import accuracy_score, recall_score, precision_score, f1_score, roc_auc_score, mean_squared_error, r2_score
import streamlit as st
from modules.utils import Logger

def select_smart_metrics(problem_type, is_imbalanced):
    """
    Returns the primary metric to optimize for.
    """
    if problem_type == "Regression":
        return "RMSE"
    elif problem_type == "Classification":
        if is_imbalanced:
            Logger.log("ℹ️ Smart Metric: Using 'F1-Score' due to class imbalance.")
            return "F1 Score"
        else:
            Logger.log("ℹ️ Smart Metric: Using 'Accuracy' for balanced classes.")
            return "Accuracy"

def evaluate_model(model, X_test, y_test, problem_type):
    """
    Evaluates and returns dictionary of metrics.
    """
    y_pred = model.predict(X_test)
    metrics = {}
    
    if problem_type == "Regression":
        rmse = mean_squared_error(y_test, y_pred) ** 0.5
        r2 = r2_score(y_test, y_pred)
        metrics["RMSE"] = rmse
        metrics["R2"] = r2
        
    elif problem_type == "Classification":
        # Handle multi-class vs binary for average param
        avg_method = 'weighted' if len(set(y_test)) > 2 else 'binary'
        
        metrics["Accuracy"] = accuracy_score(y_test, y_pred)
        metrics["F1 Score"] = f1_score(y_test, y_pred, average=avg_method)
        try:
            metrics["Recall"] = recall_score(y_test, y_pred, average=avg_method)
            metrics["Precision"] = precision_score(y_test, y_pred, average=avg_method)
        except:
             pass 
             
    return metrics
