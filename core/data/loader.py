from typing import Optional
import pandas as pd
import streamlit as st
from modules.utils import Logger

def load_data(uploaded_file) -> Optional[pd.DataFrame]:
    """
    Loads data from a CSV or Excel file uploaded via Streamlit.
    
    Args:
        uploaded_file: Streamlit UploadedFile object containing CSV or Excel data.
        
    Returns:
        pd.DataFrame if successful, None if file is invalid or error occurs.
        
    Raises:
        Displays st.error() on failure but does not raise exceptions.
    """
    if uploaded_file is None:
        return None
    
    try:
        filename = uploaded_file.name
        if filename.endswith('.csv'):
            df = pd.read_csv(uploaded_file)
        elif filename.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(uploaded_file)
        else:
            st.error("Unsupported file format. Please upload CSV or Excel.")
            return None
            
        return df
    except Exception as e:
        st.error(f"Error loading file: {e}")
        return None

def clean_and_convert_types(df: pd.DataFrame) -> pd.DataFrame:
    """
    Universal Data Type Handler: Converts strings to appropriate types.
    
    Performs intelligent type conversion:
    - Converts numeric strings (e.g., "1,200") to numeric types
    - Converts date strings to datetime objects
    - Identifies and flags ID-like columns
    
    Args:
        df: Input DataFrame with potentially mixed/string types.
        
    Returns:
        pd.DataFrame with optimized data types.
        
    Side Effects:
        Logs conversion actions to the Decision Log.
    """
    df_clean = df.copy()
    converted_cols = []
    
    for col in df_clean.columns:
        # 1. Try numeric conversion
        if df_clean[col].dtype == 'object':
            try:
                # Remove common currency/formatting chars
                cleaned_series = df_clean[col].astype(str).str.replace(',', '')
                df_clean[col] = pd.to_numeric(cleaned_series)
                converted_cols.append(f"{col} (→ Numeric)")
                continue
            except (ValueError, TypeError):
                pass
                
        # 2. Try datetime conversion
        if df_clean[col].dtype == 'object':
             try:
                 df_clean[col] = pd.to_datetime(df_clean[col])
                 converted_cols.append(f"{col} (→ Datetime)")
                 continue
             except (ValueError, TypeError):
                 pass
                 
    if converted_cols:
        Logger.log(f"✔ Universal Type Handler converted: {', '.join(converted_cols)}")
        
    return df_clean

def get_id_columns(df: pd.DataFrame) -> list:
    """
    Identifies potential ID columns that should be excluded from modeling.
    
    Uses heuristic: columns with >95% unique values are likely IDs.
    
    Args:
        df: Input DataFrame to analyze.
        
    Returns:
        List of column names identified as potential ID columns.
        
    Side Effects:
        Logs identified ID columns to the Decision Log.
    """
    id_cols = []
    for col in df.columns:
        if df[col].nunique() > 0.95 * len(df):
            id_cols.append(col)
            
    if id_cols:
        Logger.log(f"ℹ️ Potential ID columns identified (will be excluded): {', '.join(id_cols)}")
        
    return id_cols

def display_basic_info(df: pd.DataFrame) -> None:
    """
    Displays basic validation information about the DataFrame in Streamlit UI.
    
    Shows:
    - Dataset shape (rows × columns)
    - Column data types
    - Missing value counts
    
    Args:
        df: DataFrame to display information about.
        
    Returns:
        None (displays information via Streamlit UI).
    """
    st.write(f"**Shape:** {df.shape[0]} rows, {df.shape[1]} columns")
    
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Column Data Types")
        st.dataframe(df.dtypes.astype(str))
    with col2:
        st.subheader("Missing Values")
        missing_count = df.isnull().sum()
        st.dataframe(missing_count[missing_count > 0])
