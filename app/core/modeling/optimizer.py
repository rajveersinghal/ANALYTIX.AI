# app/core/modeling/optimizer.py
import numpy as np
from sklearn.model_selection import RandomizedSearchCV
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, HistGradientBoostingRegressor, HistGradientBoostingClassifier
from app.logger import logger

# Specialized search spaces for AnalytixAI
PARAM_GRIDS = {
    "Random Forest Regressor": {
        "n_estimators": [50, 100, 200],
        "max_depth": [None, 10, 20, 30],
        "min_samples_split": [2, 5, 10],
        "bootstrap": [True, False]
    },
    "Random Forest Classifier": {
        "n_estimators": [50, 100, 200],
        "max_depth": [None, 10, 20, 30],
        "min_samples_split": [2, 5, 10],
        "bootstrap": [True, False]
    },
    "Hist Gradient Boosting": {
        "learning_rate": [0.01, 0.1, 0.2],
        "max_iter": [50, 100, 200],
        "max_depth": [None, 10, 20],
        "l2_regularization": [0.0, 0.1, 1.0]
    }
}

def get_param_grid(model_name: str):
    """Returns the search space for a given model name, if defined."""
    # Handle variations in naming
    for key in PARAM_GRIDS:
        if key.lower() in model_name.lower():
            return PARAM_GRIDS[key]
    return None

def tune_model(model, X, y, problem_type: str, n_iter: int = 10, cv: int = 2):
    """
    Performs Randomized Search CV to optimize hyperparameters for the winner model.
    """
    model_name = model.__class__.__name__
    # Map class name to our grid keys if possible
    grid = get_param_grid(model_name)
    
    if not grid:
        logger.info(f"Optimizer: No search space defined for {model_name}. Skipping tuning.")
        return model, {}

    scoring = 'r2' if problem_type == 'regression' else 'f1_weighted'
    
    try:
        logger.info(f"Optimizer: Starting tuning for {model_name} (Iterations: {n_iter})")
        search = RandomizedSearchCV(
            model, 
            param_distributions=grid, 
            n_iter=n_iter, 
            cv=cv, 
            scoring=scoring, 
            n_jobs=1, # Windows stability
            random_state=42
        )
        
        search.fit(X, y)
        logger.info(f"Optimizer: Tuning complete. Best Score: {search.best_score_:.4f}")
        
        return search.best_estimator_, search.best_params_
    except Exception as e:
        logger.error(f"Optimizer: Hyperparameter search failed: {e}")
        return model, {}
