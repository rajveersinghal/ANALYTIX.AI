import datetime
from typing import Any, Optional, Dict
from app.core.db.mongodb import get_database
from app.logger import logger
from bson import ObjectId

class MetadataManager:
    """
    Asynchronous Metadata Manager powered by MongoDB.
    Links analysis sessions to specific users for persistence and security.
    """
    
    def __init__(self, dataset_id: str, user_id: Optional[str] = None, project_id: Optional[str] = None):
        self.dataset_id = dataset_id
        self.user_id = user_id
        self.project_id = project_id
        self._cache = None
        self._dirty = False

    async def _ensure_loaded(self):
        if self._cache is None:
            db = get_database()
            # Try to find existing session
            doc = await db.sessions.find_one({"dataset_id": self.dataset_id})
            if doc:
                # Convert MongoDB types to JSON-friendly
                doc["_id"] = str(doc["_id"])
                if "created_at" in doc and isinstance(doc["created_at"], datetime.datetime):
                    doc["created_at"] = doc["created_at"].isoformat()
                if "last_updated" in doc and isinstance(doc["last_updated"], datetime.datetime):
                    doc["last_updated"] = doc["last_updated"].isoformat()
                self._cache = doc
            else:
                await self.create_default()

    async def create_default(self, save=True):
        # Default Structure
        now = datetime.datetime.utcnow()
        data = {
            "dataset_id": self.dataset_id,
            "user_id": self.user_id,
            "project_id": self.project_id,
            "created_at": now.isoformat(),
            "last_updated": now.isoformat(),
            "execution_mode": "fast",
            "pipeline_state": {p: "pending" for p in [
                "upload", "profiling", "cleaning", "eda", "statistics", 
                "routing", "modeling", "tuning", "explain", "decision", "report"
            ]},
            "artifacts": {"raw_data": None, "clean_data": None, "model": None, "report": None},
            "steps": {},
            "logs": {},
            "errors": {}
        }
        self._cache = data
        if save:
            await self.save()
        return data

    def _clean_nan(self, obj):
        import numpy as np
        if isinstance(obj, dict):
            return {k: self._clean_nan(v) for k, v in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [self._clean_nan(x) for x in obj]
        elif isinstance(obj, (float, np.float32, np.float64)):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        elif isinstance(obj, (int, np.int32, np.int64)):
            return int(obj)
        elif isinstance(obj, (np.bool_)):
            return bool(obj)
        return obj

    async def check_user_access(self, user_id: str) -> bool:
        """
        Security helper to verify user ownership without loading full metadata.
        Uses MongoDB projection for maximum performance.
        """
        db = get_database()
        doc = await db.sessions.find_one(
            {"dataset_id": self.dataset_id},
            {"user_id": 1, "_id": 0}
        )
        if not doc:
            return False
        return str(doc.get("user_id")) == str(user_id)

    async def load(self):
        await self._ensure_loaded()
        return self._cache

    async def save(self, data: Optional[Dict] = None):
        if data:
            self._cache = data
            
        if not self._cache:
            return
            
        db = get_database()
        self._cache["last_updated"] = datetime.datetime.utcnow().isoformat()
        clean_data = self._clean_nan(self._cache)
        
        # Determine the definitive IDs
        # Priority: self.user_id/project_id (if set) > clean_data["user_id/project_id"] > clean_data["userId/projectId"]
        
        # USER ID
        final_user_id = self.user_id or clean_data.get("user_id") or clean_data.get("userId")
        if final_user_id:
            clean_data["user_id"] = str(final_user_id)
            
        # PROJECT ID
        final_project_id = self.project_id or clean_data.get("project_id") or clean_data.get("projectId")
        if final_project_id:
            clean_data["project_id"] = str(final_project_id)

        # Cleanup camelCase if they exist to keep DB clean
        clean_data.pop("userId", None)
        clean_data.pop("projectId", None)

        # Remove _id string before saving to avoid duplicate key or mismatch
        clean_data.pop("_id", None)
        
        await db.sessions.update_one(
            {"dataset_id": self.dataset_id},
            {"$set": clean_data},
            upsert=True
        )
        self._dirty = False
        self._dirty = False

    async def _atomic_update(self, update_op: Dict, flush_cache: bool = True):
        """
        Internal helper to perform atomic partial updates in MongoDB.
        Prevents race conditions by using operators like $set and $push.
        """
        db = get_database()
        now = datetime.datetime.utcnow().isoformat()
        
        # Ensure last_updated is always part of the update
        if "$set" not in update_op:
            update_op["$set"] = {}
        update_op["$set"]["last_updated"] = now
        
        # Clean any nested NaNs if we're setting complex objects
        if "$set" in update_op:
            update_op["$set"] = self._clean_nan(update_op["$set"])

        await db.sessions.update_one(
            {"dataset_id": self.dataset_id},
            update_op,
            upsert=True
        )
        
        if flush_cache:
            # Mark cache as stale so next load() fetches fresh data from DB
            self._cache = None
            self._dirty = False

    async def update_phase(self, phase: str, status: str, details: str = None, flush=True):
        if flush:
            update_dict = {f"pipeline_state.{phase}": status}
            if status == "failed" and details:
                update_dict[f"errors.{phase}"] = details
            await self._atomic_update({"$set": update_dict})
        else:
            # Fallback to local cache if we are batching (less safe but faster)
            data = await self.load()
            data["pipeline_state"][phase] = status
            if status == "failed" and details:
                if "errors" not in data: data["errors"] = {}
                data["errors"][phase] = details
            self._dirty = True

    async def update_artifact(self, key: str, path: str, flush=True):
        if flush:
            await self._atomic_update({"$set": {f"artifacts.{key}": path}})
        else:
            data = await self.load()
            if "artifacts" not in data: data["artifacts"] = {}
            data["artifacts"][key] = path
            self._dirty = True
        
    async def set_mode(self, mode: str, flush=True):
        if flush:
            await self._atomic_update({"$set": {"execution_mode": mode}})
        else:
            data = await self.load()
            data["execution_mode"] = mode
            self._dirty = True
        
    async def update_config(self, key: str, value: Any, flush=True):
        if flush:
            await self._atomic_update({"$set": {key: value}})
        else:
            data = await self.load()
            data[key] = value
            self._dirty = True
        
    async def update_step(self, phase: str, step: str, status: str, flush=True):
        if flush:
            await self._atomic_update({"$set": {f"steps.{phase}.{step}": status}})
        else:
            data = await self.load()
            if "steps" not in data: data["steps"] = {}
            if phase not in data["steps"]: data["steps"][phase] = {}
            data["steps"][phase][step] = status
            self._dirty = True

    async def add_log(self, phase: str, message: str, flush=True):
        if flush:
            # Use $addToSet to avoid duplicate logs in DB
            await self._atomic_update({"$addToSet": {f"logs.{phase}": message}})
        else:
            data = await self.load()
            if "logs" not in data: data["logs"] = {}
            if phase not in data["logs"]: data["logs"][phase] = []
            if message not in data["logs"][phase]:
                data["logs"][phase].append(message)
            self._dirty = True

    async def update_ai_thinking(self, phase: str, thinking: str, flush: bool = True):
        """
        Updates the 'AI Thinking' narrative for a specific phase.
        Builds trust by explaining what the AI is doing.
        """
        if flush:
            await self._atomic_update({"$set": {f"steps.{phase}.ai_thinking": thinking}})
        else:
            data = await self.load()
            if "steps" not in data: data["steps"] = {}
            if phase not in data["steps"]: data["steps"][phase] = {}
            data["steps"][phase]["ai_thinking"] = thinking
            self._dirty = True

    async def add_step_insight(self, phase: str, insight: str, flush: bool = True):
        """
        Adds a strategic business insight generated during a specific phase.
        Converts technical outputs into business value.
        """
        if flush:
            await self._atomic_update({"$push": {f"steps.{phase}.insights": insight}})
        else:
            data = await self.load()
            if "steps" not in data: data["steps"] = {}
            if phase not in data["steps"]: data["steps"][phase] = {}
            if "insights" not in data["steps"][phase]: data["steps"][phase]["insights"] = []
            data["steps"][phase]["insights"].append(insight)
            self._dirty = True

    async def get_state(self):
        # Always fetch fresh state for the UI
        self._cache = None
        return await self.load()
    
    async def flush(self):
        if self._dirty:
            await self.save()
