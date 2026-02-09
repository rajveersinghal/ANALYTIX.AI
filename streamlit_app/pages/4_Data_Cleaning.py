import streamlit as st
import sys
import os
import pandas as pd

# Add project root to path
try:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
except:
    pass

from components.header import header
from components.status_bar import status_bar
from utils.ui_state import require_step, get_metadata

st.set_page_config(page_title="Data Cleaning Results", layout="wide")

header("Data Cleaning", "Step 4: Automated Preprocessing Results")
status_bar(4)

# Access Control
require_step("data_cleaning")

metadata = get_metadata()
if not metadata:
    st.warning("Please upload a dataset first.")
    st.stop()

file_id = metadata.get('dataset_id')

st.success("✅ Data Cleaning Pipeline Completed Successfully.")

# Display Artifacts if available
train_path = f"storage/datasets/{file_id}_train.csv"
test_path = f"storage/datasets/{file_id}_test.csv"
clean_path = f"storage/datasets/{file_id}_clean.csv"

# Check what exists (using relative paths for display, but need absolute to read?)
# Actually st.dataframe needs data.
# We can use the API to get sample? Or just read file if we are local.
# We are local.
from app.config import settings
abs_train_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")

if os.path.exists(abs_train_path):
    st.markdown("### 🧼 Cleaned Data Preview (Training Set)")
    df = pd.read_csv(abs_train_path)
    st.dataframe(df.head(), width="stretch")
    st.caption(f"Shape: {df.shape}")
else:
    st.info("Cleaned data file not found locally.")

st.markdown("---")
if st.button("Proceed to EDA ->", type="primary"):
    st.switch_page("pages/5_EDA_Insights.py")
