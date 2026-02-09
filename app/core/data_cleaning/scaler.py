# app/core/data_cleaning/scaler.py
from sklearn.preprocessing import StandardScaler, MinMaxScaler

def get_scaling_strategy(algo_type: str = "regression"):
    """
    Decides scaler.
    Linear/KNN/Neural Nets -> Standard or MinMax.
    Tree -> None needed usually, but Standard doesn't hurt.
    """
    if algo_type in ["linear", "knn", "svm", "neural_network", "regression", "clustering"]:
        return StandardScaler()
    return None # Or StandardScaler by default for safety
