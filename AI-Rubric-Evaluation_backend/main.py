
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


from database import get_db
from models import User
from auth import hash_password, verify_password, create_access_token
from security import get_current_user

from submission_routes import router as submission_router

from rag.rag_pipeline import retrieve_relevant_context
from rag.evaluator import evaluate_answer
from rag.multi_agent import evaluation_graph


app = FastAPI(
    title="Automatic Rubric Evaluation API",
    description="Backend API for evaluating student answers",
    version="1.0.0"
)

app.include_router(submission_router)

# CORS configuration

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# REQUEST MODELS
# -------------------------

class RegistrationRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: str = Field(
        min_length=5,
        max_length=255,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    )
    password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value):
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Full name must contain at least 2 characters.")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        return value.strip().lower()


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        return value.strip().lower()


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


# -------------------------
# GENERAL ENDPOINTS
# -------------------------

@app.get("/")
def home():
    return {"message": "Rubric Evaluation API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/me")
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "status": "success",
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        }
    }
# -------------------------
# STUDENT REGISTRATION
# -------------------------

@app.post("/api/register", status_code=201)
def register_student(
    request: RegistrationRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.execute(
        select(User).where(User.email == request.email)
    ).scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    new_user = User(
        full_name=request.full_name,
        email=request.email,
        password_hash=hash_password(request.password),
        role="student"
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    access_token = create_access_token(
        user_id=new_user.id,
        role=new_user.role
    )

    return {
        "status": "success",
        "message": "Registration successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


# -------------------------
# STUDENT LOGIN
# -------------------------

@app.post("/api/login")
def login_student(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.execute(
        select(User).where(User.email == request.email)
    ).scalar_one_or_none()

    if not user or not verify_password(
        request.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    access_token = create_access_token(
        user_id=user.id,
        role=user.role
    )

    return {
        "status": "success",
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    }


# -------------------------
# ANSWER RECEIVING ENDPOINT
# -------------------------

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


# -------------------------
# KNOWLEDGE RETRIEVAL
# -------------------------

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


# -------------------------
# SINGLE-AGENT AI EVALUATION
# -------------------------

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


# -------------------------
# MULTI-AGENT AI EVALUATION
# -------------------------

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


#  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InN0dWRlbnQiLCJleHAiOjE3OTQ3NzAxNzd9.rGwrYE0B1U75mfm-V04vcJCmosodSZxgTO06OqXkdCM"