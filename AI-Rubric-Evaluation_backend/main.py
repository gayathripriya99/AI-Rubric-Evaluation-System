

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from rag.rag_pipeline import retrieve_relevant_context
from rag.evaluator import evaluate_answer
from rag.multi_agent import evaluation_graph


app = FastAPI(
    title="Automatic Rubric Evaluation API",
    description="Backend API for evaluating student answers",
    version="1.0.0"
)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )



# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class EvaluationRequest(BaseModel):
    answers: dict[int, str] = Field(
        description="Question IDs mapped to submitted answers"
    )


class RetrievalRequest(BaseModel):
    query: str = Field(
        min_length=3,
        description="Question or answer to search in the knowledge base"
    )
    top_k: int = Field(default=3, ge=1, le=10)


class AIEvaluationRequest(BaseModel):
    question: str = Field(min_length=3)
    student_answer: str = Field(min_length=1)
    rubric: str = Field(min_length=3)
    max_score: float = Field(default=10, gt=0, le=100)

class MultiAgentEvaluationRequest(BaseModel):
    question: str = Field(min_length=3)
    student_answer: str = Field(min_length=1)
    rubric: str = Field(min_length=3)
    max_score: float = Field(default=10, gt=0, le=100)

@app.get("/")
def home():
    return {"message": "Rubric Evaluation API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/api/evaluate")
def evaluate(request: EvaluationRequest):
    valid_answers = {
        str(question_id): answer.strip()
        for question_id, answer in request.answers.items()
        if answer and answer.strip()
    }

    if not valid_answers:
        return {
            "status": "error",
            "message": "Please submit at least one answer."
        }

    return {
        "status": "success",
        "message": "Answers received successfully.",
        "total_answers": len(valid_answers),
        "answers": valid_answers
    }



@app.post("/api/retrieve")
def retrieve_knowledge(request: RetrievalRequest):

    try:
        results = retrieve_relevant_context(
            query=request.query,
            k=request.top_k
        )

        return {
            "status": "success",
            "query": request.query,
            "total_results": len(results),
            "retrieved_context": results
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Knowledge retrieval failed: {str(error)}"
        )


@app.post("/api/ai-evaluate")
def ai_evaluate(request: AIEvaluationRequest):

    try:
        report = evaluate_answer(
            question=request.question,
            student_answer=request.student_answer,
            rubric=request.rubric,
            max_score=request.max_score
        )

        return {
            "status": "success",
            "evaluation": report
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI evaluation failed: {str(error)}"
        )


@app.post("/api/multi-agent-evaluate")
def multi_agent_evaluate(request: MultiAgentEvaluationRequest):
    try:
        result = evaluation_graph.invoke({
            "question": request.question,
            "student_answer": request.student_answer,
            "rubric": request.rubric,
            "max_score": request.max_score
        })

        return {
            "status": "success",
            "evaluation_status": result.get("status"),
            "evaluation": result.get("evaluation"),
            "verification": result.get("verification")
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Multi-agent evaluation failed: {str(error)}"
        )