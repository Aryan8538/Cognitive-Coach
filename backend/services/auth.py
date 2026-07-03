import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db
import models, schemas

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey-for-cognitive-coach-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

# Supabase-issued access tokens are verified with the project's JWT secret
# (Supabase Dashboard -> Project Settings -> API -> JWT Secret). When this is
# unset, Supabase tokens cannot be verified and are treated as anonymous
# (guest/sandbox) rather than blindly trusted.
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_JWT_ALGORITHMS = ["HS256"]
SUPABASE_JWT_AUDIENCE = "authenticated"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def _get_or_create_user(db: Session, email: str, build) -> models.User:
    """Return the user with this email, creating it via build() if absent.

    Race-safe: if a concurrent request inserts the same email first, the
    IntegrityError is rolled back and the now-existing row is returned.
    build() is only invoked when a new row is needed, so bcrypt hashing
    stays lazy (not run on every request for existing users).
    """
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return user
    user = build()
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        return db.query(models.User).filter(models.User.email == email).first()


def _email_from_local_token(token: str) -> Optional[str]:
    """Verify a token issued by this backend's /api/auth endpoints (HS256, no audience)."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
    email = payload.get("email")
    sub = payload.get("sub")
    # Local tokens carry the email in the 'sub' claim.
    if not email and sub and "@" in str(sub):
        email = sub
    return email


def _claims_from_supabase_token(token: str) -> Optional[dict]:
    """Verify a Supabase-issued token using the project JWT secret.

    Returns the decoded claims, or None if verification is impossible (no secret
    configured) or fails. Unverified claims are never trusted.
    """
    if not SUPABASE_JWT_SECRET:
        return None
    try:
        return jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=SUPABASE_JWT_ALGORITHMS,
            audience=SUPABASE_JWT_AUDIENCE,
        )
    except JWTError:
        return None


def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[models.User]:
    """Resolve the authenticated user, or None for anonymous/sandbox requests.

    Only cryptographically verified tokens are honored. Anything missing,
    malformed, wrongly signed, or unverifiable resolves to None so the guest
    sandbox flow keeps working without ever trusting an unverified token.
    """
    if not token:
        return None

    # 1. Our own locally-issued JWT (bcrypt login via /api/auth).
    local_email = _email_from_local_token(token)
    if local_email:
        return db.query(models.User).filter(models.User.email == local_email).first()

    # 2. Supabase-issued JWT (verified only when SUPABASE_JWT_SECRET is set).
    claims = _claims_from_supabase_token(token)
    if claims:
        email = claims.get("email")
        if email:
            user_metadata = claims.get("user_metadata", {}) or {}
            name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]
            return _get_or_create_user(
                db,
                email,
                lambda: models.User(
                    name=name,
                    email=email,
                    hashed_password=""  # Authenticated externally via Supabase
                ),
            )

    # 3. Present but unverifiable -> anonymous.
    return None


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    """Strict variant: require a verified user, else 401."""
    user = get_current_user_optional(token, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def assert_can_access_interview(interview: models.Interview, current_user: Optional[models.User]) -> None:
    """Authorize access to an interview; raise 404 if the caller is not the owner.

    - Owned interviews (user_id set) require that same authenticated user.
    - Anonymous interviews (user_id is None) are reachable via their unguessable
      UUID, which preserves the no-login sandbox flow.
    We raise 404 rather than 403 so the existence of other users' interviews
    is not disclosed.
    """
    if interview.user_id is not None:
        if current_user is None or current_user.id != interview.user_id:
            raise HTTPException(status_code=404, detail="Interview session not found")
