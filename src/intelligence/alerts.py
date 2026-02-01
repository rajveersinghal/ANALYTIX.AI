import streamlit as st

def check_alerts(drift_report, current_accuracy, baseline_accuracy):
    """
    Generates system alerts based on drift and performance.
    """
    alerts = []
    
    # 1. Drift Alerts
    if drift_report is not None and not drift_report.empty:
        drifted_feats = drift_report[drift_report["PSI"] > 0.2]
        if not drifted_feats.empty:
            msg = f"🔴 **High Data Drift**: {len(drifted_feats)} features have shifted significantly (PSI > 0.2). Model requires retraining."
            alerts.append(msg)
            
    # 2. Performance Alerts
    if current_accuracy < (baseline_accuracy * 0.9): # 10% drop
        msg = "⚠️ **Performance Drop**: Model is performing 10% worse than baseline."
        alerts.append(msg)
        
    return alerts

def display_alerts(alerts):
    if alerts:
        st.error("🚨 **System Alerts Triggered**")
        for alert in alerts:
            st.markdown(f"- {alert}")
