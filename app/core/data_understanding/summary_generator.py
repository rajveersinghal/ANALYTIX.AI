# app/core/data_understanding/summary_generator.py
from typing import Dict, Any

def generate_summary(metadata: Dict[str, Any]) -> str:
    """
    Generates a human-readable summary of the dataset.
    """
    rows = metadata.get("rows", 0)
    cols = metadata.get("columns", 0)
    target_list = metadata.get("possible_target_columns", [])
    target = target_list[0] if target_list else None
    prob_type = metadata.get("problem_type", "unknown")
    quality = metadata.get("data_quality_score", 0)
    
    summary = f"Dataset contains {rows:,} records and {cols} columns. "
    
    if quality >= 80:
        summary += "The data quality is high. "
    elif quality >= 60:
        summary += "The data quality is moderate. "
    else:
        summary += "The data quality is low, cleaning will be required. "
        
    if target:
        summary += f"Target variable appears to be '{target}', indicating a {prob_type} problem."
    else:
        summary += f"No clear target variable found, suggesting a {prob_type} task."
        
    return summary
