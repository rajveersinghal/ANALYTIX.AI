import streamlit as st
import pandas as pd
import altair as alt
import sys
import os
import json
from app.config import settings

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from components.header import header
from components.status_bar import status_bar
from utils.ui_state import require_step, get_metadata

st.set_page_config(page_title="EDA Results", layout="wide")

header("EDA & Insights", "Step 5: Visual Pattern Discovery")
status_bar(5)

# Access Control
require_step("eda")

metadata = get_metadata()
if not metadata:
    st.warning("Please upload a dataset first.")
    st.stop()

file_id = metadata.get('dataset_id')

# Load Insights from Metadata
data = metadata.get("eda_results", {})

if data:
    insights = data.get("insights", [])
    plot_data = data.get("plot_data", {})
     
    # 1. Top Insights (Max 3)
    st.subheader("💡 Key Discoveries")
    if insights:
        for insight in insights[:3]:
            st.info(f"**Insight**: {insight}")
    else:
        st.info("No strong linear patterns detected.")
         
    # 2. Correlation Matrix
    if "correlation_matrix" in plot_data:
        st.markdown("### 🔥 Correlation Heatmap")
        st.caption("Darker colors indicate stronger relationships.")
        corr_matrix = pd.DataFrame(plot_data["correlation_matrix"])
         
        corr_melt = corr_matrix.reset_index().melt(id_vars='index')
        corr_melt.columns = ['var1', 'var2', 'correlation']
         
        heatmap = alt.Chart(corr_melt).mark_rect().encode(
             x='var1:O',
             y='var2:O',
             color=alt.Color('correlation:Q', scale=alt.Scale(scheme='redblue', domain=[-1, 1])),
             tooltip=['var1', 'var2', 'correlation']
        ).properties(width=600, height=500)
         
        st.altair_chart(heatmap, width="stretch")
else:
    st.warning("EDA results not found in metadata. Please re-run the pipeline.")

st.markdown("---")
if st.button("Proceed to Statistics ->", type="primary"):
    st.switch_page("pages/6_Statistical_Validation.py")
