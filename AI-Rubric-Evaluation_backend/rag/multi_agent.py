
import json
from typing import TypedDict, Any

from langgraph.graph import StateGraph, START, END
from langchain_ollama import ChatOllama

from rag.evaluator import evaluate_answer


class EvaluationState(TypedDict, total=False):
    question: str
    student_answer: str
    rubric: str
    max_score: float
    evaluation: dict[str, Any]
    verification: dict[str, Any]
    status: str


verifier_llm = ChatOllama(
    model="qwen2.5:1.5b",
    temperature=0,
    format="json"
)


def evaluator_agent(state: EvaluationState):
    print("\n[Evaluator Agent] Evaluating answer...")

    report = evaluate_answer(
        question=state["question"],
        student_answer=state["student_answer"],
        rubric=state["rubric"],
        max_score=state["max_score"]
    )

    return {"evaluation": report}


def verifier_agent(state: EvaluationState):
    print("\n[Verifier Agent] Verifying evaluation...")

    evaluation = state["evaluation"]

    prompt = f"""
You are an independent evaluation verifier.

Review the evaluation using the question, student answer, and rubric.

QUESTION: {state["question"]}
STUDENT ANSWER: {state["student_answer"]}
RUBRIC: {state["rubric"]}
MAXIMUM SCORE: {state["max_score"]}
EVALUATION: {json.dumps(evaluation, ensure_ascii=False)}

Check:
1. Score is within the permitted range.
2. Feedback matches the actual answer.
3. Strengths are supported by the answer.
4. Missing concepts are genuinely missing.
5. The evaluation follows the rubric.

Return JSON only:
{{
  "valid": true,
  "issues": [],
  "recommendation": "Brief explanation"
}}

If uncertain, return valid=false.
"""

    response = verifier_llm.invoke(prompt)

    try:
        verification = json.loads(response.content)
    except (json.JSONDecodeError, TypeError):
        verification = {
            "valid": False,
            "issues": ["Invalid verifier JSON response."],
            "recommendation": "Manual review required."
        }

    issues = verification.get("issues", [])

    if not isinstance(issues, list):
        issues = ["Verifier returned an invalid issues field."]

    score = evaluation.get("score")
    max_score = state["max_score"]

    # Deterministic score validation
    if (
        not isinstance(score, (int, float))
        or isinstance(score, bool)
        or not 0 <= score <= max_score
    ):
        issues.append("Score failed numeric range validation.")
        verification["valid"] = False

    if not isinstance(verification.get("valid"), bool):
        verification["valid"] = False

    if not isinstance(verification.get("recommendation"), str):
        verification["recommendation"] = "Manual review required."
        verification["valid"] = False

    verification["issues"] = issues

    return {"verification": verification}


def route_after_verification(state: EvaluationState):
    verification = state["verification"]

    if verification.get("valid") is True:
        return "accept"

    return "review"


def accept_result(state: EvaluationState):
    print("\n[Workflow] Evaluation accepted after verification.")

    return {"status": "verified"}


def flag_for_review(state: EvaluationState):
    print("\n[Workflow] Evaluation flagged for manual review.")

    return {"status": "manual_review_required"}


workflow = StateGraph(EvaluationState)

workflow.add_node("evaluator", evaluator_agent)
workflow.add_node("verifier", verifier_agent)
workflow.add_node("accept", accept_result)
workflow.add_node("review", flag_for_review)

workflow.add_edge(START, "evaluator")
workflow.add_edge("evaluator", "verifier")

workflow.add_conditional_edges(
    "verifier",
    route_after_verification,
    {
        "accept": "accept",
        "review": "review"
    }
)

workflow.add_edge("accept", END)
workflow.add_edge("review", END)

evaluation_graph = workflow.compile()


if __name__ == "__main__":
    sample_input = {
        "question": "What is FIFO in restaurant inventory management?",
        "student_answer": (
            "FIFO means First In, First Out. "
            "Older food stock should be used before newer stock."
        ),
        "rubric": (
            "- Correctly expand FIFO: 3 marks.\n"
            "- Explain older stock first: 4 marks.\n"
            "- Explain how it reduces food waste: 3 marks."
        ),
        "max_score": 10
    }

    result = evaluation_graph.invoke(sample_input)

    print("\n========== FINAL RESULT ==========")
    print(json.dumps(result, indent=4, ensure_ascii=False))
