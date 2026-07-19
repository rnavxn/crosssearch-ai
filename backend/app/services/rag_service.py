import os
import fitz  # PyMuPDF
from sqlalchemy.orm import Session
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.models.document import Document
from app.db.database import SessionLocal

# Initialize ChromaDB Local Client
CHROMA_PERSIST_DIR = "data/chroma"
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

chroma_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)

# We use the default sentence-transformers model. 
# It will download 'all-MiniLM-L6-v2' on first run (approx 80MB) and then run completely offline.
embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

collection = chroma_client.get_or_create_collection(
    name="crosssearch_docs",
    embedding_function=embedding_function
)

# Initialize Text Splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    is_separator_regex=False,
)

def extract_text_from_file(file_path: str, content_type: str) -> str:
    """Extract raw text from PDF or TXT files."""
    text = ""
    if content_type == "application/pdf" or file_path.endswith(".pdf"):
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            print(f"Error parsing PDF {file_path}: {e}")
    else:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
        except Exception as e:
            print(f"Error parsing TXT {file_path}: {e}")
    return text

def process_document_pipeline(document_id: int):
    """
    Background task to extract text, chunk it, and store in ChromaDB.
    """
    # Create a fresh DB session for the background task
    db: Session = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return

        # 1. Update status
        doc.status = "processing"
        db.commit()

        # 2. Extract Text
        raw_text = extract_text_from_file(doc.file_path, doc.content_type)
        if not raw_text.strip():
            doc.status = "error: no text found"
            db.commit()
            return

        # 3. Chunk Text
        chunks = text_splitter.split_text(raw_text)

        # 4. Store in ChromaDB
        if chunks:
            # Generate deterministic IDs for chunks
            ids = [f"doc_{doc.id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [{"document_id": doc.id, "filename": doc.filename, "chunk_index": i} for i in range(len(chunks))]
            
            # Upsert into Chroma (automatically calculates embeddings via SentenceTransformers)
            collection.upsert(
                documents=chunks,
                metadatas=metadatas,
                ids=ids
            )

        # 5. Mark as complete
        doc.status = "vectorized"
        db.commit()
        
    except Exception as e:
        print(f"RAG Pipeline Error for doc {document_id}: {e}")
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = f"error: {str(e)}"
            db.commit()
    finally:
        db.close()

def search_documents(query: str, top_k: int = 3):
    """
    Query ChromaDB for the most relevant document chunks based on the user query.
    Returns a list of dictionaries with chunk text and metadata.
    """
    try:
        results = collection.query(
            query_texts=[query],
            n_results=top_k
        )
        
        # Format the results
        formatted_results = []
        
        # Chroma returns lists of lists (one list per query)
        if results['documents'] and results['documents'][0]:
            documents = results['documents'][0]
            metadatas = results['metadatas'][0]
            
            for i in range(len(documents)):
                formatted_results.append({
                    "text": documents[i],
                    "metadata": metadatas[i] if metadatas else {}
                })
                
        return formatted_results
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return []
