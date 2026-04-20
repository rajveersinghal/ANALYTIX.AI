import os
from fastapi import APIRouter, Depends
from app.core.auth.security import get_current_user
from app.core.db.mongodb import get_database
from app.utils.response_schema import success_response, error_response
from app.config import settings
from app.logger import logger
from bson import ObjectId

router = APIRouter(prefix="/history", tags=["History"])

async def purge_physical_artifacts(file_id: str):
    """
    Scans storage directories and deletes all physical files associated with a session.
    """
    try:
        dirs_to_clean = [settings.DATASET_DIR, settings.MODEL_DIR, settings.REPORT_DIR]
        for directory in dirs_to_clean:
            if not os.path.exists(directory): continue
            
            for filename in os.listdir(directory):
                if filename.startswith(file_id):
                    file_path = os.path.join(directory, filename)
                    try:
                        os.remove(file_path)
                        logger.info(f"Purged artifact: {file_path}")
                    except Exception as e:
                        logger.warning(f"Failed to purge {file_path}: {e}")
    except Exception as e:
        logger.error(f"Global Artifact Purge Failed: {e}")

@router.get("/sessions")
async def get_user_sessions(
    project_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Returns all analysis sessions for the current user, optionally filtered by project_id.
    """
    try:
        db = get_database()
        user_id = str(current_user["_id"])
        
        query = {"user_id": user_id}
        if project_id:
            query["project_id"] = project_id
            
        # Find all metadata documents for this user & project
        cursor = db.sessions.find(query).sort("created_at", -1)
        sessions = await cursor.to_list(length=100)
        
        # Format for UI
        formatted_sessions = []
        for s in sessions:
            if not isinstance(s, dict): continue
            
            # Extraction of top-level status with type safety
            state = s.get("pipeline_state")
            if not isinstance(state, dict): state = {}
            
            status = "completed" if state.get("report") == "completed" else "running" if any(v == "running" for v in state.values()) else "pending"
            if any(v == "failed" for v in state.values()):
                status = "failed"

            # Deep null safety for modeling results
            mod_res = s.get("modeling_results")
            if not isinstance(mod_res, dict): mod_res = {}
            best_mod = mod_res.get("best_model")
            if not isinstance(best_mod, dict): best_mod = {}
            
            acc = best_mod.get("mean_score") or best_mod.get("accuracy") or 0
            
            # Extraction of summary data with type safety
            summary_data = s.get("summary")
            if not isinstance(summary_data, dict):
                summary_data = {}

            # BROADCASTING: provide redundant fields to satisfy different frontend codebases
            sess_obj = {
                "id": s.get("dataset_id"),
                "session_id": s.get("dataset_id"),
                "file_id": s.get("dataset_id"),
                "dataset_id": s.get("dataset_id"),
                
                "filename": s.get("filename") or "Unknown Dataset",
                "file_name": s.get("filename") or "Unknown Dataset",
                
                "created_at": s.get("created_at"),
                "date": s.get("created_at"),
                
                "status": status,
                "accuracy": acc,
                "best_model": best_mod.get("model_name") or "AutoML Model",
                "model_type": best_mod.get("model_name") or "AutoML Model",
                
                "task_type": s.get("task_type") or s.get("problem_type"),
                "project_id": s.get("project_id"),
                "rows": summary_data.get("rows") or s.get("rows") or 0
            }
            formatted_sessions.append(sess_obj)
            
        return success_response(data=formatted_sessions)
    except Exception as e:
        return error_response(f"Failed to fetch history: {str(e)}")

@router.get("/session/{file_id}")
async def get_session_details(file_id: str, current_user: dict = Depends(get_current_user)):
    """
    Returns full details for a specific session.
    """
    try:
        db = get_database()
        user_id = str(current_user["_id"])
        
        session = await db.sessions.find_one({"file_id": file_id, "user_id": user_id})
        if not session:
            # Fallback to dataset_id in case it's saved that way
            session = await db.sessions.find_one({"dataset_id": file_id, "user_id": user_id})
        if not session:
            return error_response("Session not found or access denied", status_code=404)
            
        # Clean up Internal MongoDB ID
        if "_id" in session:
            session["_id"] = str(session["_id"])
            
        return success_response(data=session)
    except Exception as e:
        return error_response(f"Failed to fetch session details: {str(e)}")

@router.delete("/session/{file_id}")
async def delete_session(file_id: str, current_user: dict = Depends(get_current_user)):
    """
    Deletes a specific session and its associated storage artifacts.
    """
    try:
        db = get_database()
        user_id = str(current_user["_id"])
        
        # 1. Purge from DB
        result = await db.sessions.delete_one({"file_id": file_id, "user_id": user_id})
        if result.deleted_count == 0:
            result = await db.sessions.delete_one({"dataset_id": file_id, "user_id": user_id})
        if result.deleted_count == 0:
            return error_response("Session not found or access denied", status_code=404)
        
        # 2. Purge from Disk (Non-blocking not strictly required but good practice)
        import asyncio
        await asyncio.to_thread(purge_physical_artifacts, file_id)
            
        return success_response(message="Session and all associated artifacts deleted")
    except Exception as e:
        return error_response(f"Failed to delete session: {str(e)}")
