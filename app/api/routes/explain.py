from fastapi import APIRouter, HTTPException, Depends
from app.services.explainability_service import ExplainabilityService
from app.core.auth.security import get_current_user
from app.utils.metadata_manager import MetadataManager
from app.utils.response_schema import success_response

router = APIRouter(prefix="/explain", tags=["Explainability"])
explain_service = ExplainabilityService()

async def verify_ownership(dataset_id: str, current_user: dict):
    mm = MetadataManager(dataset_id)
    if not await mm.check_user_access(current_user.get("_id")):
        raise HTTPException(status_code=403, detail="Unauthorized access to this intelligence fragment.")

@router.get("/global/{dataset_id}")
async def get_global_explanation(dataset_id: str, current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        results = await explain_service.get_global_explanation(dataset_id)
        return results
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/shap/{dataset_id}")
async def get_shap(dataset_id: str, current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        results = await explain_service.get_shap_values(dataset_id)
        return results
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard/{dataset_id}")
async def get_dashboard_data(dataset_id: str, current_user: dict = Depends(get_current_user)):
    try:
        await verify_ownership(dataset_id, current_user)
        results = await explain_service.get_dashboard_data(dataset_id, user_id=str(current_user.get("_id")))
        return success_response(data=results)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=str(e))
