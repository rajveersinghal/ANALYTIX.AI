from typing import Dict, List, Any
import datetime
from app.core.nlp.insight_engine import insight_engine

class StrategicNarrativeService:
    @staticmethod
    def get_bot_greeting(user_name: str = "Explorer") -> str:
        hour = datetime.datetime.now().hour
        greeting_prefix = "Good morning" if hour < 12 else "Good afternoon" if hour < 18 else "Good evening"
        return f"{greeting_prefix}, {user_name}! I'm AnalytixBot, your AI data guide. My mission is to translate these complex numbers into clear, simple business strategies. Ready to see what your data is hiding?"

    @staticmethod
    def get_stage_guidance(stage: str) -> str:
        guidance = {
            "upload": "First, we need some data to work with! Upload a CSV or Excel file, and I'll jump right on it. Don't worry about messy data—I'm a pro at cleaning up!",
            "data_understanding": "I'm currently performing a 'Data Health Check'. I'll identify feature types, find potential targets, and check for quality issues.",
            "data_cleaning": "I'm scrubbing the data now—removing duplicates, fixing gaps, and handling outliers. Think of it as a pre-analysis detox!",
            "eda": "This is where we find the 'Why'. I'm looking for hidden correlations and trends that could be the secret sauce for your business.",
            "modeling": "The heavy lifting! I'm training multiple AI models simultaneously to find the one that predicts your target with the highest possible precision.",
            "explainability": "No 'Black Boxes' allowed here! I'm breaking down exactly how the AI thinks and which factors influenced it the most.",
            "decision": "Time for results! I'm synthesizing all our findings into concrete, actionable steps you can take today.",
            "report": "Mission accomplished! Your Strategic Roadmap is ready. You can download the full executive summary below."
        }
        return guidance.get(stage, "I'm here to help you navigate every step of this journey. Just follow the progress bar!")

    @staticmethod
    async def generate_executive_summary(metadata: Dict[str, Any]) -> List[str]:
        """
        Translates raw technical metadata into human-readable business narratives and strategic advice.
        """
        narratives = []
        
        # 1. Pipeline Strength (Quality)
        quality_score = metadata.get("data_quality_score", metadata.get("quality_score", 0))
        if quality_score > 80:
            narratives.append(f"High Integrity Data: Your dataset is incredibly healthy ({quality_score}/100), forming a rock-solid foundation for our analysis.")
        elif quality_score > 50:
            narratives.append(f"Moderate Quality: We found some minor gaps ({quality_score}/100), but I've already applied automated remediation to keep us on track.")
        else:
            narratives.append(f"Action Required: The data quality was lower than expected ({quality_score}/100). I've cleaned it aggressively, but please validate the results carefully.")

        # 2. Extract context for Insight Engine (Cognitive Synthesis)
        explainability = metadata.get("explainability_results", {})
        global_exp = explainability.get("global_explanation", {})
        importances = global_exp.get("feature_importance", {})
        
        # Extract top 3 features
        top_features = sorted(
            [{"name": k, "importance": v} for k, v in importances.items()],
            key=lambda x: x["importance"],
            reverse=True
        )[:3]
        
        context = {
            "domain": metadata.get("domain", "General"),
            "target": metadata.get("target_column", "Target"),
            "quality_score": quality_score,
            "top_features": top_features,
            "modeling_score": metadata.get("modeling_results", {}).get("best_model", {}).get("accuracy", 0)
        }
        
        # 3. GENERATE STRATEGIC ADVICE (The cognitive synth core)
        strategic_advice = await insight_engine.generate_strategic_advice(context)
        
        if strategic_advice:
            narratives.append(f"Strategic Roadmap: {strategic_advice}")
        else:
            # Fallback to simple template driver if generator fails/no key
            if top_features:
                 main_driver = top_features[0]["name"]
                 narratives.append(f"Primary Strategic Driver: Analysis reveals that '{main_driver}' is the #1 factor influencing your outcomes. Focus your efforts here for maximum impact.")

        return narratives

    @staticmethod
    def calculate_simulation_insight(original_pred: float, new_pred: float, unit: str = "") -> str:
        delta = new_pred - original_pred
        percent_change = (delta / original_pred) * 100 if original_pred != 0 else 0
        direction = "increase" if delta > 0 else "decrease"
        intensity = "substantial" if abs(percent_change) > 20 else "notable" if abs(percent_change) > 5 else "slight"
        return f"This adjustment predicts a {intensity} {direction} of {abs(delta):.2f} {unit} ({percent_change:+.1f}% change) in the final outcome."
