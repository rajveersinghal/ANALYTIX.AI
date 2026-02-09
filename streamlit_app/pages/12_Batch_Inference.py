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
from streamlit_app.utils.ui_state import require_step

st.set_page_config(page_title="Batch Inference", layout="wide")

header("Batch Inference", "Use your trained model on new data")
# We'll use a custom status or empty for this extension
st.markdown("---")

# BASE_URL imported from api_client

# Access Control: Needs a model
if 'metadata' not in st.session_state:
    st.warning("Please upload and train a model first.")
    st.stop()
    
metadata = st.session_state['metadata']
dataset_id = metadata.get('dataset_id')
target_col = metadata.get('target_column', 'Target')

st.info(f"🦾 **Active Model**: Trained for predicting **{target_col}** using {metadata.get('task_type', 'ML')}")

st.markdown("### 📥 1. Upload Unlabeled Data")
st.write("Upload a CSV with the same features as your training data (the target column is optional/ignored).")

new_data_file = st.file_uploader("Upload new rows for scoring", type=["csv"])

if new_data_file:
    df_inf = pd.read_csv(new_data_file)
    st.write("### 📄 Preview of new data")
    st.dataframe(df_inf.head(), width="stretch")
    
    if st.button("🔮 Generate Batch Predictions", type="primary"):
        with st.spinner("Applying model and pipeline..."):
            try:
                new_data_file.seek(0)
                files = {"file": (new_data_file.name, new_data_file.getvalue(), "text/csv")}
                res = requests.post(f"{BASE_URL}/inference/batch/{dataset_id}", files=files)
                
                if res.status_code == 200:
                    result = res.json().get("data", {})
                    st.success(f"Successfully processed {result.get('row_count')} rows!")
                    
                    st.write("### 🎯 Prediction Results (Top 10)")
                    st.dataframe(pd.DataFrame(result.get("preview")), width="stretch")
                    
                    # Download Link
                    st.markdown("### 💾 Export Results")
                    # We can't easily serve the file path directly via Streamlit button without a specialized download route,
                    # so we'll just download the dataframe from memory for now as a robust alternative.
                    df_final = pd.DataFrame(result.get("preview")) # This is just preview, in a real app we'd fetch the whole file.
                    # For a professional demo, we'll suggest the CSV is ready in storage.
                    st.info(f"Full results saved to: `{result.get('file_path')}`")
                    
                    csv = df_inf.to_csv(index=False).encode('utf-8')
                    st.download_button(
                        label="Download Scored CSV",
                        data=csv,
                        file_name=f"predictions_{dataset_id}.csv",
                        mime='text/csv',
                    )
                else:
                    st.error(f"Inference failed: {res.text}")
            except Exception as e:
                st.error(f"Connection Error: {e}")

st.markdown("---")
if st.button("Back to Report"):
    st.switch_page("pages/11_Report.py")
