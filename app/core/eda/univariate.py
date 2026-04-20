# app/core/eda/univariate.py
import pandas as pd
import numpy as np
from app.logger import logger

def analyze_univariate(df: pd.DataFrame, feature_types: dict):
    """
    Analyzes numerical features for skewness and range, and computes chart data.
    Dynamically selects visualization types based on distribution and cardinality.
    """
    insights = []
    plot_data = {
        "distributions": {}, # For Histograms/Bar
        "compositions": {},  # For Pie
        "indicators": {}     # For single stats
    }
    
    # 1. Analyze Numericals
    for col in feature_types.get("numerical_features", []):
         if col not in df.columns: continue
         
         valid_series = df[col].dropna()
         if valid_series.empty: continue
         
         unique_count = valid_series.nunique()
         
         # ADAPTIVE LOGIC: Select Plot Type
         if unique_count < 10:
             # Treat as Discrete/Ordinal -> Use Bar Chart
             logger.info(f"Feature '{col}' is numeric but discrete ({unique_count} unique). Using Bar Chart.")
             counts = valid_series.value_counts().sort_index()
             plot_data["distributions"][col] = {
                 "type": "bar",
                 "data": [{"label": str(idx), "count": int(val)} for idx, val in counts.items()]
             }
         else:
             # Treat as Continuous -> Use Histogram
             hist, edges = np.histogram(valid_series, bins=10)
             plot_data["distributions"][col] = {
                 "type": "histogram",
                 "data": [{"bin": f"{edges[i]:.1f}-{edges[i+1]:.1f}", "count": int(hist[i])} for i in range(len(hist))]
             }
         
         skew = valid_series.skew()
         kurtosis = valid_series.kurtosis()
         
         # Rule: Extreme skewness
         if abs(skew) > 1:
             direction = "right" if skew > 0 else "left"
             insights.append(f"Feature '{col}' shows significant {direction}-skewness ({skew:.2f}).")
             
         if kurtosis > 3:
             insights.append(f"Feature '{col}' has a 'Heavy Tail' distribution (Kurtosis: {kurtosis:.2f}).")

    # 2. Analyze Categoricals for Pie charts
    for col in feature_types.get("categorical_features", []):
        if col not in df.columns: continue
        
        unique_vals = df[col].nunique()
        if unique_vals > 50:
            insights.append(f"Feature '{col}' has high cardinality ({unique_vals} unique levels).")
            
        counts = df[col].value_counts().head(5) # Top 5 categories
        plot_data["compositions"][col] = [{"name": str(idx), "value": int(val)} for idx, val in counts.items()]

    return insights, plot_data
