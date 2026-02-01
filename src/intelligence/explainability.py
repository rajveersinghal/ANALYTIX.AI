import shap
import streamlit as st
import matplotlib.pyplot as plt
import pandas as pd

def explain_model_global(model, X_sample):
    """
    Generates global SHAP summary plot.
    """
    try:
        # Use TreeExplainer for robust Phase 1 models (GBM/RF)
        # Check if model has feature_importances_ (Tree based)
        explainer = shap.Explainer(model, X_sample)
        shap_values = explainer(X_sample)
        
        fig, ax = plt.subplots()
        shap.summary_plot(shap_values, X_sample, show=False)
        st.pyplot(fig)
        return shap_values
    except Exception as e:
        st.error(f"SHAP Explainer Error: {e}")
        return None

def explain_prediction_local(model, X_row, feature_names):
    """
    Explains a single prediction.
    """
    try:
        explainer = shap.Explainer(model)
        shap_values = explainer(X_row)
        
        # Simple waterfall or force plot (matplotlib compatible)
        # Using a simple bar chart of contributions for robustness in Streamlit
        
        # Extract values
        if hasattr(shap_values, 'values'):
             vals = shap_values.values[0] if len(shap_values.shape) > 1 else shap_values.values
        else:
             vals = shap_values[0]

        df_contrib = pd.DataFrame({
            "Feature": feature_names,
            "Contribution": vals
        }).sort_values(by="Contribution", ascending=True) # Sorted for bar chart
        
        st.bar_chart(df_contrib.set_index("Feature"))
        
    except Exception as e:
        st.write("Local explanation unavailable for this model type.")
