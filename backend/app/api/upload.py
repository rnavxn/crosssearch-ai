import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.api.deps import get_current_analyst_or_higher

router = APIRouter()

UPLOAD_DIR = "data/uploads"
ALLOWED_CONTENT_TYPES = ["application/pdf", "text/plain"]
ALLOWED_EXTENSIONS = [".pdf", ".txt"]

@router.post("/", response_model=DocumentResponse)
async def upload_document(
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
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are allowed.")

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
    
    return new_doc
