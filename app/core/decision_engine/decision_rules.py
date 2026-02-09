# app/core/decision_engine/decision_rules.py

def generate_recommendations(feature_importance: dict, top_k: int = 3):
    """
    Converts feature importance into simple actionable recommendations.
    """
    if not feature_importance:
        return ["No significant feature influence detected to make recommendations."]

    recommendations = []

    # Sort by absolute impact
    sorted_features = sorted(
        feature_importance.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )

    for feature, impact in sorted_features[:top_k]:
        if impact > 0:
            recommendations.append(
                f"Increasing {feature} is likely to increase the predicted outcome."
            )
        else:
            recommendations.append(
                f"Reducing {feature} may help improve the predicted outcome."
            )

    return recommendations
