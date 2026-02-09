# app/api/routes/decision.py
from fastapi import APIRouter, HTTPException
from app.services.decision_service import DecisionService
from app.utils.response_schema import success_response

router = APIRouter(prefix="/decision", tags=["Decision Engine"])
service = DecisionService()

@router.get("/recommend/{dataset_id}")
def get_recommendations(dataset_id: str):
    try:
        results = service.get_recommendations(dataset_id)
        return success_response(data=results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/assist/{dataset_id}")
def decision_assist(dataset_id: str, payload: dict):
    """
    Interactive endpoint for Decision Assistant simulations.
    Payload: { "base_input": {...}, "changes": {...} }
    """
    try:
        base_input = payload.get("base_input")
        changes = payload.get("changes", {})
        
        if base_input is None:
            raise HTTPException(status_code=400, detail="base_input is required for simulation.")
            
        result = service.run_decision_assistant(dataset_id, base_input, changes)
        return success_response(data=result)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/risks/{dataset_id}")
def get_risks(dataset_id: str):
    try:
        results = service.get_recommendations(dataset_id)
        return success_response(data={"risks": results.get('risks', [])})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/opportunities/{dataset_id}")
def get_opportunities(dataset_id: str):
    try:
        results = service.get_recommendations(dataset_id)
        return success_response(data={"opportunities": results.get('opportunities', [])})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
