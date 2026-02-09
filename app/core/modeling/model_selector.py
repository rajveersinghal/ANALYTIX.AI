# app/core/modeling/model_selector.py

def select_best_model(results: list):
    """
    Selects the best model based on mean score.
    Future: Penalize high std_dev (unstable models).
    """
    if not results:
        return None
        
    # Sort by score descending
    sorted_results = sorted(results, key=lambda x: x['mean_score'], reverse=True)
    
    best_model_info = sorted_results[0]
    
    return best_model_info
