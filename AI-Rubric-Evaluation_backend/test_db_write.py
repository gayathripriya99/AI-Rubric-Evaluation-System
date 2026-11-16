
from sqlalchemy import select

from database import SessionLocal
from models import Assessment

db = SessionLocal()

try:
    # Create a temporary test assessment.
    test_assessment = Assessment(
        title="Database Connection Test",
        description="Temporary test record",
        max_score=50,
        is_active=True,
    )

    db.add(test_assessment)
    db.flush()

    test_id = test_assessment.id

    print("Test record inserted. ID:", test_id)

    # Read the record back from PostgreSQL.
    saved_assessment = db.execute(
        select(Assessment).where(Assessment.id == test_id)
    ).scalar_one()

    print("Test record retrieved:", saved_assessment.title)

    # Roll back so no test record remains.
    db.rollback()

    print("Transaction rolled back successfully.")
    print("Database read/write test passed!")

except Exception as error:
    db.rollback()
    print("Database test failed:", str(error))
    raise

finally:
    db.close()
