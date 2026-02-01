"""
Data processing service
Business logic for dataset operations, quality checks, cleaning, EDA, and feature engineering
"""

import pandas as pd
import os
import shutil
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session

from backend.config import settings
from backend.db.models import Dataset, User
from core.modules import data_loader, data_quality, cleaning, eda, features, data_validator
from core.modules.utils import get_dataset_fingerprint


def save_uploaded_file(file, user_id: str, filename: str) -> str:
    """
    Save uploaded file to user's directory
    Returns: file_path
    """
    # Create user directory
    user_dir = os.path.join(settings.UPLOAD_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_ext = os.path.splitext(filename)[1]
    unique_filename = f"{timestamp}_{filename}"
    file_path = os.path.join(user_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return file_path


def process_dataset(file_path: str, db: Session, user_id: str, dataset_name: str) -> Dataset:
    """
    Load and process uploaded dataset
    Returns: Dataset model instance
    """
    # Load data
    df = data_loader.load_data(file_path)
    if df is None:
        raise ValueError("Failed to load dataset")
    
    # Clean and convert types
    df = data_loader.clean_and_convert_types(df)
    
    # Validate suitability
    data_validator.check_dataset_suitability(df)
    
    # Get fingerprint
    fingerprint = get_dataset_fingerprint(df)
    
    # Calculate quality score
    quality_score, _ = data_quality.calculate_readiness_score(df)
    
    # Get file size
    file_size = os.path.getsize(file_path)
    
    # Create dataset record
    dataset = Dataset(
        user_id=user_id,
        name=dataset_name,
        filename=os.path.basename(file_path),
        file_path=file_path,
        file_size=file_size,
        rows=fingerprint['Rows'],
        columns=fingerprint['Columns'],
        column_names=df.columns.tolist(),
        column_types={col: str(dtype) for col, dtype in df.dtypes.items()},
        missing_values=fingerprint['Missing'],
        fingerprint=fingerprint['Signature'],
        quality_score=quality_score,
        is_processed=True,
        is_cleaned=False
    )
    
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    
    return dataset


def get_dataset_preview(file_path: str, rows: int = 100) -> Dict[str, Any]:
    """
    Get preview of dataset
    Returns: Dictionary with preview data
    """
    df = pd.read_csv(file_path, nrows=rows)
    
    return {
        "rows": len(df),
        "columns": len(df.columns),
        "data": df.to_dict(orient='records'),
        "column_info": {col: str(dtype) for col, dtype in df.dtypes.items()}
    }


def run_quality_check(dataset: Dataset) -> Tuple[float, str]:
    """
    Run quality assessment on dataset
    Returns: (score, explanation)
    """
    df = pd.read_csv(dataset.file_path)
    score, explanation = data_quality.calculate_readiness_score(df)
    
    # Update dataset quality score
    return score, explanation


def clean_dataset(dataset: Dataset, db: Session) -> Dataset:
    """
    Apply data cleaning to dataset
    Returns: Updated dataset
    """
    # Load data
    df = pd.read_csv(dataset.file_path)
    
    # Apply cleaning
    df_clean = cleaning.clean_data(df)
    df_clean = cleaning.handle_skewness(df_clean)
    
    # Save cleaned version
    cleaned_path = dataset.file_path.replace('.csv', '_cleaned.csv')
    df_clean.to_csv(cleaned_path, index=False)
    
    # Update dataset record
    dataset.file_path = cleaned_path
    dataset.is_cleaned = True
    db.commit()
    db.refresh(dataset)
    
    return dataset


def generate_eda_visualizations(dataset: Dataset) -> Dict[str, Any]:
    """
    Generate EDA visualizations
    Returns: Dictionary with visualization data/paths
    """
    df = pd.read_csv(dataset.file_path)
    
    # Generate visualizations (in production, save to files and return paths)
    # For now, return summary statistics
    return {
        "summary_stats": df.describe().to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "shape": {"rows": len(df), "columns": len(df.columns)}
    }


def apply_feature_engineering(
    dataset: Dataset,
    target_column: str,
    optimize_accuracy: bool,
    db: Session
) -> Dataset:
    """
    Apply feature engineering to dataset
    Returns: Updated dataset with engineered features
    """
    # Load data
    df = pd.read_csv(dataset.file_path)
    
    # Detect problem type
    from core.modules.modeling import detect_problem_type
    problem_type = detect_problem_type(df, target_column)
    
    # Apply feature engineering
    df_final = features.robust_feature_selection(df)
    df_final = features.engineer_features(
        df_final,
        target_column,
        problem_type,
        optimize_accuracy=optimize_accuracy
    )
    
    # Save engineered version
    engineered_path = dataset.file_path.replace('.csv', '_engineered.csv')
    df_final.to_csv(engineered_path, index=False)
    
    # Update dataset record
    dataset.file_path = engineered_path
    db.commit()
    db.refresh(dataset)
    
    return dataset


def delete_dataset_files(dataset: Dataset):
    """Delete dataset files from disk"""
    if os.path.exists(dataset.file_path):
        os.remove(dataset.file_path)
    
    # Also delete cleaned and engineered versions if they exist
    cleaned_path = dataset.file_path.replace('.csv', '_cleaned.csv')
    engineered_path = dataset.file_path.replace('.csv', '_engineered.csv')
    
    if os.path.exists(cleaned_path):
        os.remove(cleaned_path)
    if os.path.exists(engineered_path):
        os.remove(engineered_path)
