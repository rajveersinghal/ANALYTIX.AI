import pandas as pd
import plotly.express as px
import streamlit as st

def plot_distributions(df):
    """
    Plots interactive distributions for numeric and categorical features using Plotly.
    Includes educational context.
    """
    numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
    cat_cols = df.select_dtypes(include=['object', 'category']).columns
    
    # Numeric Distributions
    if len(numeric_cols) > 0:
        st.subheader("Numeric Distributions")
        st.info("💡 **What this is:** A histogram showing how your data is spread. Use the mouse to zoom in/out.\n\n"
                "**Why it matters:** Skewed data (leaning left/right) can confuse models. "
                "Ideally, we want 'Bell Curves' (Normal Distribution).")
                
        col1, col2 = st.columns([3, 1])
        with col2:
             selected_num_col = st.selectbox("Select Numeric Column", numeric_cols)
             show_outliers = st.checkbox("Show Outliers", value=True)
             
        with col1:
            # Interactive Histogram with boxplot marginal
            # If show_outliers is False, we can limit the range to 5th-95th percentile for better view
            range_x = None
            if not show_outliers:
                q_low = df[selected_num_col].quantile(0.05)
                q_high = df[selected_num_col].quantile(0.95)
                range_x = [q_low, q_high]
                
            fig = px.histogram(df, x=selected_num_col, nbins=30, marginal="box", 
                               title=f"Distribution of {selected_num_col}",
                               range_x=range_x)
            st.plotly_chart(fig, width="stretch")
        
    # Categorical Frequency
    if len(cat_cols) > 0:
        st.subheader("Categorical Frequency")
        st.info("💡 **What this is:** A count of how often each category appears. We show top 20 for readability.\n\n"
                "**Why it matters:** If one category dominates (e.g., 90% 'Yes'), the model might just guess 'Yes' every time.")
                
        selected_cat_col = st.selectbox("Select Categorical Column", cat_cols)
        
        # Limit to Top 20 Categories
        counts = df[selected_cat_col].value_counts().reset_index()
        counts.columns = [selected_cat_col, 'Count']
        
        if len(counts) > 20:
            st.warning(f"Feature has {len(counts)} unique values. Showing top 20.")
            counts = counts.head(20)
        
        fig = px.bar(counts, x=selected_cat_col, y='Count', title=f"Frequency of {selected_cat_col} (Top 20)")
        st.plotly_chart(fig, width="stretch")

def plot_heatmap(df):
    """
    Plots an interactive correlation heatmap for numeric columns.
    """
    st.subheader("Correlation Heatmap")
    st.info("💡 **What this is:** A color-coded grid showing how closely related numerical features are (1 = identical, 0 = no relation, -1 = opposite).\n\n"
            "**Why it matters:** Highly correlated features (e.g., age & birth_year) are redundant. We might want to remove one.")
            
    numeric_df = df.select_dtypes(include=['float64', 'int64'])
    
    if numeric_df.shape[1] > 1:
        corr = numeric_df.corr()
        fig = px.imshow(corr, text_auto=True, aspect="auto", color_continuous_scale="RdBu_r", title="Correlation Matrix")
        st.plotly_chart(fig, width="stretch")
    else:
        st.info("Not enough numeric columns for correlation heatmap.")

def plot_target_analysis(df, target_col):
    """
    Plots interactive relationship between features and the target variable.
    """
    st.subheader(f"Relationship with Target: {target_col}")
    st.info(f"💡 **What & Why:** Visualizing how other features impact **{target_col}**. "
            "This helps identify which variables are actually predictive.")
    
    # Determine if target is numeric or categorical
    is_target_numeric = pd.api.types.is_numeric_dtype(df[target_col])
    
    cols = [c for c in df.columns if c != target_col]
    selected_feature = st.selectbox("Select Feature to Compare", cols)
    
    if is_target_numeric:
        # Scatter plot for numeric feature vs numeric target
        if pd.api.types.is_numeric_dtype(df[selected_feature]):
            fig = px.scatter(df, x=selected_feature, y=target_col, title=f"{selected_feature} vs {target_col}", trendline="ols")
        else:
            # Box plot for cat feature vs numeric target
            fig = px.box(df, x=selected_feature, y=target_col, title=f"{selected_feature} vs {target_col}")
    else:
        # Histogram with color for classification
        if pd.api.types.is_numeric_dtype(df[selected_feature]):
            fig = px.histogram(df, x=selected_feature, color=target_col, barmode="overlay", title=f"{selected_feature} by {target_col}")
        else:
            # Stacked bar
            fig = px.histogram(df, x=selected_feature, color=target_col, barmode="group", title=f"{selected_feature} by {target_col}")
            
    st.plotly_chart(fig, width="stretch")
