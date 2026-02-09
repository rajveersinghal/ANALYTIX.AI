# app/services/report_service.py
import os
from app.config import settings
from app.core.reporting.report_orchestrator import ReportOrchestrator
from app.core.reporting.pdf_generator import PDFReportGenerator
from app.utils.metadata_manager import MetadataManager

class ReportService:
    def __init__(self):
        self.orchestrator = ReportOrchestrator()
        self.pdf_gen = PDFReportGenerator()
        
    def generate_report(self, file_id: str) -> str:
        mm = MetadataManager(file_id)
        metadata = mm.load()
        mm.update_phase("report", "running")
        mm.update_step("report", "generation", "running")
        
        # 1. Build Data
        report_data = self.orchestrator.build_report_data(file_id)
        
        # 2. Define Path
        filename = f"{file_id}_report.pdf"
        filepath = os.path.join(settings.DATASET_DIR, filename)
        
        # 3. Generate PDF
        self.pdf_gen.generate(report_data, filepath)
        
        mm.update_step("report", "generation", "completed")
        mm.add_log("report", "Compiled all insights and models into a professional PDF report.")
        
        # Update artifact in metadata
        mm.update_artifact("report", f"storage/datasets/{filename}")
        mm.update_phase("report", "completed")
        
        return filepath
