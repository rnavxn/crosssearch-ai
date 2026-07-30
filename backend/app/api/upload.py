import os
import uuid
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.api import deps
from app.api.deps import get_current_analyst_or_higher, reusable_oauth2
from app.core.config import settings
from jose import jwt, JWTError
from pydantic import ValidationError
from app.services.rag_service import process_document_pipeline

router = APIRouter()

async def get_optional_user(
    db: Session = Depends(get_db),
    token: str = Query(None),
    header_token: str = Depends(reusable_oauth2)
) -> User:
    # Use query token if provided, else header token
    active_token = token or header_token
    if not active_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(active_token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id:
            user = db.query(User).filter(User.id == int(user_id)).first()
            if user and user.is_active:
                return user
    except (JWTError, ValidationError):
        pass
    raise HTTPException(status_code=401, detail="Could not validate credentials")

UPLOAD_DIR = "data/uploads"
ALLOWED_CONTENT_TYPES = ["application/pdf", "text/plain", "audio/mpeg", "audio/wav", "audio/x-m4a", "audio/mp4"]
ALLOWED_EXTENSIONS = [".pdf", ".txt", ".mp3", ".wav", ".m4a"]

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_analyst_or_higher)
):
    """
    Upload a document (PDF or TXT) to local storage and track it in DB.
    Requires Analyst or Admin role.
    """
    # 1. Validate extension and content type
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS or file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, TXT, and Audio files are allowed.")

    # 2. Generate unique local path
    unique_id = str(uuid.uuid4())
    safe_filename = f"{unique_id}{ext}"
    
    # Ensure directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    # 3. Save file locally
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
    finally:
        file.file.close()

    # 4. Create DB record
    new_doc = Document(
        filename=file.filename,
        file_path=file_path,
        uploader_id=current_user.id,
        content_type=file.content_type,
        status="uploaded"
    )
    
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    # 5. Trigger the Background Task for Chunking and Embedding
    background_tasks.add_task(process_document_pipeline, new_doc.id)
    
    return new_doc

@router.get("/", response_model=List[DocumentResponse])
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """
    Get all uploaded documents for the user.
    Admins can see all documents, others only see their own.
    """
    if current_user.role == "admin":
        docs = db.query(Document).all()
    else:
        docs = db.query(Document).filter(Document.uploader_id == current_user.id).all()
    return docs

@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """Download the actual file associated with a document ID."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if current_user.role != "admin" and doc.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")
        
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File on disk not found")
        
    return FileResponse(
        path=doc.file_path, 
        filename=doc.filename,
        media_type=doc.content_type
    )

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_admin)
):
    """
    Delete a document (Admin only).
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Remove from disk
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
        
    # Remove from DB
    db.delete(doc)
    db.commit()
    
    return {"message": "Document deleted successfully"}
