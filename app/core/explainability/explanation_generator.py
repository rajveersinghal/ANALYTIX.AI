# app/core/explainability/explanation_generator.py
from app.core.explainability import explanation_rules

def generate_model_summary(importances: list):
    """
    Generates a paragraph summarizing the model's behavior.
    """
    if not importances:
        return "Explanation not available."
        
    sentences = []
    
    # Overview
    top_feature = importances[0]['feature']
    sentences.append(f"This model predicts outcomes primarily based on **{top_feature}** and other key factors.")
    
    # Detail top 3
    for i, item in enumerate(importances[:3]):
        category = explanation_rules.interpret_importance(item.get('pct', 0))
        sent = explanation_rules.generate_sentence(item['feature'], category, i)
        if sent:
            sentences.append(sent)
            
    sentences.append("Features with low importance have little effect on the final decision, meaning changes in them are unlikely to change the result.")
    
    return " ".join(sentences)
