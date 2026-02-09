# AnalytixAI 🚀

> **Empowering Business Intelligence through Automated Data Science.**

AnalytixAI is a state-of-the-art, production-ready Automated Machine Learning (AutoML) platform. It transforms raw, messy datasets into boardroom-ready intelligence reports through a sophisticated 11-step automated pipeline.

---

## 🏛️ Domain-Specific Intelligence

Unlike generic AutoML tools, AnalytixAI understands the context of your data.
- **💼 Business & Operations**: Focuses on resource optimization and demand forecasting.
- **📈 Finance**: Specialized in risk assessment, fraud detection, and valuation.
- **🏠 Real Estate**: Advanced market segmentation and property valuation engines.
- **👥 Customer Analytics**: Churn prediction and behavioral segmentation.

---

## 🌟 Key Capabilities

### 1. High-Fidelity Data Guardianship
*   **Auto-Profiling**: 0-100 Quality Scoring with detailed metric extraction.
*   **Audit Trail**: Every cleaning action (imputation, outlier removal, encoding) is logged for full transparency.

### 2. Narrative Reporting (Boardroom Ready)
*   **Strategic Summaries**: Automatic generation of professional narratives.
*   **PDF Orchstration**: Beautifully formatted reports with quality tables and branding.

### 3. Advanced AI Engine
*   **Multi-Task Support**: Beyond Regression and Classification—integrated Forecasting, Clustering, and Anomaly Detection.
*   **Explainability (XAI)**: Integrated SHAP and Feature Importance to make model "Black Boxes" transparent.
*   **Decision Assistant**: "What-If" simulator for real-time strategic planning.

---

## 📐 System Architecture

```mermaid
graph TD
    Data[Raw CSV/Data] --> Ingest[Ingestion & Profiling]
    Ingest --> Clean[Automated Cleaning & Audit Log]
    Clean --> Insights[EDA & Statistical Validation]
    Insights --> Modeling[AutoML Engine]
    Modeling --> XAI[Explainability & SHAP]
    XAI --> Strategy[Decision Assistant]
    Strategy --> Export[Boardroom PDF Report]
    
    subgraph "Single Source of Truth"
        MM[Metadata Manager]
    end
    
    Ingest -.-> MM
    Clean -.-> MM
    Modeling -.-> MM
    Export -.-> MM
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python, FastAPI, Uvicorn |
| **Frontend** | Streamlit (Custom Glassmorphic Design) |
| **Intelligence** | Scikit-Learn, SHAP, Statsmodels, Pandas |
| **Reporting** | FPDF2 |
| **Persistence** | Metadata JSON (SSD-Optimized) |

---

## 🚀 Getting Started

### Installation
```bash
# Clone and install dependencies
git clone https://github.com/your-repo/AnalytixAI.git
pip install -r requirements.txt
```

### Running the Platform
1.  **Start Backend**: `uvicorn app.main:app --port 8000`
2.  **Start Frontend**: `streamlit run streamlit_app/Home.py`

---

## 📚 Technical Reference
- [Architecture Deep Dive](file:///r:/2026/Project/AnalytixAI/ARCHITECTURE.md)
- [API Reference](file:///r:/2026/Project/AnalytixAI/docs/API_REFERENCE.md)

---
*Developed by Rajveer Singhal for the next generation of data-driven enterprises.*
