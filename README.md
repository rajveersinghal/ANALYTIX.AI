# AnalytixAI 🚀

> **Empowering Business Intelligence through Automated Data Science.**

AnalytixAI is a state-of-the-art, production-ready Automated Machine Learning (AutoML) platform. It transforms raw, messy datasets into boardroom-ready intelligence reports through a sophisticated 11-step automated pipeline, featuring **Premium Design** and **Strategic Narrative Intelligence**.

---

## 🏛️ Domain-Specific Intelligence

Unlike generic AutoML tools, AnalytixAI understands the context of your data:
- **💼 Business & Operations**: Focuses on resource optimization and demand forecasting.
- **📈 Finance**: Specialized in risk assessment, fraud detection, and valuation.
- **🏠 Real Estate**: Advanced market segmentation and property valuation engines.
- **👥 Customer Analytics**: Churn prediction and behavioral segmentation.

---

## 🌟 Key Capabilities

### 1. High-Fidelity Data Guardianship
*   **Auto-Profiling**: 0-100 Quality Scoring with detailed metric extraction.
*   **Audit Trail**: Every cleaning action (imputation, outlier removal, encoding) is logged for full transparency.

### 2. Strategic Narrative Intelligence
*   **Executive Storyteller**: Rule-based engine that translates technical scores (RMSE, R2, SHAP) into human-readable strategic outlooks.
*   **What-If Simulator**: Interactive scenario planning to predict outcome shifts based on variable changes.

### 3. Advanced AI Engine
*   **Explainability (XAI)**: Integrated SHAP and Feature Importance to make model "Black Boxes" transparent.
*   **Multi-Task Support**: Integrated Forecasting, Clustering, and Anomaly Detection.

### 4. Modern Professional UI
*   **Aesthetic Dashboards**: A world-class "Deep Void" glassmorphic design built for executive visibility.
*   **Responsive Experience**: Fully optimized for data-heavy workflows with smooth transitions.

---

## 📐 System Architecture

```mermaid
graph TD
    Data[Raw CSV/Data] --> Ingest[Ingestion & Profiling]
    Ingest --> Clean[Automated Cleaning & Audit Log]
    Clean --> Insights[EDA & Statistical Validation]
    Insights --> Modeling[AutoML Engine]
    Modeling --> XAI[Explainability & SHAP]
    XAI --> Strategy[Decision Assistant & Narratives]
    Strategy --> Frontend[React Dashboard]
    
    subgraph "Backend (FastAPI)"
        Ingest
        Clean
        Modeling
        XAI
    end
    
    subgraph "Frontend (React)"
        Frontend
        Sim[What-If Simulator]
    end
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **Frontend** | React, Vite, TailwindCSS, Lucide-React |
| **Visuals** | Recharts, Plotly |
| **Intelligence** | Scikit-Learn, SHAP, Pandas, NumPy |
| **deployment** | Render, Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup
```bash
# Navigate to root
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Documentation
- [Project Architecture](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Project Roadmap](./docs/ROADMAP.md)
- [Final Project Report](./docs/FINAL_PROJECT_REPORT.md)

---
*Developed by **Rajveer Singhal** for the next generation of data-driven enterprises.*
