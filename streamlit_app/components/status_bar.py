import streamlit as st

def status_bar(step):
    """
    Renders a progress bar indicating the current step in the 11-step flow.
    """
    # Steps are 1 to 11.
    if step < 1: step = 1
    if step > 11: step = 11
    
    progress = step / 11
    st.progress(progress)
    st.caption(f"Phase {step} of 11")
