"""
Unit tests for cleaning module
"""

import pytest
import pandas as pd
import numpy as np
from src.core import cleaning

def test_clean_data(sample_dataframe):
    """Test data cleaning."""
    # Add some missing values
    df_with_missing = sample_dataframe.copy()
    df_with_missing.loc[0:5, 'feature1'] = np.nan
    
    df_cleaned = cleaning.clean_data(df_with_missing)
    assert df_cleaned is not None
    assert isinstance(df_cleaned, pd.DataFrame)

def test_handle_skewness(sample_dataframe):
    """Test skewness handling."""
    df_fixed = cleaning.handle_skewness(sample_dataframe)
    assert df_fixed is not None
    assert isinstance(df_fixed, pd.DataFrame)
    assert len(df_fixed) == len(sample_dataframe)
