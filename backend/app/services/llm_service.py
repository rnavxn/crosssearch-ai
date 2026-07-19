import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
# Default to llama3, but could be set via environment variable
MODEL_NAME = "llama3"

def generate_answer(query: str, context_chunks: list[dict]) -> str:
    """
    Constructs a prompt with context and queries the local Ollama instance.
    """
    if not context_chunks:
        return "I could not find any relevant information in your uploaded documents to answer this question."

    # Format the context from retrieved chunks
    context_text = "\n\n---\n\n".join([f"Source: {chunk['metadata'].get('filename', 'Unknown')}\n{chunk['text']}" for chunk in context_chunks])
    
    prompt = f"""You are CrossSearch, an offline AI assistant. 
Please answer the user's question based strictly on the provided context from their documents.
If the answer is not in the context, say you don't know based on the provided documents.

Context:
{context_text}

User Question: {query}
Answer:"""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False
        }, timeout=60) # Wait up to 60s for the LLM to generate
        
        response.raise_for_status()
        data = response.json()
        return data.get("response", "Error: No response generated.")
        
    except requests.exceptions.ConnectionError:
        return f"Error: Could not connect to local Ollama instance at {OLLAMA_URL}. Is Ollama running?"
    except Exception as e:
        return f"Error generating answer: {str(e)}"
