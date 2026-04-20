# app/core/reporting/report_orchestrator.py
from app.core.reporting.report_schema import FullReport, ReportSection
from app.core.reporting.narrative_generator import NarrativeGenerator
from app.utils.metadata_manager import MetadataManager
import datetime

class ReportOrchestrator:
    def __init__(self):
        self.narrative = NarrativeGenerator()
        
    async def build_report_data(self, file_id: str) -> FullReport:
        # Load Centralized Metadata
        mm = MetadataManager(file_id)
        metadata = await mm.load()
        
        sections = []
        
        # 0. Executive Strategic Summary (McKinsey-Grade Insight)
        decision_results = metadata.get("decision_results", {})
        executive_narrative = decision_results.get("executive_narrative", [])
        if executive_narrative:
            sections.append(ReportSection(
                title="Executive Strategic Summary",
                content=executive_narrative
            ))
        else:
            # Generate a "Safe" fallback if Gemini hasn't run yet
            sections.append(ReportSection(
                title="Executive Brief",
                content=["The intelligence engine has successfully synthesized the dataset. Key drivers and optimization paths have been identified and are detailed in the following sections."]
            ))
        
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
        
        modeling_results = metadata.get("modeling_results", {})
        best_info = modeling_results.get("best_model", {})
        leaderboard = modeling_results.get("leaderboard", [])
        
        # Format leaderboard for table
        leaderboard_data = {
            "type": "leaderboard",
            "columns": ["Rank", "Model", "Score (R2/F1)"],
            "data": [[f"#{i+1}", m.get('model'), f"{m.get('score', 0)*100 if m.get('score', 0) <= 1.0 else m.get('score',0):.2f}%"] for i, m in enumerate(leaderboard)]
        }

        # Global Explanation extraction for summary
        explain_results = metadata.get("explainability_results", {})
        importance = explain_results.get("global_explanation", {}).get("feature_importance", {})
        top_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:5]
        importance_str = ", ".join([f"{k} ({v:.2f})" for k, v in top_features]) if top_features else "N/A"

        sections.append(ReportSection(
            title="5. Machine Learning Results",
            content=self.narrative.generate_model_summary(modeling_results),
            metrics={
                "Best Model": best_info.get("name", "N/A"),
                "Performance Score": f"{best_info.get('accuracy', 0)}%",
                "Metric Used": modeling_results.get("metric", "R2/F1"),
                "Primary Drivers": importance_str,
                "Leaderboard": leaderboard_data
            }
        ))
        
        # 6. Explainability & Strategic Decisions
        explainability_results = metadata.get("explainability_results", {})
        decision_results = metadata.get("decision_results", {})
        
        sections.append(ReportSection(
            title="6. Business Risk Assessment",
            content=self.narrative.generate_risk_narrative(metadata)
        ))

        sections.append(ReportSection(
            title="7. Growth Opportunities",
            content=self.narrative.generate_opportunity_narrative(metadata)
        ))

        sections.append(ReportSection(
            title="8. Explainability & Strategic Decisions",
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
            title="9. Processed Dataset Preview",
            content=["Below is a sample of the cleaned and transformed dataset used for modeling."],
            metrics=preview_data if preview_data else None
        ))
        
        return FullReport(
            title="AnalytixAI | Professional Executive Intelligence Brief",
            dataset_name=metadata.get("filename", file_id),
            sections=sections
        )
