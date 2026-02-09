import streamlit as st
import requests
import sys
import os

# Robust BASE_URL import
try:
    from streamlit_app.components.api_client import BASE_URL
except ImportError:
    # Add project root to path if needed for sub-process runs
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
    try:
        from streamlit_app.components.api_client import BASE_URL
    except ImportError:
        BASE_URL = "http://localhost:8001" # Default to 8001 as seen in terminal

def get_metadata(force_refresh=False):
    """Retrieve metadata from session state, or fetch from API if missing or force_refresh is True."""
    metadata = st.session_state.get('metadata', {})
    
    # If metadata is empty or missing core metrics like 'rows', try to refresh
    is_incomplete = not metadata or 'rows' not in metadata
    
    if force_refresh or is_incomplete:
        file_id = st.session_state.get('file_id') or metadata.get('dataset_id')
        if file_id:
            try:
                # Use /pipeline/status as it's guaranteed to return full state
                res = requests.get(f"{BASE_URL}/pipeline/status/{file_id}")
                if res.status_code == 200:
                    metadata = res.json().get("data", {})
                    st.session_state['metadata'] = metadata
                    return metadata
            except:
                pass
            
    return metadata

def get_pipeline_state():
    """Retrieve pipeline state dictionary."""
    return get_metadata().get('pipeline_state', {})

def is_step_completed(step_name):
    """Check if a specific pipeline step is marked as completed."""
    state = get_pipeline_state()
    return state.get(step_name) == 'completed'

def can_access(step_name):
    """
    Check if a user can access a result page.
    Allow access if the step is completed OR if the entire pipeline is finished.
    """
    state = get_pipeline_state()
    is_done = state.get('report') == 'completed'
    return is_step_completed(step_name) or is_done

def require_step(step_name):
    """
    Enforce access control at the top of a page.
    """
    if not can_access(step_name):
        st.warning(f"⚠️ Access Restricted. The '{step_name}' phase is not yet complete.")
        st.info("Please go to the 'Task Selection' page to run the pipeline.")
        st.stop()
        
def reset_state():
    """Reset all session state variables related to the pipeline."""
    keys_to_reset = ['metadata', 'file_id', 'upload_complete']
    for key in keys_to_reset:
        if key in st.session_state:
            del st.session_state[key]
