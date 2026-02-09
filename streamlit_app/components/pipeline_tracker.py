import streamlit as st
import time
import requests
import sys
import os

# Ensure we can import app config
try:
    from app.config import settings
except ImportError:
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from streamlit_app.components.api_client import BASE_URL

def pipeline_tracker(file_id: str, api_url: str = BASE_URL, show_logs: bool = True):
    """
    Displays a live progress tracker for the pipeline.
    """
    status_placeholder = st.empty()
    sidebar_placeholder = st.sidebar.empty() # Create placeholder for sidebar
    
    # Retry configuration
    # ...
    max_retries = 10
    retry_count = 0
    
    print(f"DEBUG: Tracker Started for {file_id}")
    
    while True:
        try:
            url = f"{api_url}/pipeline/status/{file_id}"
            # print(f"DEBUG: Polling {url}") # Reduced noise
            response = requests.get(url)
            
            # Handle 404 (Not Found) - Wait for initialization
            if response.status_code == 404:
                if retry_count < max_retries:
                    time.sleep(1)
                    retry_count += 1
                    print(f"DEBUG: Status 404. Retry {retry_count}/{max_retries}")
                    with status_placeholder.container():
                        st.info("Initializing pipeline...")
                    continue
                else:
                    print("DEBUG: Max retries reached with 404.")
                    st.error("Pipeline failed to start (Timeout waiting for initialization).")
                    return "error"
            
            if response.status_code == 200:
                metadata = response.json().get("data", {})
                pipeline_state = metadata.get("pipeline_state", {})
                errors = metadata.get("errors", {})
                
                # Sync metadata to session state so page UI (buttons, etc.) can see updates
                st.session_state['metadata'] = metadata
                
                # Use Fixed Total Steps (8) for accurate progress
                # data_understanding, data_cleaning, eda, statistics, modeling, explainability, decision, report
                FIXED_TOTAL_STEPS = 8
                
                # Calculate completed steps
                completed_count = sum(1 for s in pipeline_state.values() if s == "completed")
                
                # Determine current active step
                active_step = None
                active_status = "pending"
                
                # Find the first non-completed step
                for step, status in pipeline_state.items():
                    if status != "completed":
                        active_step = step
                        active_status = status
                        break
                
                # Define the strictly ordered steps for consistency
                PIPELINE_ORDER = [
                    "data_understanding", "data_cleaning", "eda", "statistics", 
                    "modeling", "explainability", "decision", "report"
                ]
                
                # Main Progress Tracker
                with status_placeholder.container():
                    st.progress(completed_count / FIXED_TOTAL_STEPS if FIXED_TOTAL_STEPS > 0 else 0)
                    
                    # 1. Step-by-Step Checklist (Restored per user request)
                    for i, step_key in enumerate(PIPELINE_ORDER):
                        status = pipeline_state.get(step_key, "pending")
                        
                        icon = "⏳"
                        if status == "running": icon = "🔄"
                        elif status == "completed": icon = "✅"
                        elif status == "failed": icon = "❌"
                        
                        formatted_name = step_key.replace("_", " ").title()
                        
                        col1, col2 = st.columns([1, 10])
                        with col1:
                            st.write(icon)
                        with col2:
                            # Highlight current step
                            if status == "running":
                                st.markdown(f"**{formatted_name} (Active)**")
                            else:
                                st.write(formatted_name)
                            
                        if status == "failed":
                            err_msg = errors.get(step_key, "An unexpected error occurred.")
                            st.error(f"❌ **Failed at {formatted_name}**")
                            st.error(f"**Issue**: {err_msg}")
                            if st.button("🔄 Reload Page to Retry"):
                                st.rerun()
                            return "failed"

                # 2. Sidebar Logs (Comprehensive View)
                if show_logs:
                    with sidebar_placeholder.container():
                        st.sidebar.markdown("### 📜 Process Monitor")
                        
                        # Define the strictly ordered steps for consistency
                        # (Copied here for focus, though already in scope)
                        PIPELINE_ORDER = [
                            "data_understanding", "data_cleaning", "eda", "statistics", 
                            "modeling", "explainability", "decision", "report"
                        ]
                        
                        logs = metadata.get("logs", {})
                        
                        for step_key in PIPELINE_ORDER:
                            status = pipeline_state.get(step_key, "pending")
                            
                            # Determine Icon
                            icon = "⏳"
                            if status == "running": icon = "🔄"
                            elif status == "completed": icon = "✅"
                            elif status == "failed": icon = "❌"
                            
                            formatted_name = step_key.replace("_", " ").title()
                            
                            # Display Header for the Step in Sidebar
                            st.sidebar.markdown(f"{icon} **{formatted_name}**")
                            
                            # Show logs for active or failed steps
                            if status in ["running", "failed"] and step_key in logs:
                                step_logs = logs[step_key]
                                if step_logs:
                                    # Show the last 2 log messages for brevity
                                    for msg in step_logs[-2:]:
                                        st.sidebar.caption(f"  └ {msg}")
                        
                        st.sidebar.divider()
                        
                        # Expandable for full history
                        with st.sidebar.expander("🔍 View Full Log History"):
                            if logs:
                                for step, step_msgs in logs.items():
                                    st.markdown(f"**{step.replace('_', ' ').title()}**")
                                    for m in step_msgs:
                                        st.caption(f"- {m}")
                            else:
                                st.write("No logs recorded yet.")

                # Determine if Finished
                if pipeline_state.get("report") == "completed":
                    st.success("🎉 Full Analysis Completed Successfully!")
                    return "completed"
                
                time.sleep(1)
            else:
                print(f"DEBUG: Unexpected Status Code: {response.status_code}")
                st.error(f"Failed to fetch status: {response.status_code}")
                return "error"
        except Exception as e:
            print(f"DEBUG: Tracker Exception: {e}")
            st.error(f"Connection Error: {e}")
            return "error"
