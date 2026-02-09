# app/utils/domain_config.py

DOMAIN_UNITS = {
    "real_estate": {"regression": "Lakhs", "clustering": "Units"},
    "finance": {"regression": "USD", "classification": "Level", "anomaly_detection": "Score"},
    "business": {"regression": "Units", "classification": "Category", "forecasting": "Sales"},
    "customer": {"classification": "Churn Prob", "clustering": "Segment"},
    "operations": {"regression": "Efficiency", "forecasting": "Qty"}
}

def get_unit(domain: str, problem_type: str) -> str:
    """Returns the appropriate unit/suffix for a given domain and task."""
    domain_data = DOMAIN_UNITS.get(domain.lower(), {})
    return domain_data.get(problem_type.lower(), "")

def format_value(value: float, domain: str, problem_type: str) -> str:
    """Formats a numerical value with the appropriate unit/prefix."""
    unit = get_unit(domain, problem_type)
    if not unit:
        return f"{value:.2f}"
    
    if unit in ["USD", "$", "₹"]:
        return f"{unit} {value:,.2f}"
    return f"{value:,.2f} {unit}"
