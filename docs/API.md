# ANALYTIX.AI API Documentation

## Core Modules

### data_loader

**Purpose**: Handle data ingestion and initial validation.

#### Functions

##### `load_data(file)`
Load data from CSV or Excel file.

**Parameters:**
- `file`: Uploaded file object

**Returns:**
- `pd.DataFrame`: Loaded dataframe

**Example:**
```python
from src.core import data_loader
df = data_loader.load_data(uploaded_file)
```

##### `clean_and_convert_types(df)`
Automatically detect and convert column types.

**Parameters:**
- `df`: Input dataframe

**Returns:**
- `pd.DataFrame`: Dataframe with converted types

---

### cleaning

**Purpose**: Data cleaning and preprocessing.

#### Functions

##### `clean_data(df)`
Clean dataset by handling missing values and outliers.

**Parameters:**
- `df`: Input dataframe

**Returns:**
- `pd.DataFrame`: Cleaned dataframe

##### `handle_skewness(df)`
Fix skewed distributions using transformations.

**Parameters:**
- `df`: Input dataframe

**Returns:**
- `pd.DataFrame`: Transformed dataframe

---

### features

**Purpose**: Feature engineering and selection.

#### Functions

##### `robust_feature_selection(df)`
Remove low-variance and highly correlated features.

**Parameters:**
- `df`: Input dataframe

**Returns:**
- `pd.DataFrame`: Filtered dataframe

##### `engineer_features(df, target, problem_type, optimize_accuracy=False)`
Apply feature engineering pipeline.

**Parameters:**
- `df`: Input dataframe
- `target`: Target column name
- `problem_type`: 'Classification' or 'Regression'
- `optimize_accuracy`: Whether to use RFE

**Returns:**
- `pd.DataFrame`: Engineered dataframe

---

### modeling

**Purpose**: Model training and evaluation.

#### Functions

##### `detect_problem_type(df, target)`
Automatically detect if problem is classification or regression.

**Parameters:**
- `df`: Input dataframe
- `target`: Target column name

**Returns:**
- `str`: 'Classification' or 'Regression'

##### `train_and_evaluate(df, target, problem_type)`
Train and evaluate multiple models.

**Parameters:**
- `df`: Input dataframe
- `target`: Target column name
- `problem_type`: Problem type

**Returns:**
- `tuple`: (results, models, feature_names, X_test, y_test)

---

## Intelligence Modules

### experiment_tracker

**Purpose**: Track and log experiments.

#### Functions

##### `log_experiment(model_name, params, metrics, features, dataset_shape, tags)`
Log an experiment to CSV.

**Parameters:**
- `model_name`: Name of the model
- `params`: Model parameters
- `metrics`: Performance metrics
- `features`: Feature list
- `dataset_shape`: Shape of dataset
- `tags`: Experiment tags

**Returns:**
- `str`: Experiment ID

---

### report_generator

**Purpose**: Generate HTML reports.

#### Functions

##### `generate_html_report(dataset_name, stats, metrics, alerts, recommendations, quality_score, quality_explanation)`
Generate comprehensive HTML report.

**Parameters:**
- `dataset_name`: Name of dataset
- `stats`: Dataset statistics
- `metrics`: Model metrics
- `alerts`: Alert messages
- `recommendations`: Business recommendations
- `quality_score`: Data quality score
- `quality_explanation`: Quality explanation

**Returns:**
- `str`: HTML report content

---

## Configuration

### settings.py

Application-wide settings and configuration.

**Key Variables:**
- `BASE_DIR`: Base directory path
- `DATA_DIR`: Data directory path
- `MODELS_DIR`: Models directory path
- `MODEL_RANDOM_STATE`: Random seed
- `MODEL_TEST_SIZE`: Test set size

---

## Usage Examples

### Complete Pipeline

```python
from src.core import data_loader, cleaning, features, modeling

# 1. Load data
df = data_loader.load_data(file)
df = data_loader.clean_and_convert_types(df)

# 2. Clean data
df_cleaned = cleaning.clean_data(df)
df_fixed = cleaning.handle_skewness(df_cleaned)

# 3. Feature engineering
df_selected = features.robust_feature_selection(df_fixed)
df_final = features.engineer_features(df_selected, 'target', 'Classification')

# 4. Train models
problem_type = modeling.detect_problem_type(df_final, 'target')
results, models, feature_names, X_test, y_test = modeling.train_and_evaluate(
    df_final, 'target', problem_type
)
```
