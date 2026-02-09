from pydantic import BaseModel
from typing import List, Optional

class ReportSection(BaseModel):
    title: str
    content: List[str] # List of paragraphs
    metrics: Optional[dict] = None # Key-Value pairs for table

class FullReport(BaseModel):
    title: str
    dataset_name: str
    sections: List[ReportSection]
