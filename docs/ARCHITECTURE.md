# AnalytixAI Technical Architecture

This document provides a deep dive into the engineering principles and pipeline orchestration governing the AnalytixAI platform.

## 1. The Core Philosophy
AnalytixAI is built on the **Single Source of Truth (SSoT)** principle. All pipeline states, metrics, cleaning actions, and model artifacts are managed by a centralized `MetadataManager`.

### Metadata Orchestration
The `MetadataManager` ensures that every stage of the 11-step pipeline is decoupled but synchronized. This allows for:
- **Resilient Polling**: The frontend can crash and reconnect without losing pipeline progress.
- **Audit Trails**: Every modification to the data is recorded in the metadata for the final report.
- **NaN-Safe Serialization**: Custom recursive cleaners ensure JSON compliance for browser-based dashboards.

## 2. Pipeline Sequence (11 Stages)
1. **Upload**: Ingestion and persistent storage.
2. **Profiling**: Initial schema detection and 0-100 quality scoring.
3. **Data Understanding**: Deep univariate/bivariate analysis.
4. **Data Cleaning**: Automated remediation with audit logs.
5. **EDA**: Strategic insight discovery.
6. **Statistics**: Hypothesis testing (ANOVA/Chi-Square).
7. **Task Determination**: Domain-aware problem routing (Forecasting, etc.).
8. **Modeling**: Hyperparameter optimization and model selection.
9. **Explainability**: SHAP value computation and global importance.
10. **Decision Support**: Strategic recommendation engine.
11. **Reporting**: PDF orchestration and narrative generation.

## 3. Domain Intelligence Engine
The platform dynamically alters its internal logic based on the user-selected **Domain**.

### Problem Router
The `problem_router.py` maps business domains to mathematical tasks:
- **Real Estate** -> Clustering (Segmentation)
- **Finance** -> Anomaly Detection (Risk)
- **Operations** -> Forecasting (Demand)

### Narrative Generator
Storytelling is adapted using domain-specific lexicons (e.g., mapping "Regression" to "Valuation Assessment" in Finance contexts).

## 4. Resilience & Robustness
AnalytixAI implements a **Fail-Safe Response Layer** to ensure that messy or non-standard data does not crash the system.

### Global JSON Sanitization
The platform utilizes a recursive sanitization utility in the `ResponseSchema`. Before any data is sent to the frontend, it is processed to:
- **Replace NaN/Inf**: Floating point "Not a Number" or "Infinite" values (common in raw statistical results) are converted to `null`.
- **Ensure Compliance**: This prevents "Out of range float" errors which typically occur during JSON serialization in standard web frameworks.

## 5. Unified Communication Architecture
To support deployment across varying environments, the platform uses a **Centralized Base URL** strategy.

- **Component Level**: All streamlit pages import their communication methods from [api_client.py](file:///r:/2026/Project/AnalytixAI/streamlit_app/components/api_client.py).
- **Port Independence**: Changing the port in a single location instantly updates the connection across Ingestion, Inference, and the Decision Advisor.

## 6. Modeling & Persistence
Models are trained using a **Smart Strategy**:
- **Fast Mode**: Utilizes optimized HistGradientBoosting models for rapid iteration.
- **Deep Mode**: Full cross-validation and fallback ensembles.

Artifacts are persisted as high-performance `.pkl` files within the `storage/models/` directory, mapped via the Metadata ID.

---
*For API-specific details, refer to the [ARCHITECTURE.md](file:///r:/2026/Project/AnalytixAI/ARCHITECTURE.md).*
