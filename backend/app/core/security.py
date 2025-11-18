from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import hashlib
from app.core.config import settings

# Use bcrypt with SHA256 pre-hashing for long passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _prepare_password(password: str) -> str:
    """
    Prepare password for bcrypt hashing.
    Uses SHA256 pre-hashing for passwords that would exceed bcrypt's 72 byte limit.
    This allows for passwords of any length while maintaining security.
    """
    # Convert to bytes
    password_bytes = password.encode('utf-8')

    # If password is longer than 72 bytes, use SHA256 pre-hash
    if len(password_bytes) > 72:
        # Use SHA256 to create a fixed-length hash, then encode as hex
        return hashlib.sha256(password_bytes).hexdigest()

    return password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    prepared_password = _prepare_password(plain_password)
    return pwd_context.verify(prepared_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    prepared_password = _prepare_password(password)
    return pwd_context.hash(prepared_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
