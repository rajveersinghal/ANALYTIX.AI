import pandas as pd
import numpy as np

def analyze_feature_impact(importances: list, correlations: dict, feature_names: list) -> list:
    """
    Combines importance magnitude (from Model) with direction (from Correlation or Coefficients).
    Returns a list of dicts: {'feature': name, 'impact': score, 'direction': 'positive'/'negative', 'strength': 'high'/'low'}
    """
    analyzed_features = []
    
    # Create a map for correlations
    corr_map = correlations if correlations else {}
    
    for item in importances:
        feat = item['feature']
        score = item['importance']
        
        # Determine Direction
        # First try coefficient if available in the importance object (Phase 6 might not pass it, let's check Phase 6 output)
        # Phase 6 'feature_importance.py' returns {'feature': name, 'importance': val}
        # So we look at Correlation from Phase 3 (passed in `correlations` dict)
        
        direction = "neutral"
        corr_val = corr_map.get(feat, 0)
        
        if corr_val > 0.1:
            direction = "positive"
        elif corr_val < -0.1:
            direction = "negative"
            
        strength = "high" if score > 0.1 else "medium" if score > 0.01 else "low"
        
        analyzed_features.append({
            "feature": feat,
            "importance": score,
            "direction": direction,
            "correlation": corr_val,
            "strength": strength
        })
        
    return analyzed_features
