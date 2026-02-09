# app/core/data_understanding/quality_checker.py
import pandas as pd

def calculate_quality_score(df: pd.DataFrame) -> int:
    """
    Calculates a data quality score from 0-100.
    Factors:
    - Missing values (weight 40%)
    - Duplicates (weight 20%)
    - Outliers (simplified, weight 20%) - Skipped for now to stay fast/simple or basic check
    - Column types consistency (weight 20%) - Assumed good if loaded
    
    Simplified 0-100 logic:
    Start with 100.
    - Subtract % of missing cells * 100 * 0.5
    - Subtract % of duplicate rows * 100 * 1.5
    """
    score = 100.0
    
    # Missing values penalty
    total_cells = df.size
    total_missing = df.isnull().sum().sum()
    missing_ratio = total_missing / total_cells if total_cells > 0 else 0
    score -= (missing_ratio * 100 * 0.5) # If 10% missing, -5 points. If 50% missing, -25 points.
    
    # Duplicate rows penalty
    total_rows = len(df)
    duplicates = df.duplicated().sum()
    duplicate_ratio = duplicates / total_rows if total_rows > 0 else 0
    score -= (duplicate_ratio * 100 * 0.5)
    
    return max(0, int(score))
