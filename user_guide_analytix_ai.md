# AnalytixAI: End-to-End User Intelligence Guide

Welcome to **AnalytixAI**, the professional-grade autonomous data science platform. This guide provides a detailed walkthrough of how to transform raw data into executable business intelligence.

---

## 1. Entering the Void (Onboarding)
- **Account Setup**: Navigate to `/signup` to create your neural identity. Once registered, log in to enter the **Deep Void** portal.
- **Project Creation**: In the **Projects** view, click "Create New Workspace". Give your project a name (e.g., *Q3 Sales Growth*) and description. This acts as a container for all your datasets and models.

## 2. The Intelligence Pipeline (Injection)
Once inside a project, navigate to the **Pipeline** section. This is where the synthesis begins.

### Step-by-Step Upload Flow:
1. **Choose Your Task**:
   - **General AutoML**: Best for standard prediction tasks like "House Price Prediction" or "Customer Churn".
   - **Sales Intelligence**: Specialized for transactional data. It generates extra business KPIs and forecasting models.
2. **Inject Dataset**: Drag and drop your `.csv` or `.xlsx` file.
3. **Initialize Pipeline**: Click "Initialize Intelligence Pipeline".

### Understanding the 11-Step Neural Process:
The system will now autonomously execute 11 phases:
- **Phase 1-3 (Data Health)**: Loading, Profiling, and Cleaning. The system auto-detects column types and removes outliers.
- **Phase 4-5 (Feature Forge)**: Generates statistical maps and engineers new interaction features.
- **Phase 6-8 (Modeling)**: Detects if the problem is Regression/Classification, trains 4+ candidate models (XGBoost, Random Forest, etc.), and runs Bayesian Hyper-Tuning.
- **Phase 9 (Explainer)**: Calculates **SHAP values**—mathematical proofs of which variables (e.g., *Price*, *Season*) are actually driving the output.
- **Phase 10-11 (Assembly)**: Validates results and compiles your PDF/Digital reports.

---

## 3. Interpreting the Outputs

### A. The Analytics Dashboard (General AutoML)
- **Accuracy / F1-Score**: Located in the top cards. It tells you how "sure" the AI is about its predictions. (e.g., *94% Accuracy*).
- **Champion Model**: The "Leaderboard" shows you which algorithm won the training race.
- **Feature Importance (SHAP)**: A bar chart showing the "Impact" of each column. 
  - *Example*: If 'Location' has the longest bar, it is the primary driver of your target.

### B. Sales Intelligence Dashboard (Strategic View)
- **Top KPIs**: 
  - **Total Revenue**: Cumulative value of all transactions.
  - **MoM Momentum**: Month-over-Month percentage change.
- **Strategic Playbook**: A Gemini-powered narrative that explains *why* your sales are behaving this way and what moves to make next.
- **Forecasting Tab**: Use the period buttons (3, 6, 12 months) to see a neural projection of future revenue with confidence intervals.

---

## 4. Interactive Exploration

### The What-If Simulator (Live Engine)
Located in the **Explainability** section of the dashboard.
- **Sliders**: Adjust numerical variables (e.g., *Increase Discount to 20%*).
- **Live Output**: Watch the "Current Prediction" card update instantly. This allows you to test business theories before acting on them.

### Contextual AI Chat (Neural Assistant)
Click the floating chat icon anywhere in the dashboard.
- **Behavior**: The AI knows which session you are looking at. 
- **Sample Queries**: 
  - *"Why did sales drop in February?"*
  - *"What are my top 3 most profitable categories?"*
  - *"Explain the model's accuracy in simple terms."*

---

## 5. Exports & Archive
- **Download Report**: Click the "Export PDF" button to get an executive summary of the entire run.
- **History View**: Your **Archive** stores every previous run. You can go back months later to compare how your models have improved over time.

---

> [!TIP]
> **Pro Insight**: For the best results, ensure your dataset has at least 100 rows. Feature importance (SHAP) becomes exponentially more accurate as you provide more history.
