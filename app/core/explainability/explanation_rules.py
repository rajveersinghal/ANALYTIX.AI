# app/core/explainability/explanation_rules.py

def interpret_importance(importance_pct: float) -> str:
    """
    Translates importance percentage into descriptive text.
    """
    if importance_pct >= 50:
        return "Dominant Driver"
    elif importance_pct >= 20:
        return "Major Contributor"
    elif importance_pct >= 5:
        return "Moderate Influence"
    else:
        return "Minimal Impact"

def generate_sentence(feature_name: str, impact: str, rank: int):
    """
    Generates a natural language sentence for a feature.
    """
    if rank == 0:
        return f"The model relies heavily on **{feature_name}**, which is the primary driver of predictions."
    elif rank == 1:
        return f"**{feature_name}** is also a key factor, significantly influencing the outcome."
    elif impact == "Moderate Influence":
        return f"**{feature_name}** plays a moderate role."
    else:
        return None  # Skip minimal impact features in summary to keep it clean
