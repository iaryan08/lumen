# Lumen AI Assistant

**Lumen** is a dual-mode, full-stack AI Assistant built on a Retrieval-Augmented Generation (RAG) architecture. It offers:
1. **Study Mode**: Upload documents (.txt, .md, etc.) and chat with them.
2. **Code Mode**: Upload pull request diffs (.patch, .diff) to get instant, AI-driven code reviews.

## Tech Stack
- **Frontend**: Next.js 16, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI (Python), ChromaDB (Vector DB), Sentence-Transformers (Embeddings)
- **LLM Engine**: Google Gemini (gemini-3.1-flash-lite)

## Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
*Note: Make sure to create a `.env` file in the `backend` folder containing `GEMINI_API_KEY="your-api-key"`.*

To start the backend server:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` to start using Lumen!
