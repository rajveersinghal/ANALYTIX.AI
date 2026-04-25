def generate_recommendations(analyzed_features: list, target_name: str) -> list:
    """
    Generates text recommendations.
    input: analyzed_features (list): Output from feature_impact_analyzer
    """
    recommendations = []
    
    for feat in analyzed_features:
        name = feat['feature']
        direction = feat['direction']
        strength = feat['strength']
        
        if strength == "low":
            continue
            
        action = ""
        effect = ""
        
        if direction == "positive":
            action = f"Increase/Focus on {name}"
            effect = f"improve {target_name}"
        elif direction == "negative":
            action = f"Reduce/Monitor {name}"
            effect = f"improve {target_name}"
        else:
            action = f"Maintain {name} stability"
            effect = f"stabilize {target_name}"
            
        confidence = "High" if strength == "high" else "Medium"
        
        rec_text = f"{action} to {effect}."
        
        recommendations.append({
            "feature": name,
            "recommendation": rec_text,
            "confidence": confidence,
            "action_type": "increase" if direction == "positive" else "decrease" if direction == "negative" else "maintain"
        })
        
    return recommendations
