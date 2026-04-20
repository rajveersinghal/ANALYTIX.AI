from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
import uuid

from app.core.auth.security import get_current_user
from app.core.db.mongodb import get_database
from app.utils.response_schema import success_response, error_response
from app.api.schemas import ProjectCreate, ProjectResponse, ProjectBase
from app.logger import logger

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("", response_model=dict)
async def create_project(
    project: ProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Creates a new project for the current user.
    """
    try:
        db = get_database()
        user_id = str(current_user["_id"])
        
        project_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        project_doc = {
            "id": project_id,
            "user_id": user_id,
            "name": project.name,
            "description": project.description,
            "created_at": now,
            "updated_at": now
        }
        
        await db.projects.insert_one(project_doc)
        
        # Clean up Internal MongoDB ID
        if "_id" in project_doc:
            del project_doc["_id"]
            
        return success_response(data=project_doc, message="Project created successfully")
    except Exception as e:
        logger.error(f"Failed to create project: {e}")
        return error_response(f"Failed to create project: {str(e)}")

@router.get("", response_model=dict)
async def list_projects(
    current_user: dict = Depends(get_current_user)
):
    """
    Lists all projects belonging to the current user.
    """
    try:
        db = get_database()
        user_id = str(current_user["_id"])
        
        cursor = db.projects.find({"user_id": user_id}).sort("created_at", -1)
        projects = await cursor.to_list(length=100)
        
        # Aggregate Sessions for each project
        for p in projects:
            p["_id"] = str(p["_id"])
            p_id = p.get("id")
            
            # Count sessions
            p["sessions_count"] = await db.sessions.count_documents({"user_id": user_id, "project_id": p_id})
            
            # Find best accuracy
            best_session = await db.sessions.find_one(
                {"user_id": user_id, "project_id": p_id, "pipeline_state.report": "completed"},
                sort=[("modeling_results.best_model.mean_score", -1)]
            )
            if best_session:
                res = best_session.get("modeling_results", {}).get("best_model", {})
                p["best_accuracy"] = res.get("mean_score") or res.get("accuracy")
            else:
                p["best_accuracy"] = None
            
        return success_response(data=projects)
    except Exception as e:
        logger.error(f"Failed to list projects: {e}")
        return error_response(f"Failed to fetch projects: {str(e)}")

@router.get("/{project_id}", response_model=dict)
async def get_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific project by ID.
    """
    try:
        db = get_database()
        user_id = str(current_user["_id"])
        
        project = await db.projects.find_one({"id": project_id, "user_id": user_id})
        if not project:
            return error_response("Project not found", status_code=404)
            
        project["_id"] = str(project["_id"])
        return success_response(data=project)
    except Exception as e:
        logger.error(f"Failed to get project: {e}")
        return error_response(f"Failed to fetch project: {str(e)}")

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Deletes a project. Note: Doesn't bulk delete sessions in this MVP version but should.
    """
    try:
        db = get_database()
        user_id = str(current_user["_id"])
        
        result = await db.projects.delete_one({"id": project_id, "user_id": user_id})
        if result.deleted_count == 0:
            return error_response("Project not found", status_code=404)
            
        return success_response(message="Project deleted successfully")
    except Exception as e:
        logger.error(f"Failed to delete project: {e}")
        return error_response(f"Failed to delete project: {str(e)}")
