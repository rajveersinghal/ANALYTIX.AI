from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.auth.security import get_current_user
from app.core.nlp.insight_engine import insight_engine
from app.core.db.mongodb import get_database
from app.utils.response_schema import success_response, error_response
from app.logger import logger

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
        user_id = str(current_user["_id"])
        user_email = current_user.get("email", "")
        is_admin = user_email == "admin@analytix.ai"

        logger.info(f"CHAT: Query from user={user_id} | session_id={query.session_id}")

        # Wide-net session lookup — same as history route
        id_query = {"$or": [
            {"dataset_id": query.session_id},
            {"file_id": query.session_id},
            {"last_job_id": query.session_id},
            {"active_job_id": query.session_id}
        ]}

        if is_admin:
            session = await db.sessions.find_one(id_query)
        else:
            session = await db.sessions.find_one({"$and": [{"user_id": user_id}, id_query]})

        if not session:
            logger.warning(f"CHAT: Session not found for session_id={query.session_id}")
            return error_response("Session not found. Please upload a dataset first.")

        # Always pass the canonical dataset_id to the insight engine
        canonical_dataset_id = session.get("dataset_id") or query.session_id
        logger.info(f"CHAT: Routing to insight engine with dataset_id={canonical_dataset_id}")

        answer = await insight_engine.get_adaptive_insight(
            file_id=canonical_dataset_id,
            query=query.question,
            user_id=user_id
        )
        return success_response(data={"answer": answer})

    except Exception as e:
        logger.error(f"CHAT: Unhandled exception: {e}")
        return error_response(str(e))
