import streamlit as st
import pandas as pd
import plotly.express as px

def render_monitoring_dashboard(experiments_df):
    """
    Renders the performance monitoring tab.
    """
    st.subheader("📈 Model Performance Monitoring")
    
    if experiments_df.empty:
        st.info("No experiments logged yet.")
        return

    # Trend Line
    if "Timestamp" in experiments_df.columns:
        experiments_df["Timestamp"] = pd.to_datetime(experiments_df["Timestamp"])
        
        # Identify metric columns (heuristic: floats)
        metric_cols = [c for c in experiments_df.columns if c not in ["Timestamp", "Model", "Experiment ID", "Features Used", "Rows", "Features List", "Params", "Metrics", "Tags"]]
        
        if metric_cols:
            selected_metric = st.selectbox("Select Metric to Monitor", metric_cols)
            
            fig = px.line(experiments_df, x="Timestamp", y=selected_metric, color="Model", markers=True, title=f"{selected_metric} over Time")
            st.plotly_chart(fig, use_container_width=True)
            
            if len(experiments_df) > 1:
                latest = experiments_df.iloc[-1][selected_metric]
                previous = experiments_df.iloc[-2][selected_metric]
                change = latest - previous
                st.metric(f"Latest {selected_metric}", round(latest, 4), delta=round(change, 4))
        else:
            st.write("No numeric metrics found to plot.")
