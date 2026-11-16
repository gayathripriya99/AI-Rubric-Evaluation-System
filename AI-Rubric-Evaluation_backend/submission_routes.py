
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import (
    User,
    Assessment,
    AssessmentQuestion,
    Submission,
    SubmissionAnswer,
    EvaluationResult,
)
from security import get_current_user, require_role
from rag.multi_agent import evaluation_graph


router = APIRouter(prefix="/api", tags=["Submissions"])


class SubmissionRequest(BaseModel):
    assessment_id: int = Field(gt=0)
    answers: dict[int, str]


@router.post("/submissions")
def create_submission(
    request: SubmissionRequest,
current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    # 1. Find the active assessment.
    assessment = db.execute(
        select(Assessment).where(
            Assessment.id == request.assessment_id,
            Assessment.is_active.is_(True),
        )
    ).scalar_one_or_none()

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found or inactive.",
        )

    # 2. Retrieve assessment questions.
    questions = db.execute(
        select(AssessmentQuestion)
        .where(
            AssessmentQuestion.assessment_id == assessment.id
        )
        .order_by(AssessmentQuestion.display_order)
    ).scalars().all()

    if not questions:
        raise HTTPException(
            status_code=409,
            detail="This assessment has no questions.",
        )

    # 3. Validate submitted answers.
    question_ids = {question.id for question in questions}
    submitted_ids = set(request.answers.keys())

    missing_ids = question_ids - submitted_ids
    extra_ids = submitted_ids - question_ids

    if missing_ids or extra_ids:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Please submit exactly the questions in this assessment.",
                "missing_question_ids": sorted(missing_ids),
                "invalid_question_ids": sorted(extra_ids),
            },
        )

    for question_id, answer in request.answers.items():
        if not answer or not answer.strip():
            raise HTTPException(
                status_code=422,
                detail=f"Answer for question {question_id} cannot be empty.",
            )

    # 4. Create and save the submission before AI evaluation.
    submission = Submission(
        user_id=current_user.id,
        assessment_id=assessment.id,
        status="processing",
        max_score=assessment.max_score,
    )

    try:
        db.add(submission)
        db.flush()

        for question in questions:
            answer_record = SubmissionAnswer(
                submission_id=submission.id,
                question_id=question.id,
                answer_text=request.answers[question.id].strip(),
            )
            db.add(answer_record)

        db.commit()
        db.refresh(submission)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save your assessment submission.",
        )

    submission_id = submission.id
    question_results = []
    total_score = Decimal("0.00")
    needs_manual_review = False

    # 5. Evaluate each answer and save its result.
    try:
        for question in questions:

            answer_record = db.execute(
                select(SubmissionAnswer).where(
                    SubmissionAnswer.submission_id == submission_id,
                    SubmissionAnswer.question_id == question.id,
                )
            ).scalar_one()

            result = evaluation_graph.invoke({
                "question": question.question_text,
                "student_answer": answer_record.answer_text,
                "rubric": question.rubric,
                "max_score": float(question.max_marks),
            })

            report = result.get("evaluation")
            verification = result.get("verification") or {}
            workflow_status = result.get("status")

            if not isinstance(report, dict):
                raise ValueError(
                    f"Invalid evaluation result for question {question.id}."
                )

            score = Decimal(str(report["score"]))
            maximum = Decimal(str(question.max_marks))

            if score < 0 or score > maximum:
                raise ValueError(
                    f"Invalid score returned for question {question.id}."
                )

            verified = (
                workflow_status == "verified"
                and verification.get("valid") is True
            )

            if not verified:
                needs_manual_review = True

            # Save the AI evaluation in PostgreSQL.
            evaluation_record = EvaluationResult(
                answer_id=answer_record.id,
                score=score,
                max_score=maximum,
                strengths=report.get("strengths", []),
                missing_concepts=report.get("missing_concepts", []),
                feedback=report.get("feedback", ""),
                improvement_suggestion=report.get(
                    "improvement_suggestion", ""
                ),
                verification=verification,
                evaluation_status=(
                    "verified" if verified
                    else "manual_review_required"
                ),
            )

            db.add(evaluation_record)
            db.commit()

            total_score += score

            question_results.append({
                "question_id": question.id,
                "title": f"Question {question.display_order}",
                "question": question.question_text,
                "score": float(score),
                "max_score": float(maximum),
                "strengths": report.get("strengths", []),
                "missing_concepts": report.get("missing_concepts", []),
                "feedback": report.get("feedback", ""),
                "improvement_suggestion": report.get(
                    "improvement_suggestion", ""
                ),
                "verification": verification,
                "evaluation_status": (
                    "verified" if verified
                    else "manual_review_required"
                ),
            })

        # 6. Update the final submission status.
        submission = db.get(Submission, submission_id)

        submission.total_score = total_score
        submission.max_score = assessment.max_score
        submission.status = (
            "manual_review" if needs_manual_review
            else "completed"
        )
        submission.completed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(submission)

        # 7. Return the completed assessment report.
        return {
            "status": "success",
            "submission_id": submission.id,
            "evaluation_status": submission.status,
            "total_score": float(total_score),
            "max_score": float(assessment.max_score),
            "total_questions": len(questions),
            "completed_questions": len(question_results),
            "submitted_at": submission.submitted_at.isoformat(),
            "question_results": question_results,
        }

    except Exception as error:
        print(
            f"Submission {submission_id} evaluation failed: {error}"
        )

        db.rollback()

        # Preserve the submitted answers and any completed evaluations.
        failed_submission = db.get(Submission, submission_id)

        if failed_submission is not None:
            failed_submission.status = "failed"
            db.commit()

        raise HTTPException(
            status_code=500,
            detail=(
                "Your answers were saved, but evaluation could not "
                "be completed. Please try again or contact support."
            ),
        )



@router.get("/submissions/me")
def get_my_submissions(
    current_user: User = Depends(require_role("student")),
    db: Session = Depends(get_db),
):
    # Retrieve only submissions belonging to the logged-in student.
    submissions = db.execute(
        select(Submission, Assessment)
        .join(
            Assessment,
            Submission.assessment_id == Assessment.id,
        )
        .where(Submission.user_id == current_user.id)
        .order_by(Submission.submitted_at.desc())
    ).all()

    submission_reports = []

    for submission, assessment in submissions:
        answer_records = db.execute(
            select(
                SubmissionAnswer,
                AssessmentQuestion,
                EvaluationResult,
            )
            .join(
                AssessmentQuestion,
                SubmissionAnswer.question_id == AssessmentQuestion.id,
            )
            .outerjoin(
                EvaluationResult,
                EvaluationResult.answer_id == SubmissionAnswer.id,
            )
            .where(
                SubmissionAnswer.submission_id == submission.id
            )
            .order_by(AssessmentQuestion.display_order)
        ).all()

        question_results = []

        for answer, question, evaluation in answer_records:
            question_results.append({
                "question_id": question.id,
                "title": f"Question {question.display_order}",
                "question": question.question_text,
                "score": (
                    float(evaluation.score)
                    if evaluation else None
                ),
                "max_score": float(question.max_marks),
                "strengths": (
                    evaluation.strengths or []
                    if evaluation else []
                ),
                "missing_concepts": (
                    evaluation.missing_concepts or []
                    if evaluation else []
                ),
                "feedback": (
                    evaluation.feedback or ""
                    if evaluation else ""
                ),
                "improvement_suggestion": (
                    evaluation.improvement_suggestion or ""
                    if evaluation else ""
                ),
                "verification": (
                    evaluation.verification or {}
                    if evaluation else {}
                ),
                "evaluation_status": (
                    evaluation.evaluation_status
                    if evaluation else "pending"
                ),
            })

        submission_reports.append({
            "submission_id": submission.id,
            "assessment_id": assessment.id,
            "assessment_title": assessment.title,
            "status": submission.status,
            "total_score": (
                float(submission.total_score)
                if submission.total_score is not None
                else None
            ),
            "max_score": float(submission.max_score),
            "submitted_at": (
                submission.submitted_at.isoformat()
                if submission.submitted_at else None
            ),
            "completed_at": (
                submission.completed_at.isoformat()
                if submission.completed_at else None
            ),
            "question_results": question_results,
        })

    return {
        "status": "success",
        "total_submissions": len(submission_reports),
        "submissions": submission_reports,
    }
