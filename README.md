# CrossSearch AI: Offline Multimodal RAG System 🔍

![CrossSearch AI Banner](https://via.placeholder.com/1200x400/1a1a1a/00ffcc?text=CrossSearch+AI+-+Offline+Multimodal+Knowledge+Base)

CrossSearch AI is a highly secure, completely offline, multimodal Retrieval-Augmented Generation (RAG) search engine. It allows users to upload documents (PDFs, TXT) and audio files (MP3, WAV), index them into a local vector database, and query them using state-of-the-art Large Language Models—all without a single byte of data leaving your machine.

## 🌟 Key Features

* **100% Offline & Private**: Powered by local LLMs (via Ollama) and local embeddings, ensuring maximum data security.
* **Multimodal Ingestion**: 
  * **Text & Documents**: Extracts text from PDFs and TXT files using PyMuPDF.
  * **Audio & Voice**: Transcribes MP3, WAV, and M4A audio files locally using `faster-whisper`.
* **AI Document Classification**: Automatically tags uploaded documents with semantic categories using an autonomous LLM agent.
* **Persistent Chat Threads**: Features a ChatGPT-style interface with multiple concurrent, database-backed conversation histories.
* **Role-Based Access Control**: Secure JWT-based authentication system with dynamic UI rendering (e.g., hiding sensitive search tools from Guest users).
* **Modern UI/UX**: Built with React, Vite, and Lucide icons, featuring a stunning dark-mode "Cyber-Glass" aesthetic with fluid animations.

## 🏗️ Architecture Stack

### Frontend (User Interface)
* **Framework**: React 18 + Vite + TypeScript
* **Routing**: React Router DOM
* **Styling**: Vanilla CSS with Glassmorphism and CSS Variables
* **State**: React Context API (AuthContext)

### Backend (API & Intelligence)
* **Framework**: FastAPI (Python)
* **Database (Relational)**: PostgreSQL via SQLAlchemy (Users, Documents, Chat History)
* **Database (Vector)**: ChromaDB (Storing chunked embeddings)
* **Embeddings**: `all-MiniLM-L6-v2` via SentenceTransformers
* **Audio Transcription**: `faster-whisper` (Base Model)
* **Language Model**: `llama3` via Ollama API

## 🚀 Getting Started

### Prerequisites
1. **Ollama**: Must be installed and running locally with the `llama3` model pulled (`ollama run llama3`).
2. **PostgreSQL**: Must be running with a database named `crosssearch`.
3. **Python 3.12+** (Backend)
4. **Node.js 18+** (Frontend)

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# (Make sure to also install faster-whisper)

# Run the API server
uvicorn app.main:app --reload
```
*The API will be available at http://127.0.0.1:8000*

### Frontend Setup
```bash
cd desktop
npm install

# Run the dev server
npm run dev
```
*The UI will be available at http://localhost:5173*

## 💡 How It Works (The RAG Pipeline)
1. **Upload**: User drops a PDF or Audio file into the React frontend.
2. **Ingestion**: FastAPI receives the file. If it's audio, `faster-whisper` transcribes it to text.
3. **Classification**: The first 1,500 characters are sent to Ollama to generate a semantic category tag.
4. **Chunking**: The text is split into overlapping 1000-character chunks.
5. **Embedding**: Chunks are mathematically embedded using `SentenceTransformers` and saved to ChromaDB.
6. **Querying**: User asks a question in the Chat UI. ChromaDB finds the top 3 most relevant chunks and feeds them to `llama3` as context to generate an accurate, hallucination-free answer!
