# app/core/modeling/trainer.py
import pandas as pd
from sklearn.model_selection import cross_val_score
import numpy as np

def train_and_evaluate(models: dict, X: pd.DataFrame, y: pd.Series, problem_type: str, cv: int = 2):
    """
    Trains multiple models using Cross-Validation and returns metrics.
    """
    results = []
    
    scoring = 'r2' if problem_type == 'regression' else 'f1_weighted'
    
    for name, model in models.items():
        try:
            # 2-Fold Cross Validation (Set n_jobs=1 for Windows Stability)
            scores = cross_val_score(model, X, y, cv=cv, scoring=scoring, n_jobs=1)
            mean_score = np.mean(scores)
            std_dev = np.std(scores)
            
            # Fit on full data for final model
            model.fit(X, y)
            
            results.append({
                "model_name": name,
                "model_obj": model, # The actual trained model object
                "mean_score": mean_score,
                "std_dev": std_dev,
                "metric": scoring
            })
        except Exception as e:
            from app.logger import logger
            logger.error(f"Failed to train {name}: {e}", exc_info=True)
            
    return results
