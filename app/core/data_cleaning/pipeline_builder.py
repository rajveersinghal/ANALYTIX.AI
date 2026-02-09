# app/core/data_cleaning/pipeline_builder.py
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

def build_pipeline(numerical_cols: list, categorical_cols: list, scaler=None):
    """
    Builds a reusable sklearn pipeline.
    """
    # Numerical Steps: Impute (if any missing left) + Scale
    num_steps = [('imputer', SimpleImputer(strategy='median'))]
    if scaler:
        num_steps.append(('scaler', scaler))
        
    num_transformer = Pipeline(steps=num_steps)
    
    # Categorical Steps: Impute + Encode
    cat_steps = [
        ('imputer', SimpleImputer(strategy='constant', fill_value='Unknown')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ]
    cat_transformer = Pipeline(steps=cat_steps)
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, numerical_cols),
            ('cat', cat_transformer, categorical_cols)
        ],
        remainder='drop' # Drop ID columns or unknown stuff
    )
    
    pipeline = Pipeline(steps=[('preprocessor', preprocessor)])
    
    return pipeline
