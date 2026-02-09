# app/core/decision_engine/decision_generator.py

def generate_decision_summary(recommendations: list, what_if_result: dict, unit: str = "units"):
    """
    Produces a human-readable summary of analysis and simulated impact.
    """
    summary = []

    summary.append("Decision Assistant Insights:")

    if not recommendations:
        summary.append("- No specific recommendations could be generated at this time.")
    else:
        for rec in recommendations:
            summary.append(f"- {rec}")

    impact = what_if_result.get('impact', 0)
    unit_label = unit if unit else "units"
    summary.append(
        f"Applying the selected changes may alter the predicted result by "
        f"{impact:.2f} {unit_label}."
    )

    return summary
