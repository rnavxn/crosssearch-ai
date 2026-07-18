from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False, unique=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="uploaded", nullable=False) # e.g. uploaded, vectorizing, ready, error
    content_type = Column(String, nullable=False) # e.g. application/pdf, text/plain
    created_at = Column(DateTime(timezone=True), server_default=func.now())
