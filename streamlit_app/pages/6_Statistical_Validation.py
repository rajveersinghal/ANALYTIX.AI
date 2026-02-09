import streamlit as st
import pandas as pd
import sys
import os
import json
from app.config import settings

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from components.header import header
from components.status_bar import status_bar
from utils.ui_state import require_step, get_metadata

st.set_page_config(page_title="Statistics Results", layout="wide")

header("Statistical Validation", "Step 6: Hypothesis Testing")
status_bar(6)

# Access Control
require_step("statistics")

metadata = get_metadata()
if not metadata:
    st.warning("Please upload a dataset first.")
    st.stop()

file_id = metadata.get('dataset_id')

# Load Stats from Metadata
data = metadata.get("stats_summary", {})

if data:
    significant = data.get("significant_features", [])
    warnings = data.get("warnings", [])
     
    col1, col2 = st.columns(2)
     
    with col1:
        st.subheader("✅ Significant Drivers")
        if significant:
            st.dataframe(
                 pd.DataFrame(significant).style.highlight_max(axis=0), 
                  width="stretch"
            )
            st.caption("These features have a statistically proven relationship with the target.")
        else:
            st.info("No statistically significant drivers found.")
             
    with col2:
        st.subheader("⚠️ Stability Checks")
        if warnings:
            for w in warnings:
                st.error(f" Risk: {w}")
        else:
            st.success("✅ All statistical assumptions passed (Normality, Homoscedasticity).")
else:
    st.warning("Statistical analysis results not found in metadata. Please re-run the pipeline.")

st.markdown("---")
if st.button("Proceed to AutoML ->", type="primary"):
    st.switch_page("pages/7_Modeling.py")
