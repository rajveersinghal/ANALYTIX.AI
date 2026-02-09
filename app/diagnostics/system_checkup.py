# app/diagnostics/system_checkup.py
import sys
import os
import pandas as pd
import numpy as np
import json
import joblib

# Setup Path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.config import settings
from app.utils.metadata_manager import MetadataManager
from app.utils.response_schema import success_response
from app.services.explainability_service import ExplainabilityService
from app.services.inference_service import InferenceService
from app.core.modeling import problem_router

def run_diagnostic():
    print("🚀 Starting AnalytixAI Deep System Checkup...\n")
    results = {"passed": 0, "failed": 0, "details": []}

    def log_result(test_name, success, message=""):
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"[{status}] {test_name}: {message}")
        if success: results["passed"] += 1
        else: results["failed"] += 1
        results["details"].append({"test": test_name, "success": success, "message": message})

    # 1. Test NaN Sanitization
    try:
        data_with_nan = {"score": np.nan, "impact": np.inf, "labels": ["A", "B", np.nan]}
        res = success_response(data=data_with_nan)
        json_str = json.dumps(res)
        if "null" in json_str and "nan" not in json_str.lower() and "inf" not in json_str.lower():
            log_result("JSON Sanitization", True, "NaN/Inf correctly replaced by null.")
        else:
            log_result("JSON Sanitization", False, "NaN/Inf still found in JSON output.")
    except Exception as e:
        log_result("JSON Sanitization", False, f"Crash during sanitization: {e}")

    # 2. Test Domain Routing & Units
    try:
        from app.utils.domain_config import get_unit
        unit = get_unit("real_estate", "regression")
        if unit == "Lakhs":
            log_result("Domain Configuration", True, "Successfully mapped Real Estate to Lakhs.")
        else:
            log_result("Domain Configuration", False, f"Incorrect unit for Real Estate: {unit}")
    except Exception as e:
        log_result("Domain Configuration", False, f"Config error: {e}")

    # 3. Test Explainability Resilience (Shallow Mock)
    try:
        es = ExplainabilityService()
        test_id = "diagnostic_test_001"
        # We manually inject a model if none exists to test the logic
        model_dir = settings.MODEL_DIR
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, f"{test_id}_model.pkl")
        
        # Save a simple model
        from sklearn.ensemble import HistGradientBoostingRegressor
        X_dummy = pd.DataFrame({"feat1": [1,2,3,4], "feat2": [5,6,7,8]})
        y_dummy = pd.Series([10, 20, 30, 40])
        dummy_model = HistGradientBoostingRegressor().fit(X_dummy, y_dummy)
        joblib.dump(dummy_model, model_path)
        
        # Save dummy training data
        train_path = os.path.join(settings.DATASET_DIR, f"{test_id}_train.csv")
        df_dummy = X_dummy.copy()
        df_dummy["target"] = y_dummy
        df_dummy.to_csv(train_path, index=False)
        
        # Mock metadata
        mm = MetadataManager(test_id)
        mm.save({
            "dataset_id": test_id, 
            "problem_type": "regression", 
            "numerical_features": ["feat1", "feat2"],
            "target_column": "target"
        })
        
        # Test Global Importance
        imp = success_response(data=es.get_global_explanation(test_id))
        if imp.get("data", {}).get("importances"):
            log_result("Explainability (Importance)", True, f"Found {len(imp['data']['importances'])} importance values using Permutation strategy.")
        else:
            log_result("Explainability (Importance)", False, f"No importance found. Response: {imp}")
            
        # Cleanup
        if os.path.exists(model_path): os.remove(model_path)
        if os.path.exists(train_path): os.remove(train_path)
    except Exception as e:
        log_result("Explainability Engine", False, f"Logic error: {e}")

    # 4. Final Verdict
    print(f"\n--- Final Verdict ---")
    print(f"Passed: {results['passed']} | Failed: {results['failed']}")
    if results["failed"] == 0:
        print("🎉 System is STABLE and Flow is Hardened.")
    else:
        print("⚠️ Issues detected. Please review logs.")

if __name__ == "__main__":
    run_diagnostic()
