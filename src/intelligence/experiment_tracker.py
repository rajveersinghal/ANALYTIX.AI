import pandas as pd
import os
import uuid
from datetime import datetime
import json

TRACKER_FILE = "experiments.csv"

def log_experiment(model_name, params, metrics, features, dataset_shape, tags=None):
    """
    Logs experiment details to a CSV file.
    """
    experiment_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Flatten metrics for CSV (e.g. Accuracy, F1)
    # Assumes metrics is a dict like {'Accuracy': 0.9, 'F1': 0.8}
    
    new_record = {
        "Experiment ID": experiment_id,
        "Timestamp": timestamp,
        "Model": model_name,
        "Features Used": str(len(features)),
        "Rows": dataset_shape[0],
        "Features List": str(features),
        "Params": json.dumps(params or {}),
        "Metrics": json.dumps(metrics),
        "Tags": tags or ""
    }
    
    # Add scalar metrics columns for easier sorting
    for k, v in metrics.items():
        if isinstance(v, (int, float)):
            new_record[k] = v
            
    df_new = pd.DataFrame([new_record])
    
    if os.path.exists(TRACKER_FILE):
        df_old = pd.read_csv(TRACKER_FILE)
        df_combined = pd.concat([df_old, df_new], ignore_index=True)
    else:
        df_combined = df_new
        
    df_combined.to_csv(TRACKER_FILE, index=False)
    return experiment_id

def get_experiments():
    """Returns the experiments history as a DataFrame."""
    if os.path.exists(TRACKER_FILE):
        return pd.read_csv(TRACKER_FILE)
    return pd.DataFrame()
