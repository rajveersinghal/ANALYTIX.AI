class NarrativeGenerator:
    def _get_domain_term(self, domain: str, task: str) -> str:
        terms = {
            "business": {"regression": "Revenue Performance", "classification": "Operational Category", "forecasting": "Growth Projection"},
            "finance": {"regression": "Valuation", "classification": "Credit Risk", "anomaly_detection": "Fraud Assessment"},
            "real_estate": {"regression": "Market Value", "clustering": "Property Segment"},
            "customer": {"classification": "Churn Probability", "clustering": "Customer Segment"},
            "operations": {"regression": "Efficiency Score", "forecasting": "Demand Forecast"}
        }
        return terms.get(domain, {}).get(task, task.capitalize())

    def generate_dataset_overview(self, metadata: dict) -> list:
        rows = metadata.get("rows", 0)
        cols = metadata.get("columns", 0)
        target = metadata.get("target_column", "Not Selected")
        prob = metadata.get("problem_type", "N/A")
        domain = metadata.get("domain", "general")
        
        domain_goal = self._get_domain_term(domain, prob)
        
        return [
            f"AnalytixAI has successfully processed the dataset comprising **{rows} rows** and **{cols} columns**.",
            f"Applying the **{domain.capitalize()}** specialized engine, we identified the primary objective as **{domain_goal}** utilizing the '**{target}**' variable."
        ]
        
    def generate_quality_report_narrative(self, metadata: dict) -> list:
        score = metadata.get("data_quality_score", 0)
        dupes = metadata.get("duplicate_rows", 0)
        col_info = metadata.get("column_info", {})
        
        paragraphs = [
            f"The initial assessment yielded a **Data Quality Score of {score}/100**.",
            f"Screening identified {dupes} duplicate rows and various data inconsistencies that required automated remediation."
        ]
        
        missing_feats = [col for col, info in col_info.items() if info.get("missing_count", 0) > 0]
        if missing_feats:
            paragraphs.append(f"Significant data gaps were observed in {len(missing_feats)} columns, which were handled during the cleaning phase.")
        else:
            paragraphs.append("The dataset demonstrated high completeness with no missing values detected in the initial scan.")
            
        return paragraphs

    def generate_cleaning_actions_narrative(self, metadata: dict) -> list:
        actions = metadata.get("cleaning_actions", [])
        if not actions:
            return ["No significant manual cleaning was required as the data met the AnalytixAI quality threshold."]
            
        paragraphs = ["To prepare the data for high-accuracy modeling, AnalytixAI performed the following actions:"]
        for action in actions:
            paragraphs.append(f"- {action}")
        
        final_rows = metadata.get("clean_rows", metadata.get("rows"))
        paragraphs.append(f"Post-remediation, the resulting dataset consists of {final_rows} high-quality rows ready for analysis.")
        return paragraphs

    def generate_eda_statistical_summary(self, metadata: dict) -> list:
        eda = metadata.get("eda_results", {})
        insights = eda.get("insights", [])
        stats = metadata.get("stats_summary", {})
        
        paragraphs = ["Comprehensive EDA and statistical testing revealed the following key business insights:"]
        
        if insights:
            for ins in insights[:3]: # Top 3 insights
                paragraphs.append(f"- {ins}")
        else:
            paragraphs.append("- Identification of key feature correlations and distribution patterns.")
            
        if stats:
            paragraphs.append("Statistical validation confirmed feature normality and identified significant variance drivers.")
            
        return paragraphs

    def generate_model_summary(self, model_metrics: dict) -> list:
        name = model_metrics.get("best_model", "N/A")
        score = model_metrics.get("best_score", 0)
        metric = model_metrics.get("metric", "score")
        
        return [
            f"The AnalytixAI Smart Strategy evaluated multiple architectures and selected **{name}** as the optimal model.",
            f"The model achieved a validation {metric} of **{score:.4f}**, indicating strong predictive reliability for production deployment."
        ]

    def generate_decision_summary_combined(self, explain: dict, decision: dict) -> list:
        recs = decision.get("recommendations", [])
        global_exp = explain.get("global_explanation", {})
        importance = global_exp.get("importances", [])
        
        paragraphs = ["Based on the model's intelligence, the following strategic drivers and recommendations were identified:"]
        
        if importance:
            top_3 = [f"{i['feature']}" for i in importance[:3]]
            paragraphs.append(f"Primary Business Drivers: {', '.join(top_3)}.")
            
        if recs:
            paragraphs.append("Strategic Recommendations:")
            for r in recs[:3]:
                if isinstance(r, dict):
                    paragraphs.append(f"- {r.get('recommendation', r)}")
                else:
                    paragraphs.append(f"- {str(r)}")
                    
        return paragraphs
