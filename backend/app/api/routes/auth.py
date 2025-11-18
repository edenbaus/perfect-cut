from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.oauth import get_oauth_client, is_oauth_configured, GOOGLE_REDIRECT_URI
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token, User as UserSchema
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", response_model=UserSchema)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        name=user_data.name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token."""
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout():
    """Logout (client should discard the token)."""
    return {"message": "Successfully logged out"}


# Google OAuth routes
@router.get("/google/login")
async def google_login(request: Request):
    """Initiate Google OAuth login flow."""
    if not is_oauth_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OAuth is not configured on the server"
        )

    oauth = get_oauth_client()
    # Use the configured redirect URI from environment variables
    return await oauth.google.authorize_redirect(request, GOOGLE_REDIRECT_URI)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth callback."""
    if not is_oauth_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OAuth is not configured on the server"
        )

    try:
        oauth = get_oauth_client()
        token = await oauth.google.authorize_access_token(request)

        # Get user info from Google
        user_info = token.get('userinfo')
        if not user_info:
            user_info = await oauth.google.parse_id_token(request, token)

        email = user_info.get('email')
        name = user_info.get('name')
        picture = user_info.get('picture')
        oauth_sub = user_info.get('sub')  # Google's user ID
        email_verified = user_info.get('email_verified', False)

        if not email or not oauth_sub:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to get user information from Google"
            )

        # Find or create user
        user = db.query(User).filter(
            (User.email == email) |
            ((User.oauth_provider == 'google') & (User.oauth_sub == oauth_sub))
        ).first()

        if user:
            # Update existing user with OAuth info if needed
            if not user.oauth_provider:
                user.oauth_provider = 'google'
                user.oauth_sub = oauth_sub
                user.is_email_verified = email_verified
            if picture and not user.picture:
                user.picture = picture
            if name and not user.name:
                user.name = name
            db.commit()
        else:
            # Create new user
            user = User(
                email=email,
                name=name,
                oauth_provider='google',
                oauth_sub=oauth_sub,
                picture=picture,
                is_email_verified=email_verified,
                password_hash=None  # No password for OAuth users
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        # Redirect to frontend with token
        frontend_url = settings.FRONTEND_URL or "http://localhost:81"
        redirect_url = f"{frontend_url}/auth/callback?token={access_token}"
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        logger.error(f"OAuth callback error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Authentication failed: {str(e)}"
        )
