def detect_risks(metadata: dict, model_metrics: dict) -> list:
    """
    Flags potential risks in decision making.
    """
    risks = []
    
    # 1. Data Quality Risk
    dq_score = metadata.get("data_quality_score", 100)
    if dq_score < 60:
        risks.append({
            "risk": "Low Data Quality",
            "severity": "High",
            "detail": f"Data Quality Score is {dq_score}%. Recommendations may be unreliable due to missing/noisy data."
        })
    elif dq_score < 80:
        risks.append({
            "risk": "Moderate Data Quality",
            "severity": "Medium",
            "detail": f"Data Quality is decent ({dq_score}%), but check for outliers."
        })
        
    # 2. Model Performance Risk
    score = model_metrics.get("best_score", 0)
    metric = model_metrics.get("metric", "score")
    
    # Heuristic for R2 or Accuracy
    if score < 0.5:
        risks.append({
            "risk": "Weak Model Performance",
            "severity": "Critical",
            "detail": f"Model {metric} is only {score:.2f}. Predictions are likely random guesses."
        })
    elif score < 0.7:
        risks.append({
            "risk": "Moderate Model Confidence",
            "severity": "Medium",
            "detail": f"Model explains some variance but has significant error room ({metric}={score:.2f})."
        })
        
    # 3. Data Size Risk
    rows = metadata.get("rows", 0)
    if rows < 100:
        risks.append({
            "risk": "Small Sample Size",
            "severity": "High",
            "detail": "Dataset has very few rows (<100). Statistical significance is weak."
        })
        
    return risks
