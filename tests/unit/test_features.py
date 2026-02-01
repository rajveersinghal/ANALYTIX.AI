"""
Unit tests for features module
"""

import pytest
import pandas as pd
from src.core import features

def test_robust_feature_selection(sample_dataframe):
    """Test feature selection."""
    df_selected = features.robust_feature_selection(sample_dataframe)
    assert df_selected is not None
    assert isinstance(df_selected, pd.DataFrame)

def test_engineer_features(sample_dataframe):
    """Test feature engineering."""
    df_engineered = features.engineer_features(
        sample_dataframe, 
        'target', 
        'Classification',
        optimize_accuracy=False
    )
    assert df_engineered is not None
    assert isinstance(df_engineered, pd.DataFrame)
