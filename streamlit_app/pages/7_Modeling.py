import streamlit as st
import pandas as pd
import sys
import os
import json
from app.config import settings

# Add project path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from streamlit_app.components.header import header
from streamlit_app.components.status_bar import status_bar
from utils.ui_state import require_step, get_metadata

st.set_page_config(page_title="AutoML Results", layout="wide")

header("AutoML Engine", "Step 7: Model Performance Results")
status_bar(7)

# Access Control
require_step("modeling")

metadata = get_metadata()
if not metadata:
    st.warning("Please upload a dataset first.")
    st.stop()

file_id = metadata.get('dataset_id')

# Mode Selection (Global) - just display info
mode_value = st.session_state.get('execution_mode', metadata.get('execution_mode', 'fast'))
st.info(f"Training Strategy: **{mode_value.title()} Mode** (Selected in Step 2)")

# Load Model Info from Metadata
data = metadata.get("modeling_results", {})

if data:
    st.session_state['modeling_results'] = data
else:
    st.warning("Model training results not found in metadata. Please re-run the pipeline.")
    st.stop()
    
# Results Display
if 'modeling_results' in st.session_state:
     data = st.session_state['modeling_results']
     leaderboard = data.get("leaderboard", [])
     best_model = data.get("best_model")
     best_score = data.get("best_score")
     metric = data.get("metric")
     
     st.markdown("---")
     st.subheader("Results")
     
     # Winner Section
     st.success(f"🏆 Champion Model: **{best_model}**")
     
     col1, col2 = st.columns(2)
     col1.metric(f"Best {metric.upper() if metric else 'Score'}", f"{best_score:.4f}")
     col2.metric("Models Trained", len(leaderboard))
     
     # Leaderboard
     st.markdown("### 🏁 Competition Results")
     if leaderboard:
         df_lb = pd.DataFrame(leaderboard).sort_values(by="score", ascending=False)
         st.dataframe(
             df_lb.style.highlight_max(axis=0, color='lightgreen'), 
              width="stretch"
         )
     
     st.info("The champion model has been saved and is ready for explaining.")
     
     if st.button("Proceed to Explainability ->", type="primary"):
         st.switch_page("pages/8_Explainability.py")
