"""
Intent Detection & Orchestration Engine
Transforms ANALYTIX.AI into an intelligent, adaptive platform
"""

from typing import Dict, List, Any, Tuple, Optional
import pandas as pd
import numpy as np
from datetime import datetime

class IntentEngine:
    """Core platform brain - detects user intent and orchestrates execution"""
    
    # Intent definitions with requirements
    INTENTS = {
        "predict": {
            "name": "🎯 Build Predictive Model",
            "description": "Train ML models to predict future outcomes",
            "icon": "🤖",
            "required_steps": ["clean", "engineer", "train", "evaluate", "insights"],
            "min_rows": 50,
            "min_cols": 2,
            "requires_target": True,
            "business_value": "Forecast sales, predict churn, estimate prices",
            "example": "Predict customer churn, forecast revenue, estimate house prices"
        },
        "analyze": {
            "name": "📊 Explore & Understand Data",
            "description": "Deep dive into patterns, trends, and relationships",
            "icon": "🔍",
            "required_steps": ["clean", "eda", "insights"],
            "min_rows": 10,
            "min_cols": 1,
            "requires_target": False,
            "business_value": "Discover hidden patterns, understand customer behavior",
            "example": "Find sales trends, identify customer segments, detect anomalies"
        },
        "diagnose": {
            "name": "🏥 Data Health Check",
            "description": "Identify quality issues, missing values, and anomalies",
            "icon": "⚕️",
            "required_steps": ["quality_check"],
            "min_rows": 1,
            "min_cols": 1,
            "requires_target": False,
            "business_value": "Ensure data reliability before making decisions",
            "example": "Check for missing data, detect outliers, validate data types"
        },
        "optimize": {
            "name": "⚡ Optimize Existing Model",
            "description": "Improve model performance with advanced techniques",
            "icon": "🚀",
            "required_steps": ["engineer", "train", "evaluate"],
            "min_rows": 100,
            "min_cols": 3,
            "requires_target": True,
            "business_value": "Boost accuracy, reduce errors, improve predictions",
            "example": "Tune hyperparameters, try ensemble methods, feature selection"
        },
        "explain": {
            "name": "💡 Understand Model Decisions",
            "description": "Explain why models make specific predictions",
            "icon": "🔮",
            "required_steps": ["insights", "explainability"],
            "min_rows": 50,
            "min_cols": 2,
            "requires_target": True,
            "business_value": "Build trust, meet compliance, debug models",
            "example": "Which features drive predictions? Why did model predict X?"
        },
        "forecast": {
            "name": "📈 Time Series Forecasting",
            "description": "Predict future values based on historical trends",
            "icon": "⏰",
            "required_steps": ["timeseries", "train", "evaluate"],
            "min_rows": 30,
            "min_cols": 2,
            "requires_target": True,
            "business_value": "Plan inventory, predict demand, forecast revenue",
            "example": "Sales forecasting, demand prediction, stock price trends"
        },
        "compare": {
            "name": "⚖️ A/B Testing & Comparison",
            "description": "Compare groups and measure statistical significance",
            "icon": "🧪",
            "required_steps": ["ab_testing", "insights"],
            "min_rows": 100,
            "min_cols": 2,
            "requires_target": False,
            "business_value": "Test marketing campaigns, compare strategies",
            "example": "Compare ad performance, test pricing strategies"
        },
        "monitor": {
            "name": "🔔 Monitor Model Performance",
            "description": "Track model drift and data quality over time",
            "icon": "📡",
            "required_steps": ["drift_detection", "monitoring"],
            "min_rows": 50,
            "min_cols": 2,
            "requires_target": True,
            "business_value": "Detect when models need retraining",
            "example": "Monitor prediction accuracy, detect data drift"
        }
    }
    
    @staticmethod
    def detect_user_intent(selected_intent: str, df: pd.DataFrame, target_col: Optional[str] = None) -> Dict[str, Any]:
        """
        Validates and enriches user's selected intent
        
        Args:
            selected_intent: Intent key selected by user
            df: Uploaded dataset
            target_col: Optional target column
            
        Returns:
            Dict with intent details, validation status, and recommendations
        """
        if selected_intent not in IntentEngine.INTENTS:
            return {
                "valid": False,
                "error": "Invalid intent selected",
                "intent": None
            }
        
        intent = IntentEngine.INTENTS[selected_intent].copy()
        intent["key"] = selected_intent
        
        # Validate requirements
        validation = IntentEngine.validate_intent_requirements(intent, df, target_col)
        
        # Calculate confidence
        confidence = IntentEngine._calculate_intent_confidence(intent, df, target_col)
        
        # Generate recommendations
        recommendations = IntentEngine._generate_intent_recommendations(intent, df, target_col)
        
        return {
            "valid": validation["valid"],
            "intent": intent,
            "validation": validation,
            "confidence": confidence,
            "recommendations": recommendations,
            "estimated_time": IntentEngine._estimate_execution_time(intent, df),
            "pipeline": IntentEngine.route_intent_to_pipeline(intent)
        }
    
    @staticmethod
    def validate_intent_requirements(intent: Dict, df: pd.DataFrame, target_col: Optional[str] = None) -> Dict[str, Any]:
        """
        Validates if dataset meets intent requirements
        
        Returns:
            Dict with validation status and warnings
        """
        warnings = []
        errors = []
        
        # Check minimum rows
        if len(df) < intent["min_rows"]:
            errors.append(f"⚠️ Need at least {intent['min_rows']} rows, found {len(df)}")
        
        # Check minimum columns
        if len(df.columns) < intent["min_cols"]:
            errors.append(f"⚠️ Need at least {intent['min_cols']} columns, found {len(df.columns)}")
        
        # Check target column requirement
        if intent["requires_target"] and not target_col:
            errors.append("⚠️ This intent requires selecting a target column")
        
        # Data quality warnings
        missing_pct = (df.isnull().sum().sum() / df.size) * 100
        if missing_pct > 30:
            warnings.append(f"⚠️ {missing_pct:.1f}% missing data - may affect results")
        
        # Check for time series data if needed
        if intent["key"] == "forecast":
            datetime_cols = df.select_dtypes(include=['datetime64']).columns
            if len(datetime_cols) == 0:
                warnings.append("⚠️ No datetime column detected - may need to convert")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "data_quality_score": max(0, 100 - missing_pct)
        }
    
    @staticmethod
    def route_intent_to_pipeline(intent: Dict) -> List[Dict[str, Any]]:
        """
        Maps intent to specific pipeline steps with configurations
        
        Returns:
            Ordered list of pipeline steps to execute
        """
        pipeline = []
        
        for step in intent["required_steps"]:
            step_config = {
                "step": step,
                "name": IntentEngine._get_step_name(step),
                "description": IntentEngine._get_step_description(step),
                "required": True
            }
            pipeline.append(step_config)
        
        return pipeline
    
    @staticmethod
    def _calculate_intent_confidence(intent: Dict, df: pd.DataFrame, target_col: Optional[str]) -> float:
        """Calculates confidence score for intent success"""
        score = 100.0
        
        # Penalize for small datasets
        if len(df) < intent["min_rows"] * 2:
            score -= 20
        
        # Penalize for missing data
        missing_pct = (df.isnull().sum().sum() / df.size) * 100
        score -= min(30, missing_pct)
        
        # Bonus for good data quality
        if missing_pct < 5:
            score += 10
        
        # Penalize for too few features (if prediction task)
        if intent["requires_target"] and len(df.columns) < 5:
            score -= 15
        
        return max(0, min(100, score))
    
    @staticmethod
    def _generate_intent_recommendations(intent: Dict, df: pd.DataFrame, target_col: Optional[str]) -> List[str]:
        """Generates smart recommendations for the intent"""
        recommendations = []
        
        # Data size recommendations
        if len(df) < 1000 and intent["requires_target"]:
            recommendations.append("💡 Consider collecting more data for better model performance")
        
        # Feature recommendations
        if intent["requires_target"] and len(df.columns) < 10:
            recommendations.append("💡 Feature engineering could improve results")
        
        # Time series specific
        if intent["key"] == "forecast":
            recommendations.append("💡 Ensure data is sorted by date/time")
        
        # A/B testing specific
        if intent["key"] == "compare":
            recommendations.append("💡 Ensure you have clear control and treatment groups")
        
        return recommendations
    
    @staticmethod
    def _estimate_execution_time(intent: Dict, df: pd.DataFrame) -> str:
        """Estimates execution time based on data size and intent"""
        rows = len(df)
        cols = len(df.columns)
        
        # Base time estimates (in seconds)
        base_times = {
            "diagnose": 5,
            "analyze": 15,
            "predict": 60,
            "optimize": 120,
            "explain": 30,
            "forecast": 45,
            "compare": 20,
            "monitor": 25
        }
        
        base = base_times.get(intent["key"], 30)
        
        # Scale with data size
        if rows > 10000:
            base *= 2
        if cols > 50:
            base *= 1.5
        
        if base < 30:
            return "< 30 seconds"
        elif base < 60:
            return "~ 1 minute"
        elif base < 120:
            return "1-2 minutes"
        else:
            return "2-5 minutes"
    
    @staticmethod
    def _get_step_name(step: str) -> str:
        """Returns human-readable step name"""
        names = {
            "clean": "Data Cleaning",
            "quality_check": "Quality Assessment",
            "eda": "Exploratory Analysis",
            "engineer": "Feature Engineering",
            "train": "Model Training",
            "evaluate": "Model Evaluation",
            "insights": "Generate Insights",
            "explainability": "Model Explanation",
            "timeseries": "Time Series Analysis",
            "ab_testing": "A/B Testing",
            "drift_detection": "Drift Detection",
            "monitoring": "Performance Monitoring"
        }
        return names.get(step, step.title())
    
    @staticmethod
    def _get_step_description(step: str) -> str:
        """Returns step description"""
        descriptions = {
            "clean": "Handle missing values, outliers, and data types",
            "quality_check": "Assess data quality and readiness",
            "eda": "Visualize distributions and relationships",
            "engineer": "Create and select optimal features",
            "train": "Train and tune ML models",
            "evaluate": "Measure model performance",
            "insights": "Extract actionable insights",
            "explainability": "Explain model predictions",
            "timeseries": "Analyze temporal patterns",
            "ab_testing": "Statistical comparison of groups",
            "drift_detection": "Monitor data distribution changes",
            "monitoring": "Track model performance over time"
        }
        return descriptions.get(step, "")
    
    @staticmethod
    def log_intent_execution(intent_key: str, status: str, results: Dict[str, Any], execution_time: float) -> str:
        """
        Logs intent execution for learning and analytics
        
        Returns:
            Execution ID
        """
        import json
        from pathlib import Path
        
        log_dir = Path("logs/intents")
        log_dir.mkdir(parents=True, exist_ok=True)
        
        execution_id = f"intent_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        log_entry = {
            "execution_id": execution_id,
            "intent": intent_key,
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "execution_time_seconds": execution_time,
            "results_summary": {
                "success": status == "completed",
                "steps_completed": results.get("steps_completed", []),
                "errors": results.get("errors", [])
            }
        }
        
        log_file = log_dir / f"{execution_id}.json"
        with open(log_file, 'w') as f:
            json.dump(log_entry, f, indent=2)
        
        return execution_id
