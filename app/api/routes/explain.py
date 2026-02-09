# app/api/routes/explain.py
from fastapi import APIRouter, HTTPException
from app.services.explainability_service import ExplainabilityService

router = APIRouter(prefix="/explain", tags=["Explainability"])
explain_service = ExplainabilityService()

@router.get("/global/{dataset_id}")
def get_global_explanation(dataset_id: str):
    try:
        results = explain_service.get_global_explanation(dataset_id)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shap/{dataset_id}")
def get_shap(dataset_id: str):
    try:
        results = explain_service.get_shap_values(dataset_id)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
