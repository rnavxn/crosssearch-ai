from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.chat import Conversation, Message
from app.api import deps

router = APIRouter()

# Pydantic Schemas for Response/Request
class MessageSchema(BaseModel):
    id: int
    role: str
    content: str
    sources: list | None = None
    
    class Config:
        from_attributes = True

class ConversationSchema(BaseModel):
    id: int
    title: str
    
    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    title: str

class MessageCreate(BaseModel):
    role: str
    content: str
    sources: list | None = None

@router.get("/", response_model=List[ConversationSchema])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get all conversations for the current user."""
    return db.query(Conversation).filter(Conversation.user_id == current_user.id).order_by(Conversation.updated_at.desc()).all()

@router.post("/", response_model=ConversationSchema)
def create_conversation(
    req: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Create a new conversation thread."""
    conv = Conversation(user_id=current_user.id, title=req.title)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Delete a conversation thread."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conv)
    db.commit()
    return {"message": "Deleted"}

@router.get("/{conversation_id}/messages", response_model=List[MessageSchema])
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get all messages for a specific conversation."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    return db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()

@router.post("/{conversation_id}/messages", response_model=MessageSchema)
def create_message(
    conversation_id: int,
    req: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Add a message to a conversation."""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    msg = Message(conversation_id=conversation_id, role=req.role, content=req.content, sources=req.sources)
    db.add(msg)
    
    # Touch the conversation to update updated_at
    from sqlalchemy.sql import func
    conv.updated_at = func.now()
    
    db.commit()
    db.refresh(msg)
    return msg
