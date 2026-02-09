import streamlit as st
import requests
import sys
import os
import pandas as pd
from app.config import settings

# Ensure we can import components
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from streamlit_app.components.header import header
from streamlit_app.components.status_bar import status_bar
from streamlit_app.components.api_client import post, BASE_URL
from streamlit_app.utils.ui_state import require_step

st.set_page_config(page_title="Decision Assistant", layout="wide")

header("Decision Assistant", "Actionable Guidance & What-If Scenarios")
status_bar(10)

# Access Control
require_step("modeling") # Needs a model

if 'metadata' not in st.session_state:
    st.warning("Please upload a dataset first.")
    st.stop()
    
metadata = st.session_state['metadata']
file_id = metadata.get('dataset_id')
target_col = metadata.get('target_column', 'Target')
numerical_cols = metadata.get('numerical_features', [])

# BASE_URL imported from api_client

# 1. Fetch Automated Recommendations
st.subheader("💡 Actionable Recommendations")
try:
    res = requests.get(f"{BASE_URL}/decision/recommend/{file_id}")
    if res.status_code == 200:
        data = res.json().get("data", {})
        recs = data.get("recommendations", [])
        if recs:
            for r in recs:
                st.success(f"**Insight**: {r}")
        else:
            st.info("No specific recommendations generated yet. Ensure Modeling and EDA steps are completed.")
except Exception as e:
    st.error(f"Failed to fetch recommendations: {e}")

st.markdown("---")

# 2. What-If Simulator
st.subheader("🧪 What-If Simulator")
st.markdown(f"Simulate how hypothetical changes in your data would affect the predicted **{target_col}**.")

# Setup base input (mean values for numerical features)
base_input = {}
if numerical_cols:
    # In a real app, we'd fetch the actual means from metadata. 
    # For the advisor demo, we'll try to get them or use fallback.
    eda_res = metadata.get("eda_results", {})
    stats = eda_res.get("statistics", {}) # This might contain means
    
    col_input_1, col_input_2 = st.columns(2)
    changes = {}
    
    with st.expander("Adjust Simulated Values", expanded=True):
        cols = st.columns(3)
        for i, feat in enumerate(numerical_cols[:6]): # Limit to top 6 for clean UI
            if feat == target_col: continue
            
            # Use columns for layout
            with cols[i % 3]:
                val = st.number_input(f"{feat}", value=0.0, key=f"base_{feat}")
                base_input[feat] = val
                
                # Slider for change
                # We'll use a % change approach or direct delta
                change_delta = st.slider(f"Adjust {feat}", -100.0, 100.0, 0.0, key=f"delta_{feat}")
                if change_delta != 0:
                    changes[feat] = val + change_delta

    # Fill in missing numericals with 0 if not handled
    for feat in numerical_cols:
        if feat not in base_input: base_input[feat] = 0.0

    # 3. Predict & Show Impact
    if st.button("Calculate Simulated Impact", type="primary"):
        with st.spinner("Simulating outcome..."):
            try:
                payload = {
                    "base_input": base_input,
                    "changes": changes
                }
                res = requests.post(f"{BASE_URL}/decision/assist/{file_id}", json=payload)
                
                if res.status_code == 200:
                    result = res.json().get("data", {})
                    what_if = result.get("what_if", {})
                    
                    st.markdown("### 📊 Simulation Results")
                    m1, m2, m3 = st.columns(3)
                    
                    unit = result.get("unit", "")
                    m1.metric("Current Prediction", f"{what_if.get('original_prediction', 0):.2f} {unit}")
                    m2.metric("Simulated Prediction", f"{what_if.get('new_prediction', 0):.2f} {unit}")
                    m3.metric("Predicted Impact", f"{what_if.get('impact', 0):.2f} {unit}", delta=f"{what_if.get('impact', 0):.2f} {unit}")
                    
                    # Narrative Summary
                    st.info(" \n ".join(result.get("summary", [])))
                else:
                    st.error(f"Simulation failed: {res.json().get('detail', 'Unknown error')}")
            except Exception as e:
                st.error(f"Connection Error: {e}")
else:
    st.warning("Decision Assistant requires numerical features to simulate changes.")

st.markdown("---")
if st.button("Final Step: Generate Professional Report ->", type="primary"):
    st.switch_page("pages/11_Report.py")
