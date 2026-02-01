from typing import Dict, Any, Callable
import streamlit as st
import random
import numpy as np
import pandas as pd
import hashlib

# Singleton Logger pattern using Session State
class Logger:
    """
    Centralized logging system using Streamlit session state.
    
    All system actions are logged to a persistent Decision Log that
    users can view in the sidebar.
    """
    @staticmethod
    def log(message: str) -> None:
        """Adds a message to the Decision Log."""
        if 'decision_log' not in st.session_state:
            st.session_state.decision_log = []
        st.session_state.decision_log.append(message)
    
    @staticmethod
    def get_logs() -> list:
        """Retrieves all logged messages."""
        if 'decision_log' not in st.session_state:
            return []
        return st.session_state.decision_log

def set_seed(seed: int = 42) -> None:
    """
    Sets random seeds for reproducibility across all libraries.
    
    Args:
        seed: Random seed value (default: 42).
        
    Side Effects:
        - Sets Python random seed
        - Sets NumPy random seed
        - Logs action to Decision Log
    """
    random.seed(seed)
    np.random.seed(seed)
    # If using torch/tensorflow later, add their seed setting here
    Logger.log(f"✔ Random seed set to {seed} for reproducibility.")

def get_dataset_fingerprint(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generates a unique signature/fingerprint for a dataset.
    
    Creates a reproducible hash based on shape and column names,
    useful for tracking dataset versions and detecting changes.
    
    Args:
        df: Input DataFrame to fingerprint.
        
    Returns:
        Dictionary containing:
        - 'Rows': Number of rows
        - 'Columns': Number of columns
        - 'Missing': Percentage of missing values
        - 'Signature': Unique hash identifier (format: DS_{rows}_{cols}_{hash})
        
    Example:
        >>> fp = get_dataset_fingerprint(df)
        >>> print(fp['Signature'])  # "DS_1000_25_a3f2b1"
    """
    rows, cols = df.shape
    missing_pct = f"{df.isnull().sum().sum() / df.size:.1%}"
    
    # Simple hash of column names
    col_hash = hashlib.md5("".join(df.columns).encode()).hexdigest()[:6]
    
    signature = f"DS_{rows}_{cols}_{col_hash}"
    return {
        "Rows": rows,
        "Columns": cols,
        "Missing": missing_pct,
        "Signature": signature
    }

def safe_execution(func: Callable) -> Callable:
    """
    Decorator that wraps functions in error handling to prevent app crashes.
    
    This is the "Safety Layer" - if a decorated function raises an exception,
    it's caught, logged, and displayed to the user without crashing the app.
    
    Args:
        func: Function to wrap with error handling.
        
    Returns:
        Wrapped function that returns None on error instead of crashing.
        
    Side Effects:
        - Logs errors to Decision Log
        - Displays st.error() message to user
        
    Usage:
        @safe_execution
        def risky_function(data):
            return data / 0  # Will be caught gracefully
    """
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            Logger.log(f"❌ Error in {func.__name__}: {str(e)}")
            st.error(f"Something went wrong in **{func.__name__}**. Check logs for details.")
            return None
    return wrapper

def handle_error_gracefully(e: Exception, context: str = "Operation") -> None:
    """
    Global error handler for UI-level exceptions.
    
    Displays a user-friendly error message with an expandable technical detail section.
    
    Args:
        e: The exception that was raised.
        context: Description of what operation failed (e.g., "Model Training").
        
    Side Effects:
        - Logs error to Decision Log
        - Displays st.error() with expandable technical details
        
    Usage:
        try:
            risky_operation()
        except Exception as e:
            handle_error_gracefully(e, "Data Processing")
    """
    Logger.log(f"🛑 Critical {context} Error: {str(e)}")
    st.error(f"Critical Failure during {context}. The system has logged the details.")
    with st.expander("Technical Error Detail"):
        st.code(str(e))
