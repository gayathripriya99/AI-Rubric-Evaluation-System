
from decimal import Decimal

from sqlalchemy import select

from database import SessionLocal
from models import Assessment, AssessmentQuestion


ASSESSMENT_TITLE = "Restaurant Operations Examination"

QUESTIONS = [
    {
        "question_text": "Explain the operational workflows of a commercial restaurant kitchen.",
        "rubric": (
            "Evaluate understanding of kitchen stations and staff responsibilities, "
            "food preparation workflows, order processing, communication between "
            "kitchen teams, and timing and coordination during service. "
            "Award marks based on accuracy, completeness, and practical understanding."
        ),
        "max_marks": Decimal("10"),
        "display_order": 1,
    },
    {
        "question_text": "Describe standard safety protocols for food handling and cross-contamination.",
        "rubric": (
            "Evaluate understanding of hand hygiene, prevention of cross-contamination, "
            "safe food handling, temperature control, cleaning and sanitization, "
            "and proper food storage. Award marks based on accuracy, completeness, "
            "and practical application."
        ),
        "max_marks": Decimal("10"),
        "display_order": 2,
    },
    {
        "question_text": "Detail effective table service strategies during high-volume dining hours.",
        "rubric": (
            "Evaluate understanding of guest greeting, accurate order taking, "
            "communication with kitchen staff, service timing, coordination between "
            "staff, and maintaining customer experience during busy periods. "
            "Award marks based on accuracy, completeness, and relevance."
        ),
        "max_marks": Decimal("10"),
        "display_order": 3,
    },
    {
        "question_text": "How does a restaurant manage supply chains and inventory rotation?",
        "rubric": (
            "Evaluate understanding of demand forecasting, purchasing and receiving "
            "stock, inventory records, FIFO or FEFO rotation, storage practices, "
            "supplier coordination, and stock control. Award marks based on accuracy, "
            "completeness, and practical application."
        ),
        "max_marks": Decimal("10"),
        "display_order": 4,
    },
    {
        "question_text": "Outline customer dispute resolution tactics for frontline waitstaff.",
        "rubric": (
            "Evaluate understanding of active listening, empathy, calm communication, "
            "identifying the customer's concern, offering appropriate solutions, "
            "escalation when necessary, and follow-up. Award marks based on accuracy, "
            "completeness, and professionalism."
        ),
        "max_marks": Decimal("10"),
        "display_order": 5,
    },
]


def seed_assessment():
    db = SessionLocal()

    try:
        assessment = db.execute(
            select(Assessment).where(
                Assessment.title == ASSESSMENT_TITLE
            )
        ).scalar_one_or_none()

        if assessment is None:
            assessment = Assessment(
                title=ASSESSMENT_TITLE,
                description="Five-question restaurant operations examination.",
                max_score=Decimal("50"),
                is_active=True,
            )

            db.add(assessment)
            db.flush()

            print("Assessment created.")
        else:
            assessment.max_score = Decimal("50")
            assessment.is_active = True

            print("Existing assessment found.")

        for question_data in QUESTIONS:
            question = db.execute(
                select(AssessmentQuestion).where(
                    AssessmentQuestion.assessment_id == assessment.id,
                    AssessmentQuestion.display_order
                    == question_data["display_order"],
                )
            ).scalar_one_or_none()

            if question is None:
                question = AssessmentQuestion(
                    assessment_id=assessment.id,
                    **question_data,
                )
                db.add(question)
            else:
                question.question_text = question_data["question_text"]
                question.rubric = question_data["rubric"]
                question.max_marks = question_data["max_marks"]

        db.commit()

        print("\nAssessment saved successfully!")
        print("Assessment ID:", assessment.id)
        print("Assessment:", assessment.title)
        print("Total marks:", assessment.max_score)

        for question in db.execute(
            select(AssessmentQuestion)
            .where(AssessmentQuestion.assessment_id == assessment.id)
            .order_by(AssessmentQuestion.display_order)
        ).scalars():
            print(
                f"Question {question.display_order}: "
                f"{question.question_text} "
                f"({question.max_marks} marks)"
            )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_assessment()
