from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.routes import auth, projects, optimize

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Perfect Cut API",
    description="API for optimizing sheet goods cutting plans",
    version="1.0.0"
)

# Configure Session Middleware (required for OAuth)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="perfectcut_session",
    max_age=1800,  # 30 minutes
    same_site="lax",
    https_only=False  # Set to True in production with HTTPS
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(optimize.router, prefix="/api/optimize", tags=["optimize"])


@app.get("/")
def root():
    return {"message": "Perfect Cut API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
