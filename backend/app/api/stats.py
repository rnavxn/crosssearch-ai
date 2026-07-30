from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.chat import Conversation, Message
from app.db.database import get_db

router = APIRouter()

@router.get("/")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Count documents
    doc_count = db.query(Document).count()
    
    # 2. Count queries (Messages where role is user)
    query_count = db.query(Message).filter(Message.role == 'user').count()
    
    # 3. Recent activity (fetch latest 3 documents or conversations)
    # We will just fetch the latest 3 documents as activity
    recent_docs = db.query(Document).order_by(Document.created_at.desc()).limit(3).all()
    
    activity = []
    for doc in recent_docs:
        activity.append({
            "id": doc.id,
            "text": f"Uploaded '{doc.filename}'",
            "time": doc.created_at.strftime("%Y-%m-%d %H:%M")
        })
        
    return {
        "document_count": doc_count,
        "query_count": query_count,
        "vector_db_status": "Online",
        "recent_activity": activity
    }
