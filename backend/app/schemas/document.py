from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    content_type: str

class DocumentCreate(DocumentBase):
    file_path: str
    uploader_id: int

class DocumentResponse(DocumentBase):
    id: int
    status: str
    uploader_id: int
    created_at: datetime

    class Config:
        from_attributes = True
