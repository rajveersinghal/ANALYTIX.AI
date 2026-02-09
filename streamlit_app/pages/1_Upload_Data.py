import streamlit as st
import pandas as pd
import sys
import os
import requests

# Ensure we can import components
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from streamlit_app.components.header import header
from streamlit_app.components.status_bar import status_bar
from streamlit_app.components.api_client import post, BASE_URL
from streamlit_app.utils.ui_state import reset_state

st.set_page_config(page_title="Upload Dataset", layout="wide")

header("Upload Data", "Step 1: Ingest your raw dataset")
status_bar(1)


st.info("Supported formats: CSV, Excel (XLSX). Max size: 200MB.")

# --- NEW: Sample Dataset Gallery ---
st.markdown("### 🏆 Sample Dataset Gallery")
st.caption("Don't have a dataset? Choose a pre-verified sample for an instant demo.")

# Helper to fetch samples
@st.cache_data(ttl=600)
def get_samples():
    try:
        res = requests.get(f"{BASE_URL}/inference/samples")
        if res.status_code == 200:
            return res.json().get("data", [])
    except:
        pass
    return []

samples_data = get_samples()
sample_options = {"None": None}
for s in samples_data:
    label = f"{s['name']}"
    sample_options[label] = s['id']

col_gallery_1, col_gallery_2 = st.columns([2, 1])

with col_gallery_1:
    selected_sample = st.selectbox("Select a Sample", options=list(sample_options.keys()))

with col_gallery_2:
    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🚀 Load Sample", width="stretch", disabled=selected_sample=="None"):
        sample_id = sample_options[selected_sample]
        try:
            with st.spinner("Initializing sample..."):
                res = requests.post(f"{BASE_URL}/inference/sample/select/{sample_id}")
                if res.status_code == 200:
                    data = res.json().get("data", {})
                    st.session_state['metadata'] = data
                    st.session_state['file_id'] = data.get('file_id', data.get('dataset_id'))
                    st.session_state['upload_complete'] = True
                    st.success(f"Loaded {selected_sample} successfully!")
                    st.balloons()
                    st.rerun() # Refresh to show status
                else:
                    st.error(f"Failed to load sample: {res.text}")
        except Exception as e:
            st.error(f"Connection error: {e}")

st.markdown("---")

# --- Standard Upload ---
st.markdown("### 📤 Custom Upload")
uploaded_file = st.file_uploader("Drop your file here", type=["csv", "xlsx"], on_change=reset_state)

if uploaded_file is not None:
    # Preview
    try:
        if uploaded_file.name.endswith('.csv'):
            df_preview = pd.read_csv(uploaded_file)
        else:
            df_preview = pd.read_excel(uploaded_file)
            
        st.write("### 📄 Dataset Preview")
        st.dataframe(df_preview.head(), width="stretch")
        st.caption(f"Showing first 5 rows of {len(df_preview)} rows.")
        
        # Process Button
        if st.button("🚀 Process & Analyze Dataset", type="primary"):
            with st.spinner("Uploading and profiling your data..."):
                # Reset pointer
                uploaded_file.seek(0)
                files = {"file": (uploaded_file.name, uploaded_file.getvalue(), uploaded_file.type)}
                response = post("/upload/dataset", files=files)
                
                if response and response.status_code == 200:
                    # In DatasetService.upload_dataset, it now returns the result of run_understanding
                    # which is wrapped in success_response(data=full_data)
                    metadata = response.json().get("data", {})
                    st.session_state['metadata'] = metadata
                    st.session_state['file_id'] = metadata.get('file_id')
                    st.session_state['upload_complete'] = True
                    st.balloons()
                else:
                    st.error("Upload failed. Please try again.")
                    if response:
                        st.error(f"Details: {response.text}")

    except Exception as e:
        reset_state() # Reset on error too
        st.error(f"Error reading file: {e}")

# Success State & Navigation
if st.session_state.get('upload_complete'):
     st.markdown("---")
     st.success("Configuration Ready!")
     if st.button("Proceed to Task Selection ->", type="primary", width="stretch"):
         st.switch_page("pages/2_Task_Selection.py")
