# app/api/routes/task.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/task", tags=["Task"])

class TaskRequest(BaseModel):
    task_type: str   # prediction, recommendation, insight, clustering
    target_column: str | None = None

@router.post("/select")
def select_task(task: TaskRequest):
    return {
        "task_selected": task.task_type,
        "target": task.target_column
    }
