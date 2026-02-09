import streamlit as st
import sys
import os
import time
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from components.header import header
from components.status_bar import status_bar
from utils.ui_state import require_step, get_metadata

st.set_page_config(page_title="Final Report", layout="centered")

header("Final Report", "Step 11: Export your Analysis")
status_bar(11)

# Access Control
require_step("report")

metadata = get_metadata()
if not metadata:
    st.warning("Please upload a dataset first.")
    st.stop()
    
file_id = metadata.get('dataset_id')

st.success("✅ **Analysis Complete!** Your report successfully generated.")

# Get Report Path
# Metadata artifact is relative "storage/datasets/..."
report_rel_path = metadata.get("artifacts", {}).get("report")

# Resolve absolute path for reading
from app.config import settings
# report_rel_path might be absolute or relative depending on service implementation.
# ReportService uses os.path.join(settings.DATASET_DIR, filename).
# Metadata update uses that path.
# Let's try to read it.

report_path = None
if report_rel_path and os.path.exists(report_rel_path):
    report_path = report_rel_path
else:
    # Fallback check standard location
    path = os.path.join(settings.DATASET_DIR, f"{file_id}_report.pdf")
    if os.path.exists(path):
        report_path = path

if report_path:
    with open(report_path, "rb") as f:
        pdf_data = f.read()
        
    st.download_button(
        label="📥 Download Final PDF Report",
        data=pdf_data,
        file_name=f"AnalytixAI_Report_{file_id}.pdf",
        mime="application/pdf",
        type="primary"
    )
    
    st.balloons()
    
    st.markdown("---")
    st.markdown("### 🚀 Next Steps: Production Inference")
    st.write("Ready to use your model in production? Try the Batch Inference engine to score new data.")
    if st.button("Go to Batch Inference Engine ->"):
        st.switch_page("pages/12_Batch_Inference.py")
else:
    st.error("Report file not found on disk. Please contact support or re-run pipeline.")
