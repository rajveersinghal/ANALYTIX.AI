# app/core/nlp/insight_engine.py
import json
import asyncio
import pandas as pd
from typing import Dict, Any, List, Optional
from app.logger import logger
from app.config import settings
from app.utils.data_manager import data_manager

try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

EXECUTIVE_PROMPT = """
You are a Senior Business Consultant & Strategic Advisor.
Dataset Context: {context}

Focus: Business Impact, Revenue, Cost, Risk, and ROI.
Tone: Strategic, Decision-Focused, No-Jargon.

Structure your response as:
1. WHAT'S HAPPENING: (Concise current state)
2. WHY: (Causal drivers from features)
3. WHAT TO DO: (Actionable business strategy)

End with: '👉 SUGGESTED NEXT STEP: [Single high-impact action]'
"""

ANALYST_PROMPT = """
You are a Lead Data Analyst.
Dataset Context: {context}

Focus: Patterns, Relationships, and Data Distribution.
Tone: Insightful, Explanatory, Clear.

Structure your response to explain the 'Shape' of the data and the most significant correlations identified by the AutoML pipeline.
"""

TECHNICAL_PROMPT = """
You are a Principal Machine Learning Engineer.
Dataset Context: {context}

Focus: Model Metrics (R2, F1, Accuracy), SHAP values, and Distribution shift.
Tone: Precise, Technical, Low-Level.

Explain the architectural choices and model performance thresholds.
"""

class InsightEngine:
    """
    Architecture V2: Conversational Data Agent
    Transforms the LLM from a generic chatbot into a Tool-Using Data Analyst.
    """
    def __init__(self):
        self.api_key = settings.GENAI_API_KEY if hasattr(settings, 'GENAI_API_KEY') else None
        self.enabled = bool(self.api_key) and HAS_GENAI
        if self.enabled:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash-latest')

    async def ask_contextual_question(self, question: str, session_data: Dict[str, Any]) -> str:
        """
        New Agent Architecture: Natural Language -> Analysis -> Strategic Response.
        """
        if not self.enabled:
            return "Cognitive Module Offline: Please provide a GENAI_API_KEY to activate my intelligence layer."

        dataset_id = session_data.get("dataset_id")
        df = await data_manager.get_dataframe(dataset_id, "train")
        
        # Build High-Fidelity Context
        context = {
            "columns": list(df.columns) if df is not None else [],
            "shape": df.shape if df is not None else (0,0),
            "target": session_data.get("target_column"),
            "problem": session_data.get("problem_type", "General Intelligence"),
            "top_drivers": session_data.get("explainability_results", {}).get("business_brain", [])
        }

        # SYSTEM PROMPT: Establish Identity and Rules
        system_instruction = f"""
        Identity: You are the 'AnalytixAI Executive Partner'. 
        Objective: Answer business questions about this dataset using facts and data.
        
        DATA CONTEXT:
        - Columns: {context['columns']}
        - Total Samples: {context['shape'][0]}
        - Key KPI: {context['target']}
        - Business Domain: {session_data.get('domain', 'Industrial')}
        
        RULES:
        1. If the user asks for a specific number (e.g. 'How many rows are missing?'), use the context provided.
        2. If the user asks for a recommendation, use the 'top_drivers' context.
        3. Always translate technical findings into 'BUSINESS IMPACT'.
        4. Use a professional, executive tone. No jargon.
        5. NEVER use markdown stars (**) for bolding. Use CAPITAL LETTERS for emphasis.
        """

        # AGENT EXECUTION
        prompt = f"{system_instruction}\n\nUser Question: {question}\n\nAnalyst Response:"
        
        try:
            # AI Strategic Response
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            answer = response.text if response else "I encountered a neural synchronization error. Please rephrase."
            
            # Add 'AI Suggestion'
            suggestion_prompt = f"Based on the question '{question}', suggest one follow-up question the user should ask to gain more insight. Return ONLY the question text."
            suggestion_res = await asyncio.to_thread(self.model.generate_content, suggestion_prompt)
            suggestion = suggestion_res.text if suggestion_res else None
            
            final_output = f"{answer}"
            if suggestion:
                final_output += f"\n\nSUGGESTED NEXT STEP: {suggestion}"
                
            return final_output
            
        except Exception as e:
            logger.error(f"Agent Execution Failed: {e}")
            return "Cognitive interference detected. My LLM links are currently unstable."

    async def generate_consulting_recommendations(self, features: List[Dict]) -> List[Dict]:
        """
        Architecture V2: Generates actionable recommendations based on feature importance.
        """
        recommendations = []
        for f in features[:3]:
            # Strategic logic for recommendations
            if f['importance'] > 0.4:
                recommendations.append({
                    "title": f"Strategic Optimization of {f['name']}",
                    "rationale": f"With an importance of {int(f['importance']*100)}%, this is your primary performance lever.",
                    "action": f"Launch a targeted pilot to refine {f['name']} parameters by 5-10%."
                })
            else:
                recommendations.append({
                    "title": f"Incremental Gains in {f['name']}",
                    "rationale": f"{f['name']} shows a secondary but meaningful influence on outcomes.",
                    "action": f"Automate routine monitoring of {f['name']} to maintain baseline stability."
                })
        return recommendations

    def detect_risks(self, feature_importance: Dict[str, float]) -> List[str]:
        """
        Architecture V2: Detects systemic business risks based on data distribution.
        """
        risks = []
        for feat, imp in feature_importance.items():
            if imp > 0.6:
                risks.append(f"CRITICAL DEPENDENCY: Your business model is highly sensitive to '{feat}'. Volatility here could destabilize the target.")
            elif imp > 0.4:
                risks.append(f"CONCENTRATION RISK: Significant reliance on '{feat}' detected. Diversification may be required.")
        
        if not risks:
            risks.append("STABILITY SIGNAL: No single feature dominates the model, indicating a well-balanced distribution of drivers.")
        return risks

    def detect_opportunities(self, feature_importance: Dict[str, float]) -> List[str]:
        """
        Architecture V2: Identifies untapped growth potential.
        """
        opportunities = []
        # Look for 'Moderate' drivers that could be upscaled
        moderate_levers = [f for f, i in feature_importance.items() if 0.15 < i < 0.35]
        for feat in moderate_levers[:2]:
            opportunities.append(f"UNEXPLORED LIFT: '{feat}' has moderate influence. Optimization in this area could unlock incremental growth.")
        
        return opportunities

    def get_confidence_level(self, score: float) -> Dict:
        """
        Architecture V2: Translates technical metric into executive confidence rating.
        """
        if score > 0.85:
            return {"level": "HIGH", "desc": "Model results are exceptionally reliable for strategic deployment.", "color": "emerald"}
        elif score > 0.65:
            return {"level": "MODERATE", "desc": "Results provide sound guidance but require human-in-the-loop validation.", "color": "amber"}
        else:
            return {"level": "PROVISIONAL", "desc": "Insights are indicative; further data collection is recommended for high-stakes decisions.", "color": "rose"}

    async def generate_strategic_advice(self, context: Dict[str, Any]) -> str:
        """
        Architecture V2: Multi-Layer Strategic Synthesis
        """
        if not self.enabled:
            return "Baseline Advice: Focus on data quality and feature engineering."

        prompt = f"""
        Act as a McKinsey Consultant. 
        Analyze these AutoML findings: {json.dumps(context)}
        
        Deliver 3 STRATEGIC RECOMMENDATIONS. 
        Each recommendation must have:
        1. A CLEAR TITLE
        2. BUSINESS RATIONALE (Why this matters)
        3. EXECUTIVE ACTION (What to do now)
        
        Use plain text only. NO BOLDING.
        """
        
        try:
            response = await asyncio.to_thread(self.model.generate_content, prompt)
            return response.text
        except Exception as e:
            logger.error(f"Advice Generation Failed: {e}")
            return "Focus on the top predictive drivers identified in the dashboard."

    def detect_mode(self, metadata: Dict, query: str) -> str:
        """
        Architecture V2: Auto-detects the optimal AI personality mode.
        """
        q = query.lower()
        domain = metadata.get("domain", "general")
        
        # 1. Technical Intent
        if any(word in q for word in ["accuracy", "model", "f1", "r2", "overfit", "train", "loss", "tuning"]):
            return "technical"
        
        # 2. Executive Intent (Sales/Impact)
        if domain == "sales" or any(word in q for word in ["revenue", "sales", "risk", "profit", "money", "cost", "strategy", "impact", "margin", "forecast"]):
            return "executive"
            
        return "analyst"

    async def get_adaptive_insight(self, file_id: str, query: str, user_id: str = None) -> str:
        """
        Architecture V2: Adaptive AI Personality (Copilot)
        """
        if not self.enabled:
            return "Cognitive Module Offline: Please activate Gemini via API key."

        try:
            from app.utils.metadata_manager import MetadataManager
            mm = MetadataManager(file_id, user_id=user_id)
            metadata = await mm.load()
            
            mode = self.detect_mode(metadata, query)
            logger.info(f"AI CO-PILOT: Switching to '{mode.upper()}' mode for query: {query}")
            
            # Context Enrichment
            context = {
                "dataset_name": metadata.get("filename"),
                "problem_type": metadata.get("problem_type"),
                "rows": metadata.get("rows"),
                "target": metadata.get("target_column"),
                "best_model": metadata.get("modeling_results", {}).get("best_model", {}).get("name"),
                "drivers": list(metadata.get("explainability_results", {}).get("global_explanation", {}).get("feature_importance", {}).keys())[:5]
            }
            
            # Select Prompt
            prompt_map = {
                "executive": EXECUTIVE_PROMPT,
                "technical": TECHNICAL_PROMPT,
                "analyst": ANALYST_PROMPT
            }
            system_instruction = prompt_map.get(mode, ANALYST_PROMPT).format(context=json.dumps(context))
            
            # Neural Invocation
            model = genai.GenerativeModel('gemini-1.5-flash-latest', system_instruction=system_instruction)
            chat = model.start_chat()
            
            response = await asyncio.to_thread(chat.send_message, query)
            return response.text
            
        except Exception as e:
            logger.error(f"Adaptive Insight Failed: {e}")
            return "Intelligence link degraded. Analyzing via baseline heuristics."

insight_engine = InsightEngine()
