import streamlit as st
from intelligence import monitoring, experiment_tracker, drift_detection
import plotly.express as px
import pandas as pd

def render_dashboard(df_current=None):
    """
    Main Phase 2 Interactive Dashboard.
    """
    # Load History
    history_df = experiment_tracker.get_experiments()

    # --- KPI Cards ---
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Experiments", len(history_df))
    with col2:
        if not history_df.empty and "Accuracy" in history_df.columns:
            best_acc = history_df["Accuracy"].max()
            st.metric("Best Accuracy", f"{best_acc:.2f}")
        else:
             st.metric("Best Accuracy", "N/A")
    with col3:
        if df_current is not None:
             st.metric("Active Dataset Rows", len(df_current))
    with col4:
         status = "Create Baseline" if history_df.empty else "Active"
         st.metric("System Status", status)
         
    # --- Experiment Labs ---
    st.markdown("---")
    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "🧪 Experiment Comparator", 
        "📉 Drift Analysis", 
        "🔬 Diagnostic Audit",
        "📊 Advanced Visualizations",
        "🧪 A/B Testing"
    ])
    
    with tab1:
        st.subheader("Experiment Comparison")
        if not history_df.empty:
            # Filters
            models = st.multiselect("Filter by Model", history_df["Model"].unique(), default=history_df["Model"].unique())
            filtered_df = history_df[history_df["Model"].isin(models)]
            
            st.dataframe(filtered_df)
            
            # Comparison Chart
            if "Accuracy" in filtered_df.columns:
                fig = px.bar(filtered_df, x="Timestamp", y="Accuracy", color="Model", title="Model Performance History")
                st.plotly_chart(fig, use_container_width=True)
            elif "F1 Score" in filtered_df.columns:
                 fig = px.bar(filtered_df, x="Timestamp", y="F1 Score", color="Model", title="F1 History")
                 st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Run the pipeline to log your first experiment!")

    with tab2:
        st.subheader("📉 Data & Target Drift Monitor")
        st.markdown("**Compare your Training Data (Active) vs. New Production Data.**")
        
        prod_file = st.file_uploader("Upload Production Data (CSV) for Drift Check", type=["csv"])
        
        if prod_file:
            try:
                df_prod = pd.read_csv(prod_file)
                st.success(f"Loaded Production Data: {df_prod.shape}")
                
                if df_current is not None:
                    # Run Drift Logic
                    with st.spinner("Calculating Multi-Layer Drift..."):
                        drift_report = drift_detection.detect_drift(df_current, df_prod)
                        
                    st.write("#### 📊 Feature Drift Analysis")
                    st.dataframe(drift_report.style.applymap(lambda v: "color: red" if "DRIFT" in str(v) else ("color: orange" if "Slight" in str(v) else "color: green"), subset=["Status"]))
                    
                    # Target Drift (v4.0)
                    # We assume the same target column name exists in production data for audit
                    target_col = st.selectbox("Confirm Target Column in Production Data", df_prod.columns)
                    if target_col in df_current.columns:
                        problem_type = "Classification" if df_current[target_col].dtype == 'object' or df_current[target_col].nunique() < 20 else "Regression"
                        t_drift = drift_detection.detect_target_drift(df_current[target_col], df_prod[target_col], problem_type)
                        
                        st.write("#### 🎯 Target Drift Analysis")
                        st.metric("Target Status", t_drift["Status"], delta=t_drift["Details"], delta_color="inverse")
                    
                    # Show Drifted Columns
                    drifted = drift_report[drift_report["Status"].str.contains("DRIFT")]
                    if not drifted.empty or "SHIFT" in t_drift["Status"]:
                        st.error(f"🚨 ALERT: Critical shifts detected! Retraining recommended.")
                    else:
                        st.success("✅ No critical drift detected. Model environment is safe.")
                else:
                    st.warning("Please load Training Data in 'Run Pipeline' tab first to establish a baseline.")
            except Exception as e:
                st.error(f"Error loading production data: {e}")
        else:
            st.info("Upload a new dataset to check if it has 'drifted' away from your original training data.")

    with tab3:
        # --- Diagnostic Lab (v4.0) ---
        from intelligence import diagnostics
        st.subheader("🔬 Deep Model Diagnostics")
        st.info("👶 **ELI5**: We don't just look at if the robot is right—we look at *where* it is failing. Does it struggle with old people? Does it fail in specific cities? We find the blind spots.")
        
        if 'last_model_results' in st.session_state and st.session_state.last_model_results is not None:
            res = st.session_state.last_model_results
            models = res["models"]
            feature_names = res["feature_names"]
            X_test = res["X_test"]
            y_test = res["y_true"]
            problem_type = "Classification" if len(set(y_test)) < 20 else "Regression"
            
            selected_model_name = st.selectbox("Choose Model for Audit", list(models.keys()))
            audit_model = models[selected_model_name]
            
            # 1. Error Analysis
            with st.expander("🔍 Error Pattern Analysis", expanded=True):
                err_df = diagnostics.analyze_errors(audit_model, X_test, y_test, problem_type)
                patterns = diagnostics.get_top_error_segments(err_df, problem_type)
                
                for p in patterns: st.write(p)
                st.write("**Top Samples with Problems:**")
                st.dataframe(err_df.head(10))
            
            # 2. Segment Performance
            with st.expander("📊 Sliced Performance (Segment Analysis)"):
                slice_col = st.selectbox("Select Slice Dimension (e.g., Demographics)", X_test.columns)
                slice_report = diagnostics.evaluate_by_segment(X_test, y_test, audit_model.predict(X_test), slice_col, problem_type)
                st.write(f"Metrics per segment of **{slice_col}**:")
                st.dataframe(slice_report)
                
                # Plotting Slices
                metric_to_plot = "Accuracy" if problem_type == "Classification" else "RMSE"
                fig = px.bar(slice_report, x="Segment", y=metric_to_plot, color="Sample Size", title=f"{metric_to_plot} by {slice_col}")
                st.plotly_chart(fig, use_container_width=True)
                
        else:
            st.warning("Train a model in the 'Analytical Engine' first to run diagnostics.")
    
    with tab4:
        # --- Advanced Visualizations (Phase 6) ---
        from intelligence import advanced_viz
        st.subheader("📊 Advanced Model Visualizations")
        st.info("Deep dive into model behavior with Partial Dependence Plots, Learning Curves, and Residual Analysis.")
        
        if 'last_model_results' in st.session_state and st.session_state.last_model_results is not None:
            res = st.session_state.last_model_results
            models = res["models"]
            X_test = res["X_test"]
            y_test = res["y_true"]
            problem_type = "Classification" if len(set(y_test)) < 20 else "Regression"
            
            selected_model = st.selectbox("Select Model for Visualization", list(models.keys()), key="viz_model")
            viz_model = models[selected_model]
            
            viz_type = st.radio("Visualization Type", [
                "Partial Dependence Plots",
                "Learning Curves",
                "Residual Analysis (Regression Only)"
            ])
            
            if viz_type == "Partial Dependence Plots":
                st.write("**How each feature individually affects predictions:**")
                features_to_plot = st.multiselect("Select Features (max 4)", X_test.columns.tolist(), default=X_test.columns[:4].tolist())
                if st.button("Generate PDP"):
                    advanced_viz.plot_partial_dependence(viz_model, X_test, features_to_plot, problem_type)
            
            elif viz_type == "Learning Curves":
                st.write("**Model performance vs training set size:**")
                if st.button("Generate Learning Curve"):
                    from sklearn.base import clone
                    model_clone = clone(viz_model)
                    advanced_viz.plot_learning_curve(model_clone, X_test, y_test)
            
            elif viz_type == "Residual Analysis (Regression Only)":
                if problem_type == "Regression":
                    st.write("**Residual distribution and patterns:**")
                    y_pred = viz_model.predict(X_test)
                    advanced_viz.plot_residuals(y_test, y_pred)
                else:
                    st.warning("Residual analysis is only available for regression models.")
        else:
            st.warning("Train a model first to access visualizations.")
    
    with tab5:
        # --- A/B Testing Calculator (Phase 6) ---
        from intelligence import ab_testing
        st.subheader("🧪 A/B Test Statistical Calculator")
        st.info("Calculate statistical significance, sample sizes, and confidence intervals for A/B tests.")
        
        test_mode = st.radio("Select Mode", ["Significance Testing", "Sample Size Calculator"])
        
        if test_mode == "Significance Testing":
            st.write("### Test Significance Between Two Groups")
            
            col1, col2 = st.columns(2)
            with col1:
                st.write("**Control Group (A)**")
                control_input = st.text_area("Enter values (comma-separated)", "10,12,11,13,10,12", key="control")
                control_data = pd.Series([float(x.strip()) for x in control_input.split(",")])
            
            with col2:
                st.write("**Treatment Group (B)**")
                treatment_input = st.text_area("Enter values (comma-separated)", "15,16,14,17,15,16", key="treatment")
                treatment_data = pd.Series([float(x.strip()) for x in treatment_input.split(",")])
            
            metric_type = st.selectbox("Metric Type", ["continuous", "binary"])
            
            if st.button("Calculate Significance"):
                results = ab_testing.calculate_significance(control_data, treatment_data, metric_type)
                
                st.write("### Results")
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.metric("P-Value", f"{results['p_value']:.4f}")
                with col2:
                    st.metric("Significant?", "✅ YES" if results['significant'] else "❌ NO")
                with col3:
                    st.metric("Effect Size", f"{results['effect_size']:.2%}")
                
                st.markdown("---")
                interpretation = ab_testing.interpret_ab_test(results)
                st.markdown(interpretation)
        
        else:  # Sample Size Calculator
            st.write("### Calculate Required Sample Size")
            
            baseline = st.number_input("Baseline Conversion Rate", 0.01, 0.99, 0.10, 0.01, help="Current conversion rate (e.g., 0.10 for 10%)")
            mde = st.number_input("Minimum Detectable Effect", 0.001, 0.5, 0.02, 0.001, help="Smallest change you want to detect (e.g., 0.02 for 2% absolute increase)")
            alpha = st.number_input("Significance Level (α)", 0.01, 0.10, 0.05, 0.01)
            power = st.number_input("Statistical Power", 0.70, 0.99, 0.80, 0.01)
            
            if st.button("Calculate Sample Size"):
                sample_size = ab_testing.calculate_sample_size(baseline, mde, alpha, power)
                
                st.success(f"### Required Sample Size: **{sample_size:,}** per group")
                st.write(f"**Total participants needed:** {sample_size * 2:,}")
                st.write(f"**To detect:** {mde:.1%} absolute change from {baseline:.1%} baseline")
                st.write(f"**With:** {(1-alpha):.0%} confidence and {power:.0%} power")
