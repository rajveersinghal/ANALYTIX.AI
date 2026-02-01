import streamlit as st
import pandas as pd
import traceback
from modules import data_loader, data_quality, cleaning, eda, features, modeling, insights, data_validator, metrics, utils
from modules.utils import Logger
from modules.prediction_interface import PredictionInterface
from modules.export_manager import ExportManager
from modules.sample_datasets import SampleDatasets
from src.core.intent_engine import IntentEngine
from src.intelligence.intent_recommender import IntentRecommender

# Intelligence Layer - Import early for sidebar usage
from intelligence import dashboard, experiment_tracker, explainability, alerts, recommendations, report_generator
from intelligence.insights_narrator import InsightsNarrator
from intelligence.whatif_analyzer import WhatIfAnalyzer
from intelligence.privacy_dashboard import PrivacyDashboard
from intelligence.feature_explorer import FeatureExplorer
from intelligence.benchmarking import Benchmarking
from intelligence.tutorial_system import TutorialSystem
from intelligence.progress_tracker import ProgressTracker, QuickStats


# Page Config
st.set_page_config(page_title="Data Science Automation (Robust)", layout="wide", page_icon="🚀")

# --- UI Styling ---
st.markdown("""
    <style>
    .stApp {
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        color: #f8fafc;
    }
    .stMetric {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .stButton>button {
        background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%);
        color: white;
        border: none;
        padding: 10px 24px;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
    }
    div[data-testid="stExpander"] {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.02);
        border-radius: 10px;
    }
    </style>
""", unsafe_allow_html=True)

# --- UI Sidebar ---
st.sidebar.title("🧠 ANALYTIX.AI v2.1")
st.sidebar.markdown("---")
st.sidebar.markdown("**Decision Intelligence System** (Premium Edition)")

# Sidebar Navigation
st.sidebar.title("Workflow Steps")
step = st.sidebar.radio("Go to Step:", [
    "1. Data Upload",
    "1.5 What Do You Want to Do?",
    "2. Quality Check", 
    "3. Data Cleaning", 
    "4. Exploratory Data Analysis (EDA)",
    "4.5 Feature Explorer 🆕",
    "5. Feature Engineering", 
    "6. Model Training",
    "7. Insights",
    "8. Real-Time Predictions 🆕",
    "9. What-If Analysis 🆕",
    "10. Export Hub 🆕"
])

# Display Decision Log in Sidebar
st.sidebar.markdown("---")
st.sidebar.subheader("📝 Decision Log")
with st.sidebar.expander("View Log", expanded=False):
    logs = Logger.get_logs()
    if logs:
        for log in logs:
            st.markdown(f"- {log}")
    else:
        st.write("No actions taken yet.")

# 🆕 Sample Datasets
SampleDatasets.render_dataset_selector()

# 🆕 Guided Tutorials
TutorialSystem.render_tutorial_selector()

# 🆕 Progress Tracker
ProgressTracker.render_progress_tracker()

# 🆕 Quick Stats
QuickStats.render_quick_stats()

if st.sidebar.button("🗑️ Reset Application", help="Clears all data and models to start fresh."):
    for key in list(st.session_state.keys()):
        del st.session_state[key]
    st.rerun()


# Initialize Session State
if 'df' not in st.session_state:
    st.session_state.df = None
if 'df_cleaned' not in st.session_state:
    st.session_state.df_cleaned = None
if 'df_final' not in st.session_state:
    st.session_state.df_final = None
if 'model_results' not in st.session_state:
    st.session_state.model_results = None
if 'selected_intent' not in st.session_state:
    st.session_state.selected_intent = None
if 'intent_details' not in st.session_state:
    st.session_state.intent_details = None

# Set Seed for Reproducibility
utils.set_seed()

# --- Header ---
st.title("🧠 ANALYTIX.AI v2.0: Decision Intelligence System")
st.markdown("### From Raw Data to Business Decisions — Monitored, Explainable, & Robust.")

# 🆕 First-time welcome
TutorialSystem.show_first_time_welcome()

# 🆕 Render active tutorial if any
TutorialSystem.render_active_tutorial()

# Layout: Tabs for Production feel
tab_run, tab_lab, tab_monitor, tab_privacy = st.tabs(["🚀 Analytical Engine", "🧪 Intelligence Hub", "📈 Production Monitor", "🔐 Privacy & Security"])


with tab_run:
    # --- Analytical Engine (Core) ---
    st.markdown("### Active Workbench")
    
    # --- Step 1: Data Upload ---
    if step == "1. Data Upload":
        st.header("📂 Data Ingestion")
        
        # 🆕 Contextual Help
        TutorialSystem.render_contextual_help(step)
        
        uploaded_file = st.file_uploader("Upload CSV or Excel file", type=['csv', 'xlsx'])
        
        if uploaded_file:
            try:
                df = data_loader.load_data(uploaded_file)
                if df is not None:
                    # 1. Universal Type Conversion
                    df = data_loader.clean_and_convert_types(df)
                    
                    # 2. Suitability Check
                    data_validator.check_dataset_suitability(df)
                    
                    # 3. Fingerprint
                    fp = utils.get_dataset_fingerprint(df)
                    st.info(f"Dataset Fingerprint: Rows: {fp['Rows']}, Cols: {fp['Columns']}, Missing: {fp['Missing']}")
                    st.caption(f"Signature: {fp['Signature']}")
                    
                    st.session_state.df = df
                    st.success("✅ File uploaded and initial validation passed!")
                    data_loader.display_basic_info(df)
                    st.dataframe(df.head())
                    
                    # Show next step prompt
                    st.info("👉 **Next Step**: Go to '1.5 What Do You Want to Do?' to select your goal")
            except Exception as e:
                st.error(f"Critical error during loading: {e}")
                st.code(traceback.format_exc())
    
    # --- Step 1.5: Intent Selection (NEW - SaaS Style) ---
    elif step == "1.5 What Do You Want to Do?":
        st.header("🎯 What Do You Want to Do?")
        st.markdown("### Tell us your goal, and we'll guide you to the right solution")
        
        # 🆕 Contextual Help
        TutorialSystem.render_contextual_help(step)
        
        if st.session_state.df is not None:
            df = st.session_state.df
            
            # Get AI recommendations
            with st.spinner("🧠 Analyzing your data..."):
                recommendations = IntentRecommender.recommend_intents(df)
            
            # Display recommendations
            st.markdown("---")
            st.subheader("💡 Recommended for Your Data")
            
            cols = st.columns(3)
            for idx, rec in enumerate(recommendations):
                intent_info = IntentEngine.INTENTS[rec["intent"]]
                with cols[idx]:
                    confidence_color = "🟢" if rec["confidence"] > 80 else "🟡" if rec["confidence"] > 60 else "🟠"
                    st.markdown(f"{confidence_color} **{rec['confidence']:.0f}% Match**")
                    st.caption(f"*{rec['reason']}*")
            
            st.markdown("---")
            
            # Intent Selection Grid
            st.subheader("📋 Choose Your Goal")
            
            # Create 2x4 grid of intent cards
            intent_keys = list(IntentEngine.INTENTS.keys())
            
            for row in range(0, len(intent_keys), 4):
                cols = st.columns(4)
                for col_idx, intent_key in enumerate(intent_keys[row:row+4]):
                    intent = IntentEngine.INTENTS[intent_key]
                    with cols[col_idx]:
                        # Create card-like button
                        button_label = f"{intent['icon']}\n\n**{intent['name'].split(' ', 1)[1] if ' ' in intent['name'] else intent['name']}**"
                        if st.button(
                            button_label,
                            key=f"intent_{intent_key}",
                            help=intent['description'],
                            width="stretch"
                        ):
                            st.session_state.selected_intent = intent_key
                            st.rerun()
            
            # Show selected intent details
            if st.session_state.selected_intent:
                st.markdown("---")
                selected_key = st.session_state.selected_intent
                intent = IntentEngine.INTENTS[selected_key]
                
                st.success(f"✅ Selected: **{intent['name']}**")
                
                # Create detailed view
                col1, col2 = st.columns([2, 1])
                
                with col1:
                    st.markdown(f"### {intent['icon']} {intent['name']}")
                    st.markdown(intent['description'])
                    st.markdown(f"**Business Value:** {intent['business_value']}")
                    st.markdown(f"**Example Use Cases:** {intent['example']}")
                    
                    # Target column selection if needed
                    target_col = None
                    if intent['requires_target']:
                        st.markdown("---")
                        target_col = st.selectbox(
                            "Select Target Column (what you want to predict/analyze)",
                            df.columns,
                            help="This is the outcome variable you want to predict or understand"
                        )
                    
                    # Validate intent
                    if st.button("🚀 Start This Workflow", type="primary", width="stretch"):
                        with st.spinner("Validating requirements..."):
                            intent_result = IntentEngine.detect_user_intent(selected_key, df, target_col)
                            
                            if intent_result['valid']:
                                st.session_state.intent_details = intent_result
                                st.session_state.target_col = target_col
                                st.success("✅ All requirements met! Proceeding to workflow...")
                                
                                # Show pipeline
                                st.markdown("### 📋 Your Personalized Pipeline")
                                for step_info in intent_result['pipeline']:
                                    st.markdown(f"✓ **{step_info['name']}** - {step_info['description']}")
                                
                                st.info(f"⏱️ Estimated time: {intent_result['estimated_time']}")
                                st.balloons()
                            else:
                                st.error("❌ Requirements not met")
                                for error in intent_result['validation']['errors']:
                                    st.error(error)
                
                with col2:
                    st.markdown("### 📊 Requirements")
                    validation = IntentEngine.validate_intent_requirements(intent, df, None)
                    
                    # Show requirements checklist
                    st.markdown(f"**Minimum Rows:** {intent['min_rows']}")
                    if len(df) >= intent['min_rows']:
                        st.success(f"✅ You have {len(df)} rows")
                    else:
                        st.error(f"❌ You have {len(df)} rows")
                    
                    st.markdown(f"**Minimum Columns:** {intent['min_cols']}")
                    if len(df.columns) >= intent['min_cols']:
                        st.success(f"✅ You have {len(df.columns)} columns")
                    else:
                        st.error(f"❌ You have {len(df.columns)} columns")
                    
                    if intent['requires_target']:
                        st.markdown("**Target Column:** Required")
                    
                    # Show confidence score
                    st.markdown("---")
                    st.markdown("### 🎯 Success Confidence")
                    confidence = IntentEngine._calculate_intent_confidence(intent, df, None)
                    st.progress(confidence / 100)
                    st.caption(f"{confidence:.0f}% - Based on data quality and size")
                    
                    # Show smart suggestions
                    suggestions = IntentRecommender.get_smart_suggestions(df, selected_key)
                    if suggestions:
                        st.markdown("---")
                        st.markdown("### 💡 Smart Tips")
                        for suggestion in suggestions:
                            st.info(suggestion)
        
        else:
            st.warning("⚠️ Please upload a dataset first (Step 1)")
            st.info("👈 Go to 'Data Upload' in the sidebar to get started")

    # --- Step 2: Quality Check ---
    elif step == "2. Quality Check":
        st.header("🧐 Dataset Readiness Score")
        st.info("👶 **ELI5**: Think of this as a 'Health Check' for your data. We check if your data is missing too many pieces or if it's too small to learn from.")
        if st.session_state.df is not None:
            try:
                score, explanation = data_quality.calculate_readiness_score(st.session_state.df)
                st.metric("Readiness Score", f"{score}/100")
                st.markdown(explanation)
            except Exception as e:
                st.error(f"Error checking quality: {e}")
        else:
            st.warning("Please upload a dataset first.")

    # --- Step 3: Data Cleaning ---
    elif step == "3. Data Cleaning":
        st.header("🧹 Data Cleaning")
        st.info("👶 **ELI5**: Real-world data is messy. We fix 'skewness' (when data is one-sided like a tilted bridge) and fill in missing gaps so the machine can read it easily.")
        if st.session_state.df is not None:
            if st.button("Auto-Clean Dataset"):
                try:
                    with st.spinner("Cleaning and fixing skewness..."):
                        df_clean = cleaning.clean_data(st.session_state.df)
                        df_clean = cleaning.handle_skewness(df_clean)
                        st.session_state.df_cleaned = df_clean
                        st.success("Data Cleaning Complete!")
                        st.dataframe(df_clean.head())
                except Exception as e:
                    st.error(f"Error during cleaning: {e}")
        else:
            st.warning("Please upload a dataset first.")

    # --- Step 4: EDA ---
    elif step == "4. Exploratory Data Analysis (EDA)":
        st.header("📊 Exploratory Data Analysis")
        df_eda = st.session_state.df_cleaned if st.session_state.df_cleaned is not None else st.session_state.df
        
        if df_eda is not None:
            try:
                eda.plot_distributions(df_eda)
                eda.plot_heatmap(df_eda)
                target_col = st.selectbox("Select Target Variable for Analysis", df_eda.columns)
                if target_col:
                    eda.plot_target_analysis(df_eda, target_col)
            except Exception as e:
                st.error(f"Error during EDA: {e}")
        else:
            st.warning("Please upload (and optionally clean) a dataset first.")

    # --- Step 5: Feature Engineering ---
    elif step == "5. Feature Engineering":
        st.header("⚙️ Feature Engineering")
        df_feat = st.session_state.df_cleaned if st.session_state.df_cleaned is not None else st.session_state.df
        
        if df_feat is not None:
            st.write("Applying robust feature engineering with guardrails.")
            target_col = st.selectbox("Select Target Variable (to exclude)", df_feat.columns)
            
            optimize_acc = st.checkbox("🔥 **Accuracy Optimization Mode (RFE)**", help="Uses Recursive Feature Elimination to pick the absolute best features. Warning: Takes longer for large datasets.")
            
            if st.button("Apply Feature Engineering"):
                try:
                    with st.spinner("Applying guardrails, encoding, and scaling..."):
                        # 1. Guardrails
                        df_final = features.robust_feature_selection(df_feat)
                        
                        # 2. Engineering (with Accuracy Optimization option)
                        temp_problem_type = modeling.detect_problem_type(df_final, target_col)
                        df_final = features.engineer_features(df_final, target_col, temp_problem_type, optimize_accuracy=optimize_acc)
                        
                        st.session_state.df_final = df_final
                        st.success("Feature Engineering Applied!")
                        st.dataframe(df_final.head())
                except Exception as e:
                    st.error(f"Error during feature engineering: {e}")
                    st.code(traceback.format_exc())
        else:
            st.warning("Please upload (and optionally clean) a dataset first.")

    # --- Step 6: Model Training ---
    elif step == "6. Model Training":
        st.header("🤖 Robust Model Training")
        df_model = st.session_state.df_final
        
        if df_model is not None:
            potential_targets = [c for c in df_model.columns]
            target_col = st.selectbox("Confirm Target Variable", potential_targets)
            
            st.markdown("""
            > **Modeling Assumptions:**
            > - Rows are independent and identically distributed.
            > - Missing values were Missing At Random (MAR).
            """)
            
            if st.button("Train Models"):
                try:
                    problem_type = modeling.detect_problem_type(df_model, target_col)
                    if data_validator.validate_target(df_model, target_col, problem_type):
                        with st.spinner("Training models with hyperparameter tuning..."):
                            results, models, feature_names, X_test, y_test = modeling.train_and_evaluate(
                                df_model, target_col, problem_type
                            )
                            
                            st.session_state.model_results = {
                                "results": results,
                                "models": models,
                                "feature_names": feature_names,
                                "problem_type": problem_type,
                                "X_test": X_test,
                                "y_test": y_test
                            }
                            
                            st.subheader("Model Performance")
                            st.json(results)
                            
                            # --- ELI5: Negative Score Explanation (v2.3) ---
                            if problem_type == "Regression":
                                baseline_r2 = results.get("Baseline (Mean)", {}).get("R2", 0)
                                if baseline_r2 < 0:
                                    st.warning("🧐 **Why is the Baseline score negative?**\n\n"
                                               "👶 **ELI5:** Imagine you're guessing the price of houses. The 'Baseline' is like someone who always guesses the same average price for every house. "
                                               "Sometimes, this guess is so 'lazy' that its score becomes negative. **Don't worry!** This is actually a good sign—it shows your real models (Gradient Boosting) are working much harder than a random guesser!")

                            # Best Model Logic
                            valid_models = [m for m in results if "Baseline" not in m]
                            if problem_type == "Regression":
                                best_model = min(valid_models, key=lambda k: results[k]['RMSE'])
                                best_score = results[best_model]["RMSE"]
                                r2_score_val = results[best_model].get("R2", 0)
                                st.success(f"🏆 Best Model: **{best_model}**")
                                st.metric("Average Error (RMSE)", f"{best_score:.4f}", help="Lower is better. This is how far off your predictions are on average.")
                                st.metric("Prediction Grade (R²)", f"{r2_score_val:.2%}", help="Higher is better. 100% means perfect predictions.")
                            else:
                                metric = "F1 Score" if "F1 Score" in results["Baseline (Mode)"] else "Accuracy"
                                best_model = max(valid_models, key=lambda k: results[k][metric])
                                best_score = results[best_model][metric]
                                st.success(f"🏆 Best Model: **{best_model}**")
                                st.metric(f"Success Rate ({metric})", f"{best_score:.2%}", help="Higher is better. This is how often the model is correct.")

                            # --- Phase 2: Experiment Logging ---
                            try:
                                # Update last results for diagnostics v4.0
                                st.session_state.last_model_results = {
                                    "results": results,
                                    "models": models,
                                    "feature_names": feature_names,
                                    "X_test": X_test,
                                    "y_true": y_test
                                }
                                
                                best_model_name = [m for m in results if "Baseline" not in m][0]
                                best_metrics = results[best_model_name]
                                best_model_obj = models.get(best_model_name.replace(" (Optimized)", "")) or models.get("Gradient Boosting") # Renamed to avoid conflict with best_model string
                                
                                exp_id = experiment_tracker.log_experiment(
                                    model_name=best_model_name, # Use best_model_name string
                                    params={}, # Phase 1 uses defaults
                                    metrics=best_metrics, # Use best_metrics
                                    features=feature_names,
                                    dataset_shape=df_model.shape,
                                    tags="Auto-Run"
                                )
                                st.toast(f"✅ Experiment Logged! ID: {exp_id}", icon="📝")
                            except Exception as log_err:
                                st.warning(f"Logging failed: {log_err}")

                            # --- Download Section ---
                            st.markdown("---")
                            st.subheader("💾 Download Assets")
                            import pickle
                            # Strip "(Optimized)" suffix if present since models dict doesn't have it
                            model_key = best_model.replace(" (Optimized)", "")
                            best_model_obj = models[model_key]
                            model_pkl = pickle.dumps(best_model_obj)
                            col1, col2 = st.columns(2)
                            with col1:
                                st.download_button("⬇️ Download Best Model", model_pkl, "best_model.pkl")
                            with col2:
                                csv = df_model.to_csv(index=False).encode('utf-8')
                                st.download_button("⬇️ Download Data", csv, "processed_data.csv")
                                
                except Exception as e:
                    st.error(f"Error training models: {e}")
                    st.code(traceback.format_exc())
        else:
            st.warning("Please complete Feature Engineering first.")

    # --- Step 7: Insights (Enhanced) ---
    elif step == "7. Insights":
        st.header("💡 Insights & Intelligence")
        
        if st.session_state.model_results:
            try:
                results = st.session_state.model_results
                
                # 1. Feature Importance (Phase 1)
                top_feature = insights.generate_insights(
                    results["models"], 
                    results["feature_names"], 
                    results["problem_type"],
                    results.get("X_test"),
                    results.get("y_test")
                )
                
                # 2. Phase 2: SHAP Explainability (New)
                st.subheader("🔮 Responsible AI (SHAP)")
                if st.checkbox("Show Advanced Explanations"):
                    best_model_name = [m for m in results["models"] if "Gradient" in m or "Random" in m][0] # Pick tree model
                    model = results["models"][best_model_name]
                    if results.get("X_test") is not None:
                        explainability.explain_model_global(model, results["X_test"])
                
                # 3. Recommendations & Alerts
                st.markdown("---")
                recs = recommendations.generate_business_recommendations([top_feature] if top_feature else [])
                cols = st.columns(2)
                with cols[0]:
                    st.subheader("📢 Business Actions")
                    for r in recs: st.info(r)
                
                with cols[1]:
                    # Report Generation (v2.2 Universal Reporter)
                    st.subheader("📄 Reporting")
                    st.write("Generate a professional-grade strategic report.")
                    if st.button("Generate Intelligence Report"):
                        with st.spinner("Analyzing data shape and generating strategy..."):
                            # 1. Collect Deep Stats
                            stats = report_generator.collect_deep_stats(st.session_state.df)
                            
                            # 2. Get Quality Breakdown
                            q_score, q_exp = data_quality.calculate_readiness_score(st.session_state.df)
                            
                            # 3. Best model metrics
                            best_model_name = [m for m in results["results"] if "Baseline" not in m][0]
                            best_metrics = results["results"][best_model_name]
                            
                            # 4. Drifts & Alerts (Simulated/Placeholder for report)
                            report_alerts = [] # Can pull from alerts.py
                            
                            html = report_generator.generate_html_report(
                                "Active Dataset", 
                                stats, 
                                best_metrics, 
                                report_alerts, 
                                recs,
                                q_score,
                                q_exp
                            )
                            st.markdown(report_generator.get_download_link(html), unsafe_allow_html=True)
                            st.success("Report Ready! Click above to download.")                
            except Exception as e:
                st.error(f"Error generating insights: {e}")
                st.code(traceback.format_exc())
        else:
            st.warning("Please train models first to see insights.")
        
        # 🆕 AI-Powered Insights Narrator
        if st.session_state.model_results:
            try:
                results = st.session_state.model_results
                InsightsNarrator.render_narrative_insights(
                    results["problem_type"],
                    results["results"],
                    st.session_state.df.shape if st.session_state.df is not None else (0, 0),
                    results["feature_names"],
                    top_features=results["feature_names"][:5] if len(results["feature_names"]) > 0 else None
                )
                
                # 🆕 Benchmark Comparison
                st.markdown("---")
                best_model = [m for m in results["results"] if "Baseline" not in m][0]
                best_metrics = results["results"][best_model]
                
                if results["problem_type"] == "Classification":
                    score = best_metrics.get("Accuracy", 0)
                    Benchmarking.render_benchmark_comparison(
                        "Classification", score, "Accuracy", "General"
                    )
                else:
                    score = best_metrics.get("R2", 0)
                    Benchmarking.render_benchmark_comparison(
                        "Regression", score, "R²", "General"
                    )
            except Exception as e:
                st.warning(f"Could not generate AI insights: {e}")

    # 🆕 Step 4.5: Feature Explorer
    elif step == "4.5 Feature Explorer 🆕":
        st.header("🔍 Interactive Feature Explorer")
        df_explore = st.session_state.df_cleaned if st.session_state.df_cleaned is not None else st.session_state.df
        
        if df_explore is not None:
            target_col = st.selectbox(
                "Select Target Column (optional, for correlation analysis):",
                ["None"] + df_explore.columns.tolist()
            )
            target_col = None if target_col == "None" else target_col
            
            FeatureExplorer.render_feature_explorer(df_explore, target_col)
        else:
            st.warning("Please upload a dataset first.")

    # 🆕 Step 8: Real-Time Predictions
    elif step == "8. Real-Time Predictions 🆕":
        if st.session_state.model_results:
            results = st.session_state.model_results
            models = results["models"]
            
            # Get best model
            if results["problem_type"] == "Classification":
                best_model_name = max(
                    [m for m in results["results"] if "Baseline" not in m],
                    key=lambda k: results["results"][k].get("Accuracy", 0)
                )
            else:
                best_model_name = max(
                    [m for m in results["results"] if "Baseline" not in m],
                    key=lambda k: results["results"][k].get("R2", 0)
                )
            
            # Get model object (strip "(Optimized)" suffix)
            model_key = best_model_name.replace(" (Optimized)", "")
            best_model = models.get(model_key)
            
            if best_model:
                df_sample = st.session_state.df_final if st.session_state.df_final is not None else st.session_state.df
                
                PredictionInterface.render_prediction_interface(
                    best_model,
                    results["feature_names"],
                    results["problem_type"],
                    df_sample,
                    target_name="Target"
                )
            else:
                st.error("Could not load best model")
        else:
            st.warning("⚠️ Please train models first (Step 6) before making predictions.")
            st.info("👈 Go to 'Model Training' in the sidebar")

    # 🆕 Step 9: What-If Analysis
    elif step == "9. What-If Analysis 🆕":
        if st.session_state.model_results:
            results = st.session_state.model_results
            models = results["models"]
            
            # Get best model
            if results["problem_type"] == "Classification":
                best_model_name = max(
                    [m for m in results["results"] if "Baseline" not in m],
                    key=lambda k: results["results"][k].get("Accuracy", 0)
                )
            else:
                best_model_name = max(
                    [m for m in results["results"] if "Baseline" not in m],
                    key=lambda k: results["results"][k].get("R2", 0)
                )
            
            # Get model object
            model_key = best_model_name.replace(" (Optimized)", "")
            best_model = models.get(model_key)
            
            if best_model:
                df_sample = st.session_state.df_final if st.session_state.df_final is not None else st.session_state.df
                
                WhatIfAnalyzer.render_whatif_analysis(
                    best_model,
                    results["feature_names"],
                    results["problem_type"],
                    df_sample,
                    target_name="Target"
                )
            else:
                st.error("Could not load best model")
        else:
            st.warning("⚠️ Please train models first (Step 6) before using What-If Analysis.")
            st.info("👈 Go to 'Model Training' in the sidebar")

    # 🆕 Step 10: Export Hub
    elif step == "10. Export Hub 🆕":
        ExportManager.render_export_hub()

with tab_lab:
    # Phase 2 Dashboard
    if st.session_state.df_final is not None:
        dashboard.render_dashboard(st.session_state.df_final)
    else:
        dashboard.render_dashboard(None) # Load history only

with tab_monitor:
    from intelligence import monitoring
    # Load history
    history = experiment_tracker.get_experiments()
    monitoring.render_monitoring_dashboard(history)

with tab_privacy:
    PrivacyDashboard.render_privacy_dashboard()


# Footer
st.markdown("---")
st.markdown("Developed with ❤️ by **ANALYTIX.AI** Team (Decision Intelligence System)")
