import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import shap
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from components.header import header
from components.status_bar import status_bar
from utils.ui_state import require_step, get_metadata

st.set_page_config(page_title="Explainability Results", layout="wide")

header("Explainability Engine", "Step 8: Why did the model make these decisions?")
status_bar(8)

# Access Control
require_step("explainability")

metadata = get_metadata()
if not metadata:
    st.warning("Please upload a dataset first.")
    st.stop()
    
file_id = metadata.get('dataset_id')

# Load Explainability from Metadata
data = metadata.get("explainability_results", {})

if data:
    global_data = data.get("global_explanation", {})
    shap_data = data.get("shap_analysis", {})
     
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🌍 Global Feature Importance")
        st.markdown("These features have the biggest impact on the model's predictions overall.")
        
        importances = global_data.get("importances", [])
        
        if importances:
             df = pd.DataFrame(importances).sort_values("importance", ascending=True)
             st.bar_chart(df.set_index("feature")[['importance']], color="#FF4B4B")
        else:
             st.info("Global importance not available.")

    with col2:
        st.subheader("🔬 SHAP Deep Dive")
        st.markdown("SHAP values explain how much each feature contributed to the prediction.")
        
        if shap_data and shap_data.get("shap_values"):
            shap_values = np.array(shap_data.get("shap_values"))
            feature_names = shap_data.get("feature_names", [])
            
            try:
                fig, ax = plt.subplots()
                shap.summary_plot(shap_values, feature_names=feature_names, plot_type="bar", show=False)
                st.pyplot(fig)
            except Exception as e:
                st.error(f"Could not render plot: {e}")
        else:
             note = shap_data.get("note", "SHAP analysis is only available for predictive tasks (Regression/Classification).")
             st.info(f"💡 {note}")
else:
    st.warning("Explainability results not found in metadata. Please re-run the pipeline.")

st.markdown("---")
if st.button("Proceed to Dashboard ->", type="primary"):
    st.switch_page("pages/9_Dashboard.py")
