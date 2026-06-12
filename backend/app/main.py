from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from pydantic import BaseModel
from app.services.ingestion import ingest_text
from app.services.chunking import chunk_text
from app.services.embeddings import embed_chunks
from app.services.retrieval import retrieve_chunks
from app.services.generation import generate_answer

app = FastAPI(title="Lumen Core API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)
class TestRequest(BaseModel):
    text: str
    query: str

@app.get("/")
def read_root():
    return {"status": "Lumen Backend Running"}

@app.post("/test-pipeline")
def test_pipeline(req: TestRequest):
    # 1. Ingestion
    normalized_text = ingest_text(req.text)
    
    # 2. Chunking
    chunks = chunk_text(normalized_text)
    
    # 3. Embedding and Storage
    # For testing, we might use a temporary collection
    collection_name = "test_collection"
    embed_chunks(chunks, collection_name)
    
    # 4. Retrieval
    retrieved = retrieve_chunks(req.query, collection_name, top_k=2)
    
    # 5. Generation
    answer = generate_answer(req.query, retrieved)
    
    return {
        "query": req.query,
        "answer": answer,
        "retrieved_chunks": retrieved
    }
