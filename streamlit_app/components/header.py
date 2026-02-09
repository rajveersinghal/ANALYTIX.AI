import streamlit as st

def header(title, subtitle=None):
    """
    Renders a consistent header across the app.
    """
    st.markdown(f"# {title}")
    if subtitle:
        st.markdown(f"### {subtitle}")
    st.markdown("---")
