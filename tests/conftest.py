"""
Pytest Configuration and Fixtures

This module contains shared fixtures and configuration for all tests.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path

@pytest.fixture
def sample_dataframe():
    """Create a sample DataFrame for testing."""
    np.random.seed(42)
    return pd.DataFrame({
        'feature1': np.random.randn(100),
        'feature2': np.random.randn(100),
        'feature3': np.random.choice(['A', 'B', 'C'], 100),
        'target': np.random.randint(0, 2, 100)
    })

@pytest.fixture
def sample_regression_dataframe():
    """Create a sample DataFrame for regression testing."""
    np.random.seed(42)
    return pd.DataFrame({
        'feature1': np.random.randn(100),
        'feature2': np.random.randn(100),
        'feature3': np.random.randn(100),
        'target': np.random.randn(100) * 10 + 50
    })

@pytest.fixture
def temp_data_dir(tmp_path):
    """Create a temporary data directory."""
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    return data_dir

@pytest.fixture
def sample_csv_file(tmp_path, sample_dataframe):
    """Create a temporary CSV file."""
    csv_path = tmp_path / "sample.csv"
    sample_dataframe.to_csv(csv_path, index=False)
    return csv_path
