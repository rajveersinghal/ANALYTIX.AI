"""
Integration tests for the complete ML pipeline
"""

import pytest
import pandas as pd
import numpy as np
from src.core import data_loader, cleaning, features, modeling

def test_complete_pipeline(sample_dataframe):
    """Test the complete ML pipeline from data loading to model training."""
    # 1. Clean data
    df_cleaned = cleaning.clean_data(sample_dataframe)
    assert df_cleaned is not None
    
    # 2. Handle skewness
    df_fixed = cleaning.handle_skewness(df_cleaned)
    assert df_fixed is not None
    
    # 3. Feature selection
    df_selected = features.robust_feature_selection(df_fixed)
    assert df_selected is not None
    
    # 4. Feature engineering
    df_engineered = features.engineer_features(
        df_selected, 
        'target', 
        'Classification',
        optimize_accuracy=False
    )
    assert df_engineered is not None
    
    # 5. Model training
    problem_type = modeling.detect_problem_type(df_engineered, 'target')
    assert problem_type in ['Classification', 'Regression']
    
    # Note: Full model training test would take too long for CI/CD
    # In production, you'd add more comprehensive integration tests
