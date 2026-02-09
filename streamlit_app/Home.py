import streamlit as st

st.set_page_config(page_title="AnalytixAI", layout="wide")

st.title("AnalytixAI 🧠")
st.subheader("Autonomous Data Intelligence Platform")

st.markdown("""
### From Raw Data to Boardroom Report in Minutes.

AnalytixAI is your AI-powered data science companion. Upload any dataset and let the system handle the rest:

*   **🔍 Auto-Profiling**: Instantly understand your data's structure and quality.
*   **🧹 Smart Cleaning**: Automatically handle missing values, outliers, and type errors.
*   **📊 Deep Insights**: Discover hidden patterns with automated EDA and statistical testing.
*   **🤖 AutoML**: Train and tune machine learning models without writing code.
*   **💡 Decision Intelligence**: Get actionable recommendations and risk analysis.
*   **📊 Automated Reporting**: Generate a professional PDF report with one click.
""")

st.markdown("---")

col1, col2, col3 = st.columns([1, 2, 1])

with col2:
    if st.button("🚀 Start New Analysis", type="primary", width="stretch"):
        st.switch_page("pages/1_Upload_Data.py")

st.markdown("---")
st.caption("v1.0.0 | Production Ready")
