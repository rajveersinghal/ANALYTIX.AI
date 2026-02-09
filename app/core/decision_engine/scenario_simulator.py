import pandas as pd
import numpy as np

def simulate_scenario(model_pipeline, base_data: pd.DataFrame, feature: str, change_pct: float = 0.10):
    """
    Simulates changing a single feature by ±10% and observing target change.
    Uses a sample of the data (e.g. mean row or random sample).
    """
    try:
        # Create a base 'representative' row (e.g., median of dataset)
        # Select numeric columns only for median calculation to avoid errors
        numeric_df = base_data.select_dtypes(include=[np.number])
        if numeric_df.empty:
             return None # Can't simulate without numeric data easily
             
        base_row = numeric_df.median().to_frame().T
        
        # Fill categorical with mode?
        # For MVP, we simulated numeric features primarily.
        
        # Ensure 'feature' is in base_row
        if feature not in base_row.columns:
            return {"error": "Feature not numeric or not found"}
            
        original_val = base_row[feature].values[0]
        new_val = original_val * (1 + change_pct)
        
        # Create modified row
        mod_row = base_row.copy()
        mod_row[feature] = new_val
        
        # Predict
        # Note: model_pipeline might expect categorical columns too.
        # If we passed median of ALL columns, we need to handle categoricals.
        # Let's try to grab a real row instead of median to be sage with pipeline validation
        base_row = base_data.iloc[0:1].copy()
        
        original_val = base_row[feature].values[0]
        if not isinstance(original_val, (int, float, np.number)):
             return {"error": "Cannot simulate non-numeric feature"}

        new_val = original_val * (1 + change_pct)
        mod_row = base_row.copy()
        mod_row[feature] = new_val
        
        pred_base = model_pipeline.predict(base_row)[0]
        pred_mod = model_pipeline.predict(mod_row)[0]
        
        change = pred_mod - pred_base
        pct_change = (change / pred_base) * 100 if pred_base != 0 else 0
        
        return {
            "feature": feature,
            "original_value": float(original_val),
            "new_value": float(new_val),
            "expected_change_pct": round(pct_change, 2),
            "direction": "Increase" if change > 0 else "Decrease"
        }
    except Exception as e:
        return {"error": str(e)}
