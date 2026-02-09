# app/core/decision_engine/what_if_simulator.py
import pandas as pd
import numpy as np

def simulate_what_if(model_pipeline, base_input: dict, changes: dict):
    """
    Simulates how changes in input affect the prediction using existing model pipeline.
    """
    # Convert dict to DataFrame for sklearn pipeline compatibility
    updated_input_dict = base_input.copy()
    updated_input_dict.update(changes)
    
    # We create DataFrames because the pipeline (StandardScaler, etc.) expects it
    df_base = pd.DataFrame([base_input])
    df_updated = pd.DataFrame([updated_input_dict])
    
    # Align columns if model has feature_names_in_
    if hasattr(model_pipeline, 'feature_names_in_'):
        expected_features = model_pipeline.feature_names_in_
        for df in [df_base, df_updated]:
            for col in expected_features:
                if col not in df.columns:
                    df[col] = 0 # Default for missing interactive input
            # Ensure correct order and only expected columns
            df = df[expected_features]
            
        # Re-assign after alignment (needs to handle the list update)
        # Re-creating to ensure the function scope variables are updated correctly
        df_base = pd.DataFrame([base_input])
        for col in expected_features:
            if col not in df_base.columns: df_base[col] = 0
        df_base = df_base[expected_features]
        
        df_updated = pd.DataFrame([updated_input_dict])
        for col in expected_features:
            if col not in df_updated.columns: df_updated[col] = 0
        df_updated = df_updated[expected_features]

    try:
        original_prediction = model_pipeline.predict(df_base)[0]
        new_prediction = model_pipeline.predict(df_updated)[0]
        
        # Handle numpy types for JSON serialization
        original_val = float(original_prediction)
        new_val = float(new_prediction)

        return {
            "original_prediction": original_val,
            "new_prediction": new_val,
            "impact": new_val - original_val
        }
    except Exception as e:
        raise ValueError(f"Simulation failed: {str(e)}")
