"""
test_symbolic_reasoning.py
"""

from microservices.models.symbolic_reasoning import SymbolicReasoning

def test_run_reasoning():
    engine = SymbolicReasoning()
    facts = ["fact1", "fact2"]
    result = engine.run_reasoning(facts)
    assert "reasoning_result" in result
    assert result["reasoning_result"] == "example_conclusion"
