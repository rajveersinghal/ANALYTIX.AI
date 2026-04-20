# app/services/decision_service.py
import os
import pandas as pd
from app.config import settings
from app.logger import logger
from app.utils.metadata_manager import MetadataManager
from app.utils.response_schema import success_response, error_response

# Import Decision Engine
from app.core.decision_engine.decision_rules import generate_recommendations
from app.core.decision_engine.what_if_simulator import simulate_what_if
from app.core.decision_engine.decision_generator import generate_decision_summary
from app.utils.decision_utils import load_model, load_feature_importance
from app.utils.domain_config import get_unit
from app.services.strategic_narrative import StrategicNarrativeService

class DecisionService:

    async def get_recommendations(self, file_id: str):
        """Fetches the generated decision results from metadata."""
        mm = MetadataManager(file_id)
        metadata = await mm.load()
        return metadata.get("decision_results", {})

    async def run_decision_assistant(self, dataset_id: str, base_input: dict, changes: dict, user_id: str = None):
        """
        Orchestrates the interactive Decision Assistant logic.
        """
        try:
            # 1. Load Artifacts
            model = await load_model(dataset_id)
            if not model:
                raise ValueError("Trained model not found. Please run the Modeling step first.")
            
            feature_importance = await load_feature_importance(dataset_id)
            if not feature_importance:
                logger.warning(f"No feature importance found for {dataset_id}. Using empty dict.")
                feature_importance = {}
 
            # 2. Generate Logic
            mm = MetadataManager(dataset_id, user_id=user_id)
            metadata = await mm.load()
            unit = get_unit(metadata.get("domain", "general"), metadata.get("problem_type", "regression"))
            
            recommendations = generate_recommendations(feature_importance)
            what_if_result = simulate_what_if(model, base_input, changes)
            summary = generate_decision_summary(recommendations, what_if_result, unit=unit)
            
            # Add dynamic simulation insight
            simulation_insight = StrategicNarrativeService.calculate_simulation_insight(
                what_if_result.get("original_prediction", 0),
                what_if_result.get("new_prediction", 0),
                unit=unit
            )
            summary.append(simulation_insight)

            return {
                "recommendations": recommendations,
                "what_if": what_if_result,
                "summary": summary,
                "base_prediction": what_if_result.get("original_prediction"),
                "unit": unit
            }
        except Exception as e:
            logger.error(f"Decision Assistant Error for {dataset_id}: {e}")
            raise e

    async def run_decision(self, file_id: str, user_id: str = None, project_id: str = None, overrides: dict = None):
        """
        Orchestrates the background decision pipeline (Automated).
        """
        try:
            mm = MetadataManager(file_id, user_id=user_id, project_id=project_id)
            metadata = await mm.load()
            await mm.update_phase("decision", "running")
            
            await mm.update_step("decision", "rule_generation", "running")
            await mm.update_step("decision", "risk_assessment", "running")
            
            # For automated run, we generate generic recommendations based on importance
            feature_importance = await load_feature_importance(file_id) or {}
            recommendations = generate_recommendations(feature_importance, top_k=5)
            
            # Generate Executive Narrative
            executive_narrative = await StrategicNarrativeService.generate_executive_summary(metadata)
            
            results = {
                "recommendations": recommendations,
                "risks": [r for r in recommendations if "Reducing" in r],
                "opportunities": [r for r in recommendations if "Increasing" in r],
                "executive_narrative": executive_narrative
            }
            
            await mm.update_step("decision", "rule_generation", "completed")
            await mm.update_step("decision", "risk_assessment", "completed")
            await mm.add_log("decision", "Generated actionable business recommendations and executive narrative.")
            
            # Save to Metadata
            metadata["decision_results"] = results
            await mm.save(metadata)
            await mm.update_phase("decision", "completed")
            
            return success_response(data=results)
            
        except Exception as e:
            logger.error(f"Decision Service Failure: {e}")
            return error_response(f"Decision engine failed: {str(e)}")
