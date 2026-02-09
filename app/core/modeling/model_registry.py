from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, HistGradientBoostingRegressor, HistGradientBoostingClassifier
from sklearn.cluster import KMeans
from sklearn.ensemble import IsolationForest

def get_fast_models(problem_type: str):
    """
    Returns only the best/fastest model (HistGradientBoosting).
    Phase 13: Smart Strategy
    """
    models = {}
    if problem_type == "regression":
        models["Hist Gradient Boosting"] = HistGradientBoostingRegressor(random_state=42)
    elif problem_type == "classification":
        models["Hist Gradient Boosting"] = HistGradientBoostingClassifier(random_state=42)
    elif problem_type == "forecasting":
        # Using HGB with lag features assumed in pipeline
        models["HGB Forecaster"] = HistGradientBoostingRegressor(random_state=42)
    elif problem_type == "clustering":
        models["K-Means"] = KMeans(n_clusters=5, random_state=42)
    elif problem_type == "anomaly_detection":
        models["Isolation Forest"] = IsolationForest(contamination=0.1, random_state=42)
    return models

def get_deep_models(problem_type: str):
    """
    Returns a suite of models for deep analysis.
    """
    models = {}
    
    if problem_type == "regression":
        models["Linear Regression"] = LinearRegression()
        models["Random Forest Regressor"] = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        models["Hist Gradient Boosting"] = HistGradientBoostingRegressor(random_state=42)
        
    elif problem_type == "classification":
        models["Logistic Regression"] = LogisticRegression(max_iter=1000, random_state=42)
        models["Random Forest Classifier"] = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
        models["Hist Gradient Boosting"] = HistGradientBoostingClassifier(random_state=42)

    elif problem_type == "forecasting":
        models["HGB Forecaster"] = HistGradientBoostingRegressor(random_state=42)
        models["Random Forest Forecaster"] = RandomForestRegressor(n_estimators=100, random_state=42)

    elif problem_type == "clustering":
        models["K-Means"] = KMeans(n_clusters=5, random_state=42)
        models["K-Means (10 Clusters)"] = KMeans(n_clusters=10, random_state=42)

    elif problem_type == "anomaly_detection":
        models["Isolation Forest (0.1)"] = IsolationForest(contamination=0.1, random_state=42)
        models["Isolation Forest (0.05)"] = IsolationForest(contamination=0.05, random_state=42)
        
    return models
