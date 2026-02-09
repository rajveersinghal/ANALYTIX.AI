# app/core/explainability/pdp_generator.py
from sklearn.inspection import partial_dependence
from sklearn.pipeline import Pipeline

def compute_pdp(model, X_train, feature_names: list, target_feature: str):
    """
    Computes PDP for a specific feature.
    """
    estimator = model
    if isinstance(model, Pipeline):
        estimator = model.named_steps.get('model', model.steps[-1][1])
        
    try:
        # Find index of feature
        if target_feature not in feature_names:
            return None
            
        feature_idx = feature_names.index(target_feature)
        
        pdp_results = partial_dependence(
            estimator, X_train, [feature_idx], grid_resolution=20
        )
        
        return {
            "feature": target_feature,
            "x_values": pdp_results['values'][0].tolist(),
            "y_values": pdp_results['average'][0].tolist()
        }
    except Exception as e:
        print(f"PDP failed: {e}")
        return None
