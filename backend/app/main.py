from fastapi import FastAPI
from app.core.config import settings
from app.db.database import Base, engine

# Create database tables (For Phase 1, we will just use SQLAlchemy's create_all. 
# Later we can use Alembic for migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Offline Multimodal RAG Backend for CrossSearch AI",
    version="1.0.0",
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CrossSearch AI API"}

from app.api import auth

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
