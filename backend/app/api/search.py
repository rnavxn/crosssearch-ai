from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from app.api import deps
from app.services.rag_service import search_documents
from app.services.llm_service import generate_answer
from app.models.user import User

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

class SourceChunk(BaseModel):
    text: str
    metadata: dict

class SearchResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]

@router.post("/", response_model=SearchResponse)
def perform_search(
    request: SearchRequest,
    current_user: User = Depends(deps.get_current_active_user)
):
    # 1. Retrieve most relevant chunks from ChromaDB
    chunks = search_documents(query=request.query, top_k=request.top_k)
    
    # 2. Generate an answer using the retrieved chunks and Ollama
    answer = generate_answer(query=request.query, context_chunks=chunks)
    
    # 3. Format and return
    sources = [SourceChunk(text=c["text"], metadata=c["metadata"]) for c in chunks]
    return SearchResponse(answer=answer, sources=sources)
