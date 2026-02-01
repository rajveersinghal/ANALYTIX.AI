"""
Dataset management API endpoints
Upload, list, preview, delete datasets
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os

from backend.database import get_db
from backend.dependencies import get_current_active_user, verify_trial_access
from backend.db.models import User, Dataset
from backend.models.dataset import DatasetResponse, DatasetList, DatasetPreview
from backend.services.data_service import (
    save_uploaded_file,
    process_dataset,
    get_dataset_preview,
    delete_dataset_files
)
from backend.config import settings

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    current_user: User = Depends(verify_trial_access),
    db: Session = Depends(get_db)
):
    """
    Upload a new dataset (CSV or Excel)
    - Validates file type and size
    - Processes and stores dataset
    - Returns dataset metadata
    """
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower().replace('.', '')
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size (approximate)
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
        )
    
    try:
        # Save file
        file_path = save_uploaded_file(file, current_user.id, file.filename)
        
        # Process dataset
        dataset = process_dataset(file_path, db, current_user.id, name)
        
        return dataset
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing dataset: {str(e)}"
        )


@router.get("", response_model=DatasetList)
async def list_datasets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get list of user's datasets"""
    datasets = db.query(Dataset).filter(Dataset.user_id == current_user.id).all()
    
    return {
        "total": len(datasets),
        "datasets": datasets
    }


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get dataset details"""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    return dataset


@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
async def preview_dataset(
    dataset_id: str,
    rows: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get dataset preview (first N rows)"""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    try:
        preview_data = get_dataset_preview(dataset.file_path, rows)
        return {
            "dataset_id": dataset.id,
            **preview_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating preview: {str(e)}"
        )


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete dataset"""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.user_id == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found"
        )
    
    # Delete files
    try:
        delete_dataset_files(dataset)
    except Exception as e:
        # Log error but continue with database deletion
        print(f"Error deleting files: {e}")
    
    # Delete from database
    db.delete(dataset)
    db.commit()
    
    return None
