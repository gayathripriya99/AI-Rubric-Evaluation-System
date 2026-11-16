
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="student")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    submissions: Mapped[list["Submission"]] = relationship(
        back_populates="user"
    )


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    max_score: Mapped[Decimal] = mapped_column(
        Numeric(8, 2), nullable=False, default=50
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    questions: Mapped[list["AssessmentQuestion"]] = relationship(
        back_populates="assessment",
        cascade="all, delete-orphan",
    )

    submissions: Mapped[list["Submission"]] = relationship(
        back_populates="assessment"
    )


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"
    __table_args__ = (
        UniqueConstraint("assessment_id", "display_order"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    assessment_id: Mapped[int] = mapped_column(
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    rubric: Mapped[str] = mapped_column(Text, nullable=False)
    max_marks: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    assessment: Mapped["Assessment"] = relationship(
        back_populates="questions"
    )

    answers: Mapped[list["SubmissionAnswer"]] = relationship(
        back_populates="question"
    )


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    assessment_id: Mapped[int] = mapped_column(
        ForeignKey("assessments.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="pending"
    )
    total_score: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))
    max_score: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True)
    )

    user: Mapped["User"] = relationship(back_populates="submissions")
    assessment: Mapped["Assessment"] = relationship(
        back_populates="submissions"
    )

    answers: Mapped[list["SubmissionAnswer"]] = relationship(
        back_populates="submission",
        cascade="all, delete-orphan",
    )


class SubmissionAnswer(Base):
    __tablename__ = "submission_answers"
    __table_args__ = (
        UniqueConstraint("submission_id", "question_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    submission_id: Mapped[int] = mapped_column(
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_id: Mapped[int] = mapped_column(
        ForeignKey("assessment_questions.id"), nullable=False
    )
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    submission: Mapped["Submission"] = relationship(
        back_populates="answers"
    )
    question: Mapped["AssessmentQuestion"] = relationship(
        back_populates="answers"
    )

    evaluation: Mapped["EvaluationResult | None"] = relationship(
        back_populates="answer",
        cascade="all, delete-orphan",
        uselist=False,
    )


class EvaluationResult(Base):
    __tablename__ = "evaluation_results"
    __table_args__ = (
        CheckConstraint("score <= max_score"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    answer_id: Mapped[int] = mapped_column(
        ForeignKey("submission_answers.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    score: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    max_score: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    strengths: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default="'[]'::jsonb"
    )
    missing_concepts: Mapped[list] = mapped_column(
        JSONB, nullable=False, server_default="'[]'::jsonb"
    )
    feedback: Mapped[str | None] = mapped_column(Text)
    improvement_suggestion: Mapped[str | None] = mapped_column(Text)
    verification: Mapped[dict | None] = mapped_column(JSONB)
    evaluation_status: Mapped[str | None] = mapped_column(
        String(30), default="completed"
    )
    evaluated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    answer: Mapped["SubmissionAnswer"] = relationship(
        back_populates="evaluation"
    )
