from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import Base, engine

# Import all models here so SQLAlchemy knows about them BEFORE create_all
from app.models.user import User
from app.models.document import Document

# Create database tables (For Phase 1, we will just use SQLAlchemy's create_all)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Offline Multimodal RAG Backend for CrossSearch AI",
    version="1.0.0",
)

# Add CORS Middleware so our Electron/React frontend can communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CrossSearch AI API"}

from app.api import auth, upload

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])
