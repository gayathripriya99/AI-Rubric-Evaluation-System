
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables from the backend .env file.
load_dotenv()

# Read PostgreSQL configuration.
PG_USER = os.getenv("PG_USER")
PG_PASSWORD = os.getenv("PG_PASSWORD")
PG_HOST = os.getenv("PG_HOST", "localhost")
PG_PORT = os.getenv("PG_PORT", "5432")
PG_DATABASE = os.getenv("PG_DATABASE")

# Validate required configuration.
required_settings = {
    "PG_USER": PG_USER,
    "PG_PASSWORD": PG_PASSWORD,
    "PG_DATABASE": PG_DATABASE,
}

missing_settings = [
    key for key, value in required_settings.items()
    if not value
]

if missing_settings:
    raise RuntimeError(
        "Missing database settings: " + ", ".join(missing_settings)
    )

# Build the PostgreSQL connection URL.
DATABASE_URL = (
    f"postgresql+psycopg://{PG_USER}:{PG_PASSWORD}"
    f"@{PG_HOST}:{PG_PORT}/{PG_DATABASE}"
)

# Create the SQLAlchemy engine.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Create reusable database sessions.
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)

# Base class for future database models.
Base = declarative_base()


def get_db():
    """Provide a database session to a FastAPI endpoint."""
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def test_database_connection():
    """Check whether PostgreSQL accepts a connection."""
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version()"))
        return result.scalar()
