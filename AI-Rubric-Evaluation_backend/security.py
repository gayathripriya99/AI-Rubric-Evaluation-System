
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import User
from auth import decode_access_token


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
):
    """
    Validate the JWT and retrieve the corresponding
    active user from PostgreSQL.
    """

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        payload = decode_access_token(credentials.credentials)

        user_id = int(payload.get("sub"))

        if user_id <= 0:
            raise ValueError("Invalid user ID")

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = db.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user


def require_role(*allowed_roles: str):
    """
    Restrict an endpoint to specific user roles.
    """

    def role_checker(
        current_user: User = Depends(get_current_user)
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource."
            )

        return current_user

    return role_checker
