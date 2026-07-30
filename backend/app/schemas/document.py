from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    content_type: str

class DocumentCreate(DocumentBase):
    file_path: str
    uploader_id: int

class DocumentResponse(BaseModel):
    id: int
    filename: str
    status: str
    category: str
    content_type: str
    created_at: datetime

    class Config:
        from_attributes = True
