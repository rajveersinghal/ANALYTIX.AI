# app/core/nlp/insight_engine.py
"""
AnalytixAI Data Intelligence Agent
====================================
Converts a raw dataset + ML session into a fully conversational, data-aware AI.
The agent computes REAL statistics from the actual DataFrame and feeds them
as grounded context to the LLM — ensuring every answer is factual and specific.
"""
import json
import asyncio
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from app.logger import logger
from app.config import settings
from app.utils.data_manager import data_manager

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False


# ─── System Prompts ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """
You are the AnalytixAI Data Intelligence Agent — an expert data scientist and business analyst.

You have been given REAL, COMPUTED statistics from the user's actual dataset below.
Use ONLY this context to answer questions. Do not hallucinate or invent numbers.

DATASET CONTEXT:
{context}

RULES:
1. Answer using the actual numbers provided in the context above.
2. Be concise but insightful — translate numbers into business meaning.
3. If the user asks for something not in the context, say "I don't have that specific data, but based on what I can see..."
4. Use plain text. No markdown stars. Use CAPITAL LETTERS for emphasis.
5. Always end complex answers with a "👉 KEY TAKEAWAY:" line.
"""


class InsightEngine:
    """
    Data Intelligence Agent V3
    - Loads the real DataFrame for the session
    - Computes grounded statistics (describe, correlations, value_counts, etc.)
    - Feeds actual numbers to the LLM as context
    - Answers ANY question about the dataset accurately
    """

    def __init__(self):
        self.api_key = settings.GENAI_API_KEY if hasattr(settings, 'GENAI_API_KEY') else None
        self.enabled = bool(self.api_key) and HAS_GENAI
        if self.enabled:
            genai.configure(api_key=self.api_key)
        # Model name — 2.0-flash is the latest, but 1.5-flash is more widely available
        self.model_name = 'gemini-1.5-flash'

    # ── Core Context Builder ────────────────────────────────────────────────────

    async def _build_data_context(self, dataset_id: str, metadata: Dict) -> Dict[str, Any]:
        """
        Loads the actual DataFrame and computes rich, grounded statistics.
        This is the foundation of every AI answer.
        """
        context = {
            "dataset_name": metadata.get("filename", "Dataset"),
            "problem_type": metadata.get("problem_type", "Unknown"),
            "target_column": metadata.get("target_column"),
            "best_model": (metadata.get("modeling_results") or {})
                          .get("best_model", {}).get("model_name", "AutoML"),
            "model_score": (metadata.get("modeling_results") or {})
                           .get("best_model", {}).get("mean_score"),
            "top_features": list(
                (metadata.get("explainability_results") or {})
                .get("global_explanation", {})
                .get("feature_importance", {}).keys()
            )[:8],
        }

        # Try to load the real DataFrame
        df = await data_manager.get_dataframe(dataset_id, "train")
        if df is None:
            df = await data_manager.get_dataframe(dataset_id, "raw")

        if df is not None and not df.empty:
            try:
                context["shape"] = {"rows": int(df.shape[0]), "columns": int(df.shape[1])}
                context["columns"] = list(df.columns)
                context["dtypes"] = {c: str(df[c].dtype) for c in df.columns}
                context["missing_values"] = {
                    c: int(df[c].isna().sum())
                    for c in df.columns if df[c].isna().sum() > 0
                }
                context["duplicate_rows"] = int(df.duplicated().sum())

                # Numeric stats
                num_df = df.select_dtypes(include=[np.number])
                if not num_df.empty:
                    desc = num_df.describe().round(3)
                    context["numeric_stats"] = desc.to_dict()

                    # Top correlations with target
                    target = metadata.get("target_column")
                    if target and target in num_df.columns:
                        corr = num_df.corr()[target].drop(target).sort_values(key=abs, ascending=False)
                        context["target_correlations"] = corr.round(3).to_dict()

                # Categorical value counts (top 5 per column)
                cat_df = df.select_dtypes(include=["object", "category"])
                if not cat_df.empty:
                    context["categorical_summary"] = {}
                    for col in cat_df.columns[:6]:  # limit to 6 columns
                        vc = df[col].value_counts().head(5)
                        context["categorical_summary"][col] = vc.to_dict()

                # Sample rows (first 5)
                context["sample_rows"] = df.head(5).fillna("N/A").to_dict(orient="records")

            except Exception as e:
                logger.warning(f"InsightEngine: Context build partial failure: {e}")
        else:
            context["note"] = "DataFrame not available in cache. Answering from metadata only."

        return context

    # ── Main Public Interface ───────────────────────────────────────────────────

    async def get_adaptive_insight(self, file_id: str, query: str, user_id: str = None) -> str:
        """
        Main entry point: given a dataset_id and a natural language question,
        return a grounded, factual AI answer.
        """
        if not self.enabled:
            return (
                "The AI chat requires a valid GENAI_API_KEY. "
                "Please add it to your .env file to activate the intelligence layer."
            )

        try:
            from app.utils.metadata_manager import MetadataManager
            mm = MetadataManager(file_id, user_id=user_id)
            metadata = await mm.load()

            logger.info(f"InsightEngine: Building data context for dataset={file_id}")
            context = await self._build_data_context(file_id, metadata)

            context_str = json.dumps(context, indent=2, default=str)
            system_instruction = SYSTEM_PROMPT.format(context=context_str)

            logger.info(f"InsightEngine: Sending query to Gemini: {query[:80]}")
            
            # List of models to try in order of preference
            candidate_models = [self.model_name, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro']
            last_error = None
            
            for model_id in candidate_models:
                try:
                    logger.info(f"InsightEngine: Attempting {model_id}...")
                    model = genai.GenerativeModel(
                        model_id,
                        system_instruction=system_instruction
                    )
                    chat = model.start_chat()
                    response = await asyncio.to_thread(chat.send_message, query)
                    return response.text
                except Exception as e:
                    last_error = str(e)
                    # If it's a 429 (Quota), don't bother trying other models
                    if '429' in last_error or 'quota' in last_error.lower():
                        break
                    # If it's a 404 (Not Found), try the next model
                    if '404' in last_error:
                        continue
                    # Other errors -> break and report
                    break

            # If we reach here, all attempted models failed
            logger.error(f"InsightEngine: All models failed. Last error: {last_error}")
            if '429' in last_error or 'quota' in last_error.lower():
                return "The AI chat is temporarily unavailable — the API quota has been reached. Please wait a few minutes."
            if '404' in last_error:
                return "The AI models are currently unavailable for this API key. Please check your Gemini API settings."
            return f"I encountered an error while analyzing your dataset: {last_error[:100]}"

        except Exception as e:
            logger.error(f"InsightEngine: get_adaptive_insight system failure: {e}")
            return f"I encountered a system error: {str(e)[:100]}"


    # ── Legacy/Pipeline Helpers (kept for compatibility) ────────────────────────

    async def generate_strategic_advice(self, context: Dict[str, Any]) -> str:
        if not self.enabled:
            return "Focus on the top predictive drivers identified in the dashboard."
        try:
            prompt = (
                f"Act as a McKinsey Consultant. "
                f"Analyze these AutoML findings: {json.dumps(context)}\n\n"
                f"Deliver 3 STRATEGIC RECOMMENDATIONS with TITLE, RATIONALE, and ACTION. "
                f"Plain text only. No markdown."
            )
            model = genai.GenerativeModel(self.model_name)
            response = await asyncio.to_thread(model.generate_content, prompt)
            return response.text
        except Exception as e:
            logger.error(f"Advice Generation Failed: {e}")
            return "Focus on the top predictive drivers identified in the dashboard."

    def get_confidence_level(self, score: float) -> Dict:
        if score > 0.85:
            return {"level": "HIGH", "desc": "Results are highly reliable.", "color": "emerald"}
        elif score > 0.65:
            return {"level": "MODERATE", "desc": "Results are sound but need validation.", "color": "amber"}
        return {"level": "PROVISIONAL", "desc": "More data recommended.", "color": "rose"}

    def detect_risks(self, feature_importance: Dict[str, float]) -> List[str]:
        risks = []
        for feat, imp in feature_importance.items():
            if imp > 0.6:
                risks.append(f"CRITICAL DEPENDENCY: Model is highly sensitive to '{feat}'.")
            elif imp > 0.4:
                risks.append(f"CONCENTRATION RISK: Significant reliance on '{feat}'.")
        if not risks:
            risks.append("STABILITY SIGNAL: No single feature dominates — well-balanced model.")
        return risks

    def detect_opportunities(self, feature_importance: Dict[str, float]) -> List[str]:
        opportunities = []
        moderate_levers = [f for f, i in feature_importance.items() if 0.15 < i < 0.35]
        for feat in moderate_levers[:2]:
            opportunities.append(f"UNEXPLORED LIFT: '{feat}' has moderate influence. Optimization here could unlock growth.")
        return opportunities

    async def generate_consulting_recommendations(self, features: List[Dict]) -> List[Dict]:
        recommendations = []
        for f in features[:3]:
            if f['importance'] > 0.4:
                recommendations.append({
                    "title": f"Strategic Optimization of {f['name']}",
                    "rationale": f"With {int(f['importance']*100)}% importance, this is your primary lever.",
                    "action": f"Launch a targeted pilot to refine {f['name']} by 5-10%."
                })
            else:
                recommendations.append({
                    "title": f"Incremental Gains via {f['name']}",
                    "rationale": f"{f['name']} shows secondary but meaningful influence.",
                    "action": f"Automate monitoring of {f['name']} for baseline stability."
                })
        return recommendations


insight_engine = InsightEngine()
