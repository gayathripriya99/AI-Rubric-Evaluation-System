
from datetime import datetime, timedelta, timezone
import os

import jwt
from pwdlib import PasswordHash
from dotenv import load_dotenv

# Authentication configuration
load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is missing from the backend .env file."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a password before storing it in PostgreSQL."""
    return password_hasher.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """Verify a submitted password against its stored hash."""
    return password_hasher.verify(
        plain_password,
        hashed_password
    )


def create_access_token(user_id: int, role: str) -> str:
    """Create a signed JWT access token."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expires_at
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT access token."""
    return jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )
