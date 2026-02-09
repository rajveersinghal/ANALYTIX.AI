import streamlit as st
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from components.header import header
from components.status_bar import status_bar
from components.api_client import get
from utils.ui_state import require_step

st.set_page_config(page_title="Executive Dashboard", layout="wide")

header("Executive Dashboard", "Step 9: High-Level Overview")
status_bar(9)

# Access Control
require_step("explainability")

if 'metadata' not in st.session_state:
    st.warning("Please upload a dataset first.")
    st.stop()

metadata = st.session_state['metadata']
file_id = metadata.get('dataset_id')
filename = metadata.get('filename', 'dataset')

st.subheader(f"Project: {filename}")

# KPI Cards
col1, col2, col3 = st.columns(3)

# Data Summary
# We can use the metadata directly instead of calling API if possible, but API is fine.
# Phase 18 goal: "Clean".
meta_summary = get(f"/dataset/summary/{file_id}")
if meta_summary:
    col1.metric("Rows", meta_summary.get("rows", 0))
    col1.metric("Features", meta_summary.get("columns", 0))
    col1.metric("Quality", f"{meta_summary.get('quality_score', 0)}%")
else:
    col1.warning("Data metrics unavailable")

# Model summary
# This endpoint reads model_info artifact
model_info = get(f"/model/best/{file_id}")
if model_info:
    col2.metric("Best Model", model_info.get("best_model", "N/A"))
    col2.metric("Metric", model_info.get("metric", "N/A").upper())
    col2.metric("Score", f"{model_info.get('best_score', 0):.4f}")
else:
    col2.warning("Model not trained")

# Key Insight
col3.info("💡 **Top Action**: Check decision recommendations for actionable next steps.")
col3.success("✅ **Status**: Ready for Decision Analysis")

st.markdown("---")

# Quick Links
c1, c2 = st.columns(2)
with c1:
    st.markdown("### 📊 Consolidated Summary")
    st.write("This dashboard aggregates insights from all previous steps.")

with c2:
    st.markdown("### 🚀 Next Steps")
    st.write("Translate these numbers into business decisions.")
    if st.button("Proceed to Decision Advisor ->", type="primary"):
        st.switch_page("pages/10_Decision_Advisor.py")
