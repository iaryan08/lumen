import sys
import os

# Ensure the app module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ingestion import ingest_text
from app.services.chunking import chunk_text
from app.services.embeddings import embed_chunks
from app.services.retrieval import retrieve_chunks
from app.services.generation import generate_answer

def test_pipeline():
    print("Testing Phase 1 Pipeline...")
    
    sample_text = """
    Lumen is an AI assistant with two modes: Study Mode and Code Mode.
    Study Mode helps you chat with your documents and PDFs.
    Code Mode acts as a PR summarizer and code reviewer.
    The backend is built with FastAPI, ChromaDB, and Python.
    The frontend is built with Next.js, Tailwind CSS, and shadcn/ui.
    """
    
    print("1. Ingestion...")
    normalized = ingest_text(sample_text)
    
    print("2. Chunking...")
    # chunk very small to force multiple chunks for this short text
    chunks = chunk_text(normalized, chunk_size=100, overlap=20)
    print(f"Created {len(chunks)} chunks.")
    
    print("3. Embedding & Storing...")
    collection_name = "test_collection"
    embed_chunks(chunks, collection_name)
    
    print("4. Retrieving...")
    query = "What framework is the frontend built with?"
    retrieved = retrieve_chunks(query, collection_name, top_k=2)
    print(f"Retrieved {len(retrieved)} chunks.")
    
    print("5. Generating Answer...")
    answer = generate_answer(query, retrieved)
    print("\n--- Final Answer ---")
    print(answer)

if __name__ == "__main__":
    test_pipeline()
