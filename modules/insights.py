import pandas as pd
import streamlit as st
import numpy as np
from sklearn.inspection import permutation_importance

def generate_insights(models, feature_names, problem_type, X_test=None, y_test=None):
    """
    Generates explainable AI insights based on the trained models.
    """
    st.subheader("💡 Automated Insights")
    
    # Prefer Gradient Boosting or Random Forest for importance
    model = models.get("Gradient Boosting") or models.get("Random Forest")
    
    if model:
        # Robust check: If model has built-in importance, use it. Otherwise (like HistGradientBoosting), use Permutation.
        if hasattr(model, 'feature_importances_'):
             importances = model.feature_importances_
        else:
             if X_test is not None and y_test is not None:
                 with st.spinner("Calculating Permutation Importance (Advanced)..."):
                     try:
                        result = permutation_importance(model, X_test, y_test, n_repeats=5, random_state=42, n_jobs=-1)
                        importances = result.importances_mean
                     except Exception as e:
                        st.warning(f"Could not calculate permutation importance: {e}")
                        return
             else:
                 st.warning("Test data not provided for Gradient Boosting importance.")
                 return
             
        feature_imp = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
        feature_imp = feature_imp.sort_values(by='Importance', ascending=False).head(5)
        
        st.write("**Top 5 Important Features:**")
        st.bar_chart(feature_imp.set_index('Feature'))
        
        # Actionable Advice Generation
        top_feature = feature_imp.iloc[0]['Feature']
        st.success(f"🚀 **Actionable Advice:** Focus on **{top_feature}**. It is the strongest driver of your target variable.")
        
        return top_feature # Return top feature for simulator
            
    else:
        st.write("Could not retrieve feature importance from the best model.")
        return None

def generate_correlation_insights(df):
    """
    Generates rule-based insights from correlations.
    """
    numeric_df = df.select_dtypes(include=['float64', 'int64'])
    if numeric_df.empty:
        return

    corr_matrix = numeric_df.corr().abs()
    upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
    high_corr_pairs = [(column, row) for row in upper.index for column in upper.columns if upper.loc[row, column] > 0.8]
    
    if high_corr_pairs:
        st.write("**Correlation Alerts:**")
        for col1, col2 in high_corr_pairs:
            st.warning(f"High correlation detected between **{col1}** and **{col2}**. You might want to remove one to avoid multicollinearity.")

def run_profit_simulator(model, df, top_feature, target_col, problem_type):
    """
    Business Simulator: Allows modifying the top feature to see impact.
    """
    if problem_type != "Regression":
        return # Simulators are easiest to understand for continuous targets (Profit, Sales)
        
    st.markdown("---")
    st.header("📈 Business Profit/Growth Simulator")
    st.info(f"💡 **What-If Analysis:** See how changing **{top_feature}** impacts your **{target_col}**.")
    
    # Simplified Logic: Use Simple visualization for simulator
    st.write(f"Adjust **{top_feature}** to see predicted impact:")
                 
    # Create a slider based on the range of the top feature
    # Note: df here must be the processed dataframe used for modeling to have correct ranges
    try:
        if top_feature in df.columns:
            min_val = float(df[top_feature].min())
            max_val = float(df[top_feature].max())
            current_val = float(df[top_feature].mean())
            
            new_val = st.slider(f"Simulated Value for {top_feature}", min_val, max_val, current_val)
            
            change = new_val - current_val
            st.caption(f"Change from Average: {change:+.2f}")
            
            st.info("ℹ️ **Prediction:** Use the EDA scatter plot above to see if increasing this feature increases or decreases the target.")
    except Exception as e:
        st.write("Simulator unavailable for this feature type.")
