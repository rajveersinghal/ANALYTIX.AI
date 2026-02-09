# app/core/data_cleaning/encoder.py
from sklearn.preprocessing import OneHotEncoder, LabelEncoder

def get_encoding_strategy(feature_types: dict, df):
    """
    Decides encoding strategy. 
    Returns lists of columns for OneHot.
    Label Encoding usually for target if categorical.
    """
    # For Phase 2 pipeline building, we typically use OneHot for low cardinality nominals.
    # High cardinality might be dropped or target encoded (future).
    
    categorical = feature_types.get("categorical_features", [])
    one_hot_cols = []
    
    for col in categorical:
        if col in df.columns and df[col].nunique() < 20: # Limit one-hot to avoid explosion
            one_hot_cols.append(col)
            
    return one_hot_cols
