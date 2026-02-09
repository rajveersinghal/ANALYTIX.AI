import streamlit as st
from components.header import header
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from components.status_bar import status_bar

st.set_page_config(page_title="Data Understanding", layout="wide")

header("Data Understanding", "Step 3: AI-Driven Profile")
status_bar(3)

from utils.ui_state import require_step, get_metadata

# Access Control
require_step("data_understanding")

metadata = get_metadata()
if not metadata:
    st.warning("Please upload a dataset first.")
    st.stop()

# Top Metrics
col1, col2, col3, col4 = st.columns(4)
col1.metric("Rows", metadata.get("rows", 0))
col2.metric("Columns", metadata.get("columns", 0))
col3.metric("Data Quality", f"{metadata.get('data_quality_score', 0)}/100")
col4.metric("Memory Usage", metadata.get("memory_usage", "Unknown"))

st.markdown("### 🧠 AI Summary")
st.info(metadata.get("summary", "No summary available."))

# Feature Breakdown
st.markdown("### 🧬 Feature Structure")
c1, c2, c3 = st.columns(3)
with c1:
    st.markdown("#### Numerical")
    st.write(metadata.get("numerical_features", []))
with c2:
    st.markdown("#### Categorical")
    st.write(metadata.get("categorical_features", []))
with c3:
    st.markdown("#### Warnings")
    warnings = []
    if metadata.get('has_missing_values'): warnings.append("Missing Values Detected")
    if metadata.get('has_duplicates'): warnings.append("Duplicates Detected")
    if not warnings:
        st.success("No critical issues found.")
    else:
        for w in warnings:
            st.warning(w)

st.markdown("---")
if st.button("Proceed to Data Cleaning ->", type="primary"):
    st.switch_page("pages/4_Data_Cleaning.py")
