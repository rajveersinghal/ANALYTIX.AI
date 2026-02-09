import streamlit as st
import time
from components.header import header
from components.status_bar import status_bar
from components.pipeline_tracker import pipeline_tracker
from components.api_client import post
from utils.ui_state import require_step, can_access

st.set_page_config(page_title="Pipeline Runner", layout="wide")

header("Pipeline Runner", "Step 2: Configure & Execute Analysis")
status_bar(2)

if 'metadata' not in st.session_state:
    st.warning("Please upload a dataset first.")
    st.stop()
    
metadata = st.session_state['metadata']
file_id = st.session_state.get('file_id', metadata.get('dataset_id') or metadata.get('file_id'))

if not file_id:
    st.error("Dataset ID not found. Please re-upload your data.")
    st.stop()

# --- Configuration Section ---
st.markdown("### 🏛️ Domain & Goal Configuration")

# 1. Domain selection
domain_options = {
    "💼 Business & Sales": "business",
    "📈 Finance": "finance",
    "🏠 Real Estate": "real_estate",
    "👥 Customer Analytics": "customer",
    "⚙️ Marketing & Operations": "operations",
    "🌐 General / Generic": "general"
}
selected_domain_label = st.selectbox("Select your Data Domain", list(domain_options.keys()), index=5)
domain = domain_options[selected_domain_label]

st.markdown("---")

col1, col2, col3 = st.columns(3)

with col1:
    # 2. Dynamic Task Mapping based on Domain
    suggested_problem = metadata.get("problem_type", "regression")
    
    task_mapping = {
        "Predict a value (Regression)": "regression",
        "Predict a category (Classification)": "classification",
    }
    
    # Domain-specific additions
    if domain in ["business", "finance", "operations"]:
        task_mapping["Forecasting (Time Series)"] = "forecasting"
    if domain in ["customer", "real_estate"]:
        task_mapping["Market Segmentation (Clustering)"] = "clustering"
    if domain == "finance":
        task_mapping["Risk & Anomaly Detection"] = "anomaly_detection"
    if domain == "business":
        task_mapping["Resource Optimization"] = "optimization"

    selected_option = st.selectbox(
        "Analysis Goal",
        list(task_mapping.keys()),
        index=0 if suggested_problem not in task_mapping.values() else list(task_mapping.values()).index(suggested_problem)
    )
    task_type = task_mapping[selected_option]

with col2:
    targets = metadata.get("possible_target_columns", [])
    possible_target = targets[0] if targets else ""
    target_col = st.selectbox(
        "Target Column",
        options=metadata.get("column_names", []),
        index=metadata.get("column_names", []).index(possible_target) if possible_target in metadata.get("column_names", []) else 0
    )

with col3:
    mode_selection = st.radio(
        "Execution Mode",
        ("Fast Mode (Recommended)", "Deep Mode (Detailed)"),
        help="Fast Mode uses optimized algorithms. Deep Mode runs extensive cross-validation."
    )
    mode = "fast" if "Fast" in mode_selection else "deep"

st.markdown("---")

# --- Execution Section ---

# Check if pipeline is already running or done
pipeline_state = metadata.get('pipeline_state', {})
is_running = any(status == "running" for status in pipeline_state.values())
is_complete = pipeline_state.get('report') == 'completed'

if not is_running and not is_complete:
    if st.button("🚀 Start Analysis Pipeline", type="primary", width="stretch"):
        with st.spinner("Initializing Pipeline..."):
            # Prepare Payload
            payload = {
                "mode": mode,
                "task_type": task_type,
                "target_column": target_col,
                "domain": domain
            }
            
            # Send Request
            response = post(f"/pipeline/run/{file_id}", json=payload)
            
            if response.status_code == 200:
                st.success("Pipeline started!")
                st.rerun()
            else:
                st.error(f"Failed to start: {response.text}")

st.markdown("### 📊 Pipeline Progress")

# Tracker Component
status = pipeline_tracker(file_id, show_logs=True)

if status == "completed" and not is_complete:
    st.rerun() 

if status == "failed":
    st.warning(" Pipeline execution stopped due to an error.")
    if st.button("🔄 Retry Analysis", type="primary"):
        with st.spinner("Retrying Pipeline..."):
            # Prepare Payload
            payload = {
                "mode": mode,
                "task_type": task_type,
                "target_column": target_col,
                "domain": domain
            }
            response = post(f"/pipeline/run/{file_id}", json=payload)
            
            if response.status_code == 200:
                st.success("Pipeline restarted!")
                st.rerun()
            else:
                st.error(f"Failed to restart: {response.text}")

st.markdown("---")

# Navigation to Results (Only if complete)
if can_access("data_understanding"):
     with st.expander("✅ Data Understanding Results", expanded=False):
         st.write("Analysis complete. Go to page to view.")
         if st.button("View Understanding", key="btn_und"): st.switch_page("pages/3_Data_Understanding.py")

if can_access("data_cleaning"):
     with st.expander("✅ Clean Data Results", expanded=False):
         st.write("Cleaning complete.")
         if st.button("View Cleaning", key="btn_clean"): st.switch_page("pages/4_Data_Cleaning.py")
         
if can_access("modeling"):
      with st.expander("✅ Modeling Results", expanded=True): 
          st.write("Models trained.")
          if st.button("View Models", key="btn_model"): st.switch_page("pages/7_Modeling.py")

if is_complete:
    st.success("🎉 Analysis Complete!")
    if st.button("Download Report ->", type="primary"):
        st.switch_page("pages/11_Report.py")
