# AnalytixAI API Reference

## Base URL
`http://localhost:8000`

## System Status
- **Health Check**: `GET /health` - Returns `{"status": "ok"}`
- **System Status**: `GET /status` - Returns CPU/Memory usage.

## 1. Data Ingestion
- **Upload Dataset**: `POST /upload/dataset` (Form Data: `file`)
  - Returns: `file_id` (UUID) used for all subsequent calls.
- **Get Summary**: `GET /dataset/summary/{file_id}`
- **Get Metadata**: `GET /dataset/metadata/{file_id}`

## 2. Data Cleaning
- **Run Cleaning**: `POST /clean/run/{file_id}`
  - Body: `{"task_type": "regression"|"classification", "target_column": "price"}`
  - Returns: Cleaning summary (rows dropped, imputations).

## 3. EDA (Exploratory Data Analysis)
- **Run EDA**: `POST /eda/run/{file_id}`
- **Get Insights**: `GET /eda/insights/{file_id}`

## 4. Statistics
- **Run Statistical Analysis**: `POST /stats/run/{file_id}`
- **Get Stats Summary**: `GET /stats/summary/{file_id}`

## 5. Machine Learning
- **Train AutoML**: `POST /model/train/{file_id}`
  - Returns: Best model name, score, metrics.
- **Get Best Model Info**: `GET /model/best/{file_id}`
- **Get Predictions (Sample)**: `GET /model/sample_predictions/{file_id}`

## 6. Explainability
- **Global Importance**: `GET /explain/global/{file_id}`
- **SHAP Summary**: `GET /explain/shap/{file_id}`

## 7. Decision Engine
- **Get Recommendations**: `GET /decision/recommend/{file_id}`
- **Simulate Scenario**: `POST /decision/simulate/{file_id}`
  - Body: `{"feature": "x", "change_pct": 0.1}`

## 8. Reporting
- **Generate PDF**: `GET /report/generate/{file_id}`
