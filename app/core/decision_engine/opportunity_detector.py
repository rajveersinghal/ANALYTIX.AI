def detect_opportunities(analyzed_features: list) -> list:
    """
    Identifies high-potential areas.
    """
    opportunities = []
    
    # 1. Identify "Hidden Gems" - Medium importance but high correlation?
    # Or simply identifying the strongest drivers as "Primary Levers"
    
    sorted_feats = sorted(analyzed_features, key=lambda x: x['importance'], reverse=True)
    
    for feat in sorted_feats[:3]:
        if feat['direction'] == 'positive':
            opportunities.append({
                "opportunity": f"Leverage {feat['feature']}",
                "detail": f"**{feat['feature']}** is a top driver. Maximizing this generally leads to best results."
            })
        elif feat['direction'] == 'negative':
             opportunities.append({
                "opportunity": f"Optimize {feat['feature']}",
                "detail": f"**{feat['feature']}** strongly reduces the target. Minimizing it presents a quick win."
            })
            
    return opportunities
