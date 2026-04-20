from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.core.auth.security import get_current_user
from app.core.nlp.insight_engine import insight_engine
from app.core.db.mongodb import get_database
from app.utils.response_schema import success_response, error_response

router = APIRouter(prefix="/chat", tags=["Chat Assistant"])

class ChatQuery(BaseModel):
    session_id: str
    question: str

@router.post("/query")
async def chat_query(
    query: ChatQuery,
    current_user: dict = Depends(get_current_user)
):
    try:
        db = get_database()
        session = await db.sessions.find_one({"file_id": query.session_id, "user_id": str(current_user["_id"])})
        
        if not session:
            # Check by raw ID just in case
            from bson import ObjectId
            try:
                session = await db.sessions.find_one({"_id": ObjectId(query.session_id), "user_id": str(current_user["_id"])})
            except:
                pass
                
            if not session:
                raise HTTPException(status_code=404, detail="Session not found or inaccessible")
                
        answer = await insight_engine.get_adaptive_insight(
            file_id=query.session_id,
            query=query.question,
            user_id=str(current_user["_id"])
        )
        return success_response(data={"answer": answer})
    except Exception as e:
        return error_response(str(e))
