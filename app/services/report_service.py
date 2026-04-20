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
        
    async def generate_report(self, file_id: str, user_id: str = None, project_id: str = None, overrides: dict = None) -> str:
        import asyncio
        mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
        metadata = await mm.load()
        await mm.update_phase("report", "running")
        await mm.update_step("report", "generation", "running")
        
        # 1. Build Data
        report_data = await self.orchestrator.build_report_data(file_id)
        
        # 2. Define Path
        filename = f"{file_id}_report.pdf"
        filepath = os.path.join(settings.REPORT_DIR, filename)
        
        # 3. Generate PDF (Offload to thread)
        await asyncio.to_thread(self.pdf_gen.generate, report_data, filepath)
        
        await mm.update_step("report", "generation", "completed")
        await mm.add_log("report", "Compiled all insights and models into a professional PDF report.")
        
        # Update artifact in metadata
        await mm.update_artifact("report", f"storage/reports/{filename}")
        await mm.update_phase("report", "completed")
        
        return filepath

    async def generate_html_report(self, file_id: str, user_id: str = None, project_id: str = None) -> str:
        """
        Generates an interactive HTML dashboard report.
        """
        import asyncio
        mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
        metadata = await mm.load()
        
        # Build Data
        report_data = await self.orchestrator.build_report_data(file_id)
        
        # Simple HTML Template (Premium Aesthetic)
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AnalytixAI | Executive Intelligence Dashboard</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet">
            <style>
                :root {{ --primary: #6366f1; --secondary: #a855f7; --bg: #030712; --card: #111827; --text: #f9fafb; --slate: #94a3b8; }}
                body {{ font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); padding: 50px 20px; line-height: 1.6; margin: 0; }}
                .container {{ max-width: 1000px; margin: auto; }}
                .header {{ text-align: left; border-left: 4px solid var(--primary); padding-left: 30px; margin-bottom: 60px; }}
                h1 {{ font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 3.5rem; margin: 0; letter-spacing: -2px; }}
                .eyebrow {{ color: var(--secondary); font-weight: 800; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 3px; }}
                .card {{ background: var(--card); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 40px; margin-bottom: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }}
                .tag {{ display: inline-block; padding: 5px 15px; border-radius: 8px; background: rgba(168, 85, 247, 0.1); color: var(--secondary); font-size: 0.7rem; font-weight: 800; text-transform: uppercase; margin-right: 10px; border: 1px solid rgba(168,85,247,0.2); }}
                h2 {{ font-family: 'Outfit', sans-serif; color: white; font-size: 1.8rem; margin-top: 0; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }}
                .metric-grid {{ display: grid; grid-cols: 1; md:grid-cols-3; gap: 20px; margin-top: 30px; }}
                .metric-item {{ padding: 20px; border-radius: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); }}
                .m-val {{ display: block; font-size: 1.5rem; font-weight: 900; color: var(--primary); font-family: 'Outfit'; }}
                .m-lab {{ font-size: 0.65rem; color: var(--slate); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }}
                .content-area {{ margin-top: 20px; color: var(--slate); font-size: 0.95rem; }}
                .highlight-box {{ border-radius: 16px; padding: 20px; margin-top: 20px; background: rgba(99, 102, 241, 0.05); border-left: 4px solid var(--primary); }}
                .watermark {{ position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 8rem; opacity: 0.02; pointer-events: none; font-weight: 900; white-space: nowrap; }}
            </style>
        </head>
        <body>
            <div class="watermark">ANALYTIXAI CONFIDENTIAL</div>
            <div class="container">
                <div class="header">
                    <span class="eyebrow">Strategic Report</span>
                    <h1>Intelligence <span style="color:var(--primary)">Brief</span></h1>
                    <p style="color: var(--slate); margin-top: 10px;">Executive Assessment of <strong>{report_data.dataset_name}</strong> · AI-Generated Dashboard</p>
                    <div style="margin-top: 20px;">
                        <span class="tag">Confidential</span> <span class="tag">McKinsey-Grade</span> <span class="tag">XGBoost Native</span>
                    </div>
                </div>
        """
        
        for section in report_data.sections:
            html_content += f"""
                <div class="card" onclick="this.classList.toggle('active')">
                    <h2>{section.title} <span style="font-size: 12px; opacity:0.3">CLICK TO EXPAND</span></h2>
                    <div class="content-area">
            """
            for p in section.content:
                html_content += f"<p>{p}</p>"
            
            if section.metrics:
                html_content += '<div class="metric-grid">'
                for k, v in section.metrics.items():
                    if isinstance(v, (dict, list)): continue 
                    html_content += f"""
                        <div class="metric-item">
                            <span class="m-val">{v}</span>
                            <span class="m-lab">{k}</span>
                        </div>
                    """
                html_content += "</div>"
                
            html_content += "</div></div>"
            
        html_content += """
                <div style="text-align: center; margin-top: 100px; padding-bottom: 50px;">
                    <span style="opacity: 0.2; font-size: 0.7rem; font-weight: 800; letter-spacing: 2px;">&copy; 2026 ANALYTIXAI PLATFORM | PROFESSIONAL EDITION</span>
                </div>
            </div>
        </body>
        </html>
        """
        
        for section in report_data.sections:
            html_content += f"""
                <div class="card">
                    <h2>{section.title}</h2>
            """
            for p in section.content:
                html_content += f"<p>{p}</p>"
            
            if section.metrics:
                html_content += "<ul>"
                for k, v in section.metrics.items():
                    if isinstance(v, dict): continue # Skip complex tables for simple HTML demo
                    html_content += f"<li><strong style='color:white;'>{k}:</strong> {v}</li>"
                html_content += "</ul>"
                
            html_content += "</div>"
            
        html_content += """
                <div style="text-align: center; margin-top: 50px; opacity: 0.3; font-size: 0.8rem;">
                    &copy; 2026 AnalytixAI | Professional Edition
                </div>
            </div>
        </body>
        </html>
        """
        
        filename = f"{file_id}_report.html"
        filepath = os.path.join(settings.REPORT_DIR, filename)
        
        def save_html(path, content):
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

        await asyncio.to_thread(save_html, filepath, html_content)
            
        return filepath
