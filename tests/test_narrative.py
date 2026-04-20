from app.services.strategic_narrative import StrategicNarrativeService

def test_generate_executive_summary_high_quality():
    metadata = {
        "quality_score": 95,
        "explainability_results": {"top_features": ["Income"]},
        "modeling_results": {"metrics": {"r2": 0.85}},
        "domain": "Finance"
    }
    narratives = StrategicNarrativeService.generate_executive_summary(metadata)
    assert any("High Integrity Data" in n for n in narratives)
    assert any("Income" in n for n in narratives)
    assert any("Predictive Confidence" in n for n in narratives)
    assert any("Risk Outlook" in n for n in narratives)

def test_calculate_simulation_insight():
    insight = StrategicNarrativeService.calculate_simulation_insight(100, 150, "USD")
    assert "substantial increase" in insight
    assert "50 USD" in insight
    assert "50.0%" in insight

def test_calculate_simulation_insight_decrease():
    insight = StrategicNarrativeService.calculate_simulation_insight(100, 90, "USD")
    assert "notable decrease" in insight
    assert "10 USD" in insight
    assert "-10.0%" in insight
