# app/api/routes/dataset.py
import os
import json
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.dataset_service import DatasetService
from app.config import settings

router = APIRouter(prefix="/dataset", tags=["Dataset"])
dataset_service = DatasetService()

def get_metadata_from_file(id: str):
    metadata_path = os.path.join(settings.METADATA_DIR, f"{id}.json")
    if not os.path.exists(metadata_path):
        raise HTTPException(status_code=404, detail="Dataset metadata not found")
    
    try:
        with open(metadata_path, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading metadata: {str(e)}")

@router.get("/profile/{id}")
def get_dataset_profile(id: str):
    """Returns the full profile (metadata) of the dataset."""
    return get_metadata_from_file(id)

@router.get("/summary/{id}")
def get_dataset_summary(id: str):
    """Returns a summary of the dataset including metrics."""
    metadata = get_metadata_from_file(id)
    return {
        "summary": metadata.get("summary", "No summary available"),
        "rows": metadata.get("rows", 0),
        "columns": len(metadata.get("column_names", [])),
        "quality_score": metadata.get("data_quality_score", 0)
    }

@router.get("/metadata/{id}")
def get_dataset_metadata(id: str):
    """Returns specific metadata fields like rows, cols, types."""
    metadata = get_metadata_from_file(id)
    return {
        "status": "success",
        "data": {
            "rows": metadata.get("rows"),
            "column_names": metadata.get("column_names"),
            "data_quality_score": metadata.get("data_quality_score"),
            "problem_type": metadata.get("problem_type"),
            "feature_types": {
                 "numerical": metadata.get("numerical_features"),
                 "categorical": metadata.get("categorical_features"),
                 "datetime": metadata.get("datetime_features")
            }
        }
    }
