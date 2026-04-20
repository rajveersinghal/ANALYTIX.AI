from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.core.auth.security import get_current_user
from app.services.dataset_service import DatasetService
from app.core.db.mongodb import get_database
from datetime import datetime, timedelta

router = APIRouter(prefix="/upload", tags=["Upload"])
dataset_service = DatasetService()

@router.post("/dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    project_id: str = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        user_tier = current_user.get("tier", "free")
        user_id = str(current_user["_id"])
        user_email = current_user.get("email", "")
        
        # Admin Bypass & Tier Check
        is_admin = user_email == "admin@analytixai.com"
        
        # Free Tier Limit Check (Increased to 10/day for general users)
        if user_tier == "free" and not is_admin:
            db = get_database()
            twenty_four_hours_ago = datetime.utcnow() - timedelta(days=1)
            recent_uploads = await db.sessions.count_documents({
                "user_id": user_id,
                "created_at": {"$gte": twenty_four_hours_ago.isoformat()}
            })
            
            if recent_uploads >= 10:
                return {"status": "error", "message": "Usage limit reached (10/day). Upgrade to Pro for unlimited AI pipeline runs."}

        # Pass user_id and project_id to metadata manager through service
        return await dataset_service.upload_dataset(file, user_id=user_id, project_id=project_id)
    except Exception as e:
        return {"status": "error", "message": "Upload failed", "error": str(e)}
