from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from imblearn.over_sampling import SMOTE, RandomOverSampler
from imblearn.under_sampling import RandomUnderSampler
from sklearn.utils.class_weight import compute_class_weight
from collections import Counter
from modules.utils import Logger
import streamlit as st

def detect_imbalance(y: pd.Series, threshold: float = 0.3) -> Dict[str, Any]:
    """
    Detects class imbalance in target variable.
    
    Args:
        y: Target variable.
        threshold: Minority class ratio threshold (default: 0.3 = 30%).
        
    Returns:
        Dictionary with imbalance info: is_imbalanced, class_distribution, minority_ratio.
    """
    value_counts = y.value_counts()
    total = len(y)
    
    class_distribution = (value_counts / total * 100).to_dict()
    minority_ratio = value_counts.min() / total
    is_imbalanced = minority_ratio < threshold
    
    if is_imbalanced:
        Logger.log(f"⚖️ Class imbalance detected: Minority class = {minority_ratio:.1%}")
    else:
        Logger.log(f"✅ Classes are balanced: Minority class = {minority_ratio:.1%}")
    
    return {
        'is_imbalanced': is_imbalanced,
        'class_distribution': class_distribution,
        'minority_ratio': minority_ratio,
        'majority_class': value_counts.idxmax(),
        'minority_class': value_counts.idxmin()
    }

def handle_imbalance(X: pd.DataFrame, y: pd.Series, method: str = 'smote') -> tuple:
    """
    Handles class imbalance using various techniques.
    
    Args:
        X: Feature DataFrame.
        y: Target Series.
        method: 'smote', 'oversample', 'undersample', or 'class_weights'.
        
    Returns:
        tuple: (X_resampled, y_resampled) or (X, y, class_weights_dict)
    """
    if method == 'smote':
        try:
            min_samples = min(Counter(y).values())
            k = min(5, min_samples - 1)
            smote = SMOTE(random_state=42, k_neighbors=k)
            X_resampled, y_resampled = smote.fit_resample(X, y)
            Logger.log(f"✅ SMOTE applied: {len(X)} → {len(X_resampled)} samples")
            return X_resampled, y_resampled
        except Exception as e:
            Logger.log(f"⚠️ SMOTE failed ({str(e)}), falling back to random oversampling")
            method = 'oversample'
    
    if method == 'oversample':
        ros = RandomOverSampler(random_state=42)
        X_resampled, y_resampled = ros.fit_resample(X, y)
        Logger.log(f"✅ Random Oversampling applied: {len(X)} → {len(X_resampled)} samples")
        return X_resampled, y_resampled
    
    elif method == 'undersample':
        rus = RandomUnderSampler(random_state=42)
        X_resampled, y_resampled = rus.fit_resample(X, y)
        Logger.log(f"✅ Random Undersampling applied: {len(X)} → {len(X_resampled)} samples")
        return X_resampled, y_resampled
    
    elif method == 'class_weights':
        # Compute class weights
        classes = np.unique(y)
        weights = compute_class_weight('balanced', classes=classes, y=y)
        class_weights = dict(zip(classes, weights))
        Logger.log(f"✅ Class weights computed: {class_weights}")
        return X, y, class_weights
    
    return X, y

def get_imbalance_recommendations(imbalance_info: Dict[str, Any]) -> list:
    """
    Generates recommendations for handling class imbalance.
    
    Args:
        imbalance_info: Output from detect_imbalance().
        
    Returns:
        List of recommendation strings.
    """
    if not imbalance_info['is_imbalanced']:
        return ["✅ Classes are balanced. No special handling needed."]
    
    minority_ratio = imbalance_info['minority_ratio']
    
    recommendations = [
        f"### ⚖️ Class Imbalance Detected",
        f"**Minority class ratio**: {minority_ratio:.1%}",
        "",
        "**Recommended Strategies**:",
        ""
    ]
    
    if minority_ratio < 0.1:  # Severe imbalance
        recommendations.extend([
            "🔴 **Severe Imbalance** (< 10%)",
            "1. **SMOTE** (Synthetic Minority Over-sampling) - Creates synthetic samples",
            "2. **Class Weights** - Penalize misclassifying minority class more",
            "3. **Ensemble Methods** - Use balanced random forests",
            "4. **Anomaly Detection** - Treat minority class as anomaly",
            ""
        ])
    elif minority_ratio < 0.3:  # Moderate imbalance
        recommendations.extend([
            "🟡 **Moderate Imbalance** (10-30%)",
            "1. **SMOTE** - Recommended first approach",
            "2. **Random Oversampling** - Duplicate minority samples",
            "3. **Class Weights** - Adjust model to focus on minority class",
            ""
        ])
    
    recommendations.extend([
        "**Evaluation Metrics**:",
        "- ❌ Don't rely on Accuracy alone",
        "- ✅ Use F1-Score, Precision, Recall",
        "- ✅ Check confusion matrix for both classes",
        "- ✅ Use ROC-AUC or PR-AUC curves"
    ])
    
    return recommendations
