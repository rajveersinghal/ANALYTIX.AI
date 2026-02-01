import pandas as pd
import numpy as np

def calculate_readiness_score(df):
    """
    Calculates a 'readiness score' (0-100) and provides a DETAILED breakdown.
    """
    score = 100
    explanations = []
    
    # 1. Missing Values
    missing_pct = df.isnull().mean().mean()
    if missing_pct > 0.4:
        score -= 40
        explanations.append("❌ **High Missing Data**: >40% of your data is empty. (Penalty: -40)")
    elif missing_pct > 0.1:
        score -= 20
        explanations.append("⚠️ **Moderate Missing Data**: >10% of your data is empty. (Penalty: -20)")
    elif missing_pct > 0:
        score -= 5
        explanations.append("ℹ️ **Some Missing Data**: Small amount of missing values found. (Penalty: -5)")
    else:
        explanations.append("✅ **No Missing Data**: Dataset is complete! (+0)")
        
    # 2. Dataset Size
    if len(df) < 50:
        score -= 30
        explanations.append("❌ **Tiny Dataset**: <50 rows is too small for reliable ML. (Penalty: -30)")
    elif len(df) < 200:
        score -= 10
        explanations.append("⚠️ **Small Dataset**: <200 rows might lead to overfitting. (Penalty: -10)")
    else:
        explanations.append("✅ **Sufficient Size**: Row count is healthy. (+0)")
        
    # 3. Duplicate Rows
    duplicates = df.duplicated().sum()
    if duplicates > 0:
        deduction = min(15, int((duplicates / len(df)) * 50))
        score -= deduction
        explanations.append(f"⚠️ **Duplicate Rows**: Found {duplicates} duplicates. (Penalty: -{deduction})")
    
    # Floor score at 0
    score = max(0, score)
    
    # Summary
    if score >= 80:
        summary = "🌟 **Excellent**: Your data is ready for modeling!"
    elif score >= 50:
        summary = "⚠️ **Fair**: Needs cleaning but usable."
    else:
        summary = "❌ **Poor**: Requires significant cleaning or more data."
        
    # Join explanations
    detailed_explanation = f"{summary}\n\n**Breakdown:**\n" + "\n".join(explanations)
    
    return score, detailed_explanation
