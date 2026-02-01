"""
Intent Recommendation System
Suggests what users should do based on data characteristics
"""

from typing import Dict, List, Any, Tuple
import pandas as pd
import numpy as np

class IntentRecommender:
    """Intelligent system that recommends next best actions"""
    
    @staticmethod
    def recommend_intents(df: pd.DataFrame, user_history: List[Dict] = None) -> List[Dict[str, Any]]:
        """
        Analyzes dataset and recommends top 3 intents
        
        Args:
            df: Uploaded dataset
            user_history: Optional list of past user actions
            
        Returns:
            List of recommended intents with confidence scores
        """
        recommendations = []
        
        # Analyze data characteristics
        data_profile = IntentRecommender._profile_dataset(df)
        
        # Score each intent
        intent_scores = {
            "predict": IntentRecommender._score_predict_intent(data_profile),
            "analyze": IntentRecommender._score_analyze_intent(data_profile),
            "diagnose": IntentRecommender._score_diagnose_intent(data_profile),
            "forecast": IntentRecommender._score_forecast_intent(data_profile),
            "compare": IntentRecommender._score_compare_intent(data_profile),
        }
        
        # Sort by score
        sorted_intents = sorted(intent_scores.items(), key=lambda x: x[1]["score"], reverse=True)
        
        # Return top 3 with reasoning
        for intent_key, score_data in sorted_intents[:3]:
            recommendations.append({
                "intent": intent_key,
                "confidence": score_data["score"],
                "reason": score_data["reason"],
                "priority": "high" if score_data["score"] > 80 else "medium" if score_data["score"] > 60 else "low"
            })
        
        return recommendations
    
    @staticmethod
    def _profile_dataset(df: pd.DataFrame) -> Dict[str, Any]:
        """Creates comprehensive dataset profile"""
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        datetime_cols = df.select_dtypes(include=['datetime64']).columns
        
        # Detect potential target columns
        potential_targets = []
        for col in df.columns:
            if df[col].nunique() < 20 and df[col].nunique() > 1:
                potential_targets.append(col)
        
        # Data quality metrics
        missing_pct = (df.isnull().sum().sum() / df.size) * 100
        
        return {
            "rows": len(df),
            "cols": len(df.columns),
            "numeric_cols": len(numeric_cols),
            "categorical_cols": len(categorical_cols),
            "datetime_cols": len(datetime_cols),
            "potential_targets": potential_targets,
            "missing_pct": missing_pct,
            "has_datetime": len(datetime_cols) > 0,
            "is_large": len(df) > 1000,
            "is_wide": len(df.columns) > 20
        }
    
    @staticmethod
    def _score_predict_intent(profile: Dict) -> Dict[str, Any]:
        """Scores prediction intent based on data characteristics"""
        score = 50  # Base score
        reasons = []
        
        # Good indicators for prediction
        if profile["rows"] >= 100:
            score += 20
            reasons.append("sufficient data for training")
        
        if len(profile["potential_targets"]) > 0:
            score += 15
            reasons.append(f"found {len(profile['potential_targets'])} potential target columns")
        
        if profile["numeric_cols"] >= 3:
            score += 10
            reasons.append("multiple numeric features available")
        
        if profile["missing_pct"] < 10:
            score += 5
            reasons.append("good data quality")
        
        # Negative indicators
        if profile["rows"] < 50:
            score -= 30
            reasons.append("dataset too small for reliable predictions")
        
        if profile["cols"] < 2:
            score -= 20
            reasons.append("need more features")
        
        return {
            "score": max(0, min(100, score)),
            "reason": ", ".join(reasons) if reasons else "standard prediction task"
        }
    
    @staticmethod
    def _score_analyze_intent(profile: Dict) -> Dict[str, Any]:
        """Scores exploratory analysis intent"""
        score = 70  # Always a good starting point
        reasons = []
        
        if profile["is_wide"]:
            score += 10
            reasons.append("many columns to explore")
        
        if profile["categorical_cols"] > 0 and profile["numeric_cols"] > 0:
            score += 10
            reasons.append("mix of data types for rich analysis")
        
        if profile["missing_pct"] > 20:
            score += 5
            reasons.append("understanding data quality is important")
        
        return {
            "score": min(100, score),
            "reason": ", ".join(reasons) if reasons else "understand your data first"
        }
    
    @staticmethod
    def _score_diagnose_intent(profile: Dict) -> Dict[str, Any]:
        """Scores data health check intent"""
        score = 40  # Lower base - only if issues suspected
        reasons = []
        
        if profile["missing_pct"] > 20:
            score += 40
            reasons.append(f"{profile['missing_pct']:.1f}% missing data detected")
        
        if profile["rows"] < 100:
            score += 10
            reasons.append("small dataset - quality check recommended")
        
        if profile["missing_pct"] < 5:
            score -= 10
            reasons.append("data appears clean")
        
        return {
            "score": max(0, min(100, score)),
            "reason": ", ".join(reasons) if reasons else "verify data quality"
        }
    
    @staticmethod
    def _score_forecast_intent(profile: Dict) -> Dict[str, Any]:
        """Scores time series forecasting intent"""
        score = 20  # Low base - only if time series detected
        reasons = []
        
        if profile["has_datetime"]:
            score += 50
            reasons.append("datetime column detected")
        
        if profile["rows"] >= 30:
            score += 15
            reasons.append("sufficient historical data")
        
        if profile["numeric_cols"] >= 1:
            score += 10
            reasons.append("numeric values to forecast")
        
        if not profile["has_datetime"]:
            reasons.append("no datetime column found")
        
        return {
            "score": max(0, min(100, score)),
            "reason": ", ".join(reasons) if reasons else "time series analysis"
        }
    
    @staticmethod
    def _score_compare_intent(profile: Dict) -> Dict[str, Any]:
        """Scores A/B testing intent"""
        score = 30
        reasons = []
        
        if profile["categorical_cols"] >= 1:
            score += 20
            reasons.append("categorical columns for grouping")
        
        if profile["rows"] >= 100:
            score += 15
            reasons.append("enough data for statistical tests")
        
        if profile["numeric_cols"] >= 1:
            score += 10
            reasons.append("numeric metrics to compare")
        
        return {
            "score": max(0, min(100, score)),
            "reason": ", ".join(reasons) if reasons else "compare groups statistically"
        }
    
    @staticmethod
    def get_smart_suggestions(df: pd.DataFrame, selected_intent: str) -> List[str]:
        """
        Provides context-specific suggestions for selected intent
        
        Args:
            df: Dataset
            selected_intent: User's selected intent
            
        Returns:
            List of actionable suggestions
        """
        suggestions = []
        profile = IntentRecommender._profile_dataset(df)
        
        if selected_intent == "predict":
            if len(profile["potential_targets"]) > 0:
                suggestions.append(f"💡 Suggested target columns: {', '.join(profile['potential_targets'][:3])}")
            
            if profile["rows"] < 500:
                suggestions.append("💡 Consider collecting more data for better model performance")
            
            if profile["numeric_cols"] < 5:
                suggestions.append("💡 Feature engineering could create more predictive features")
        
        elif selected_intent == "analyze":
            if profile["missing_pct"] > 10:
                suggestions.append(f"💡 {profile['missing_pct']:.1f}% missing data - start with data quality check")
            
            suggestions.append("💡 Look for correlations between numeric features")
            
            if profile["categorical_cols"] > 0:
                suggestions.append("💡 Analyze distributions across categorical groups")
        
        elif selected_intent == "forecast":
            if profile["has_datetime"]:
                suggestions.append("💡 Ensure data is sorted by date/time")
                suggestions.append("💡 Check for seasonality patterns")
            else:
                suggestions.append("⚠️ Consider adding a datetime column for time series analysis")
        
        elif selected_intent == "compare":
            if profile["categorical_cols"] > 0:
                suggestions.append("💡 Use categorical columns to define control vs treatment groups")
            suggestions.append("💡 Ensure groups have sufficient sample sizes (>30 each)")
        
        return suggestions
