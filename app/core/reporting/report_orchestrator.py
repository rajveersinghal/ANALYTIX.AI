# app/core/reporting/report_orchestrator.py
from app.core.reporting.report_schema import FullReport, ReportSection
from app.core.reporting.narrative_generator import NarrativeGenerator
from app.utils.metadata_manager import MetadataManager
import datetime

class ReportOrchestrator:
    def __init__(self):
        self.narrative = NarrativeGenerator()
        
    def build_report_data(self, file_id: str) -> FullReport:
        # Load Centralized Metadata
        mm = MetadataManager(file_id)
        metadata = mm.load()
        
        sections = []
        
        # 1. Dataset Overview (Raw Data)
        sections.append(ReportSection(
            title="1. Dataset Overview",
            content=self.narrative.generate_dataset_overview(metadata),
            metrics={
                "Dataset ID": file_id,
                "Rows": metadata.get("rows"), 
                "Columns": metadata.get("columns"),
                "Target Variable": metadata.get("target_column", "Not Selected"),
                "Problem Type": metadata.get("problem_type", "N/A")
            }
        ))
        
        # 2. Data Quality Report (Before Cleaning)
        sections.append(ReportSection(
            title="2. Data Quality Report",
            content=self.narrative.generate_quality_report_narrative(metadata),
            # Metadata now contains column_info for detailed quality table
            metrics=metadata.get("column_info", {}) 
        ))
        
        # 3. Data Cleaning Actions (WHAT AnalytixAI DID)
        sections.append(ReportSection(
            title="3. Data Cleaning Actions",
            content=self.narrative.generate_cleaning_actions_narrative(metadata)
        ))
        
        # 4. EDA & Statistical Insights
        eda_results = metadata.get("eda_results", {})
        sections.append(ReportSection(
            title="4. EDA & Statistical Insights",
            content=self.narrative.generate_eda_statistical_summary(metadata)
        ))
        
        # 5. Machine Learning Results
        modeling_results = metadata.get("modeling_results", {})
        sections.append(ReportSection(
            title="5. Machine Learning Results",
            content=self.narrative.generate_model_summary(modeling_results),
            metrics={
                "Best Model": modeling_results.get("best_model"),
                "Validation Score": modeling_results.get("best_score"),
                "Metric Used": modeling_results.get("metric"),
                "Strategy": "AnalytixAI Smart Strategy"
            }
        ))
        
        # 6. Explainability & Decision Summary
        explainability_results = metadata.get("explainability_results", {})
        decision_results = metadata.get("decision_results", {})
        sections.append(ReportSection(
            title="6. Explainability & Decision Summary",
            content=self.narrative.generate_decision_summary_combined(explainability_results, decision_results)
        ))
        
        # 7. Cleaned Data Preview (Final Result)
        from app.config import settings
        import pandas as pd
        import os
        
        clean_path = os.path.join(settings.DATASET_DIR, f"{file_id}_train.csv")
        preview_data = {}
        if os.path.exists(clean_path):
            try:
                # Load first 10 rows for preview
                df_preview = pd.read_csv(clean_path, nrows=10)
                # Convert to dict for the metrics field (PDF generator will handle this)
                preview_data = {
                    "type": "data_preview",
                    "columns": df_preview.columns.tolist(),
                    "data": df_preview.values.tolist()
                }
            except Exception as e:
                print(f"Error loading preview: {e}")

        sections.append(ReportSection(
            title="7. Processed Dataset Preview",
            content=["Below is a sample of the cleaned and transformed dataset used for modeling."],
            metrics=preview_data if preview_data else None
        ))
        
        return FullReport(
            title="AnalytixAI Autonomous Analysis Report",
            dataset_name=metadata.get("filename", file_id),
            sections=sections
        )
