import streamlit as st

def generate_business_recommendations(top_features, drift_status=None):
    """
    Generates business actions based on insights.
    """
    recs = []
    
    # 1. Feature-based Recommendations
    if top_features:
        best_feat = top_features[0]
        recs.append(f"**Strategic Focus**: Invest in optimizing **{best_feat}**. It has the highest ROI (Influence) on outcomes.")
        
    # 2. Drift-based
    if drift_status == "DRIFT DETECTED":
        recs.append("**Risk Mitigation**: Market conditions have changed (Drift). Review pricing/strategy references associated with drifted features.")
    
    # 3. Generic Smart Actions
    recs.append("**Efficiency**: specialized segment analysis is recommended for high-risk predictions.")
    
    return recs
