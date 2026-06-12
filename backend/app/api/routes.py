from fastapi import APIRouter, File, UploadFile, Form
from pydantic import BaseModel
import os
import tempfile
import uuid

from app.services.ingestion import ingest_text
from app.services.chunking import chunk_text
from app.services.embeddings import embed_chunks
from app.services.retrieval import retrieve_chunks
from app.services.generation import generate_answer
from app.modes.study import parse_document
from app.modes.code_review import parse_diff

router = APIRouter()

collections_db = {}

class QueryRequest(BaseModel):
    collection_id: str
    question: str

@router.post("/ingest/document")
async def ingest_document(collection_name: str = Form(...), file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp:
        content = await file.read()
        temp.write(content)
        temp_path = temp.name

    try:
        raw_text = parse_document(temp_path, file.filename)
        normalized = ingest_text(raw_text)
        chunks = chunk_text(normalized)
        
        collection_id = collection_name.lower().replace(" ", "_") + "_" + str(uuid.uuid4())[:8]
        
        metadatas = [{"source": file.filename} for _ in chunks]
        embed_chunks(chunks, collection_id, metadatas)
        
        collections_db[collection_id] = {
            "name": collection_name,
            "id": collection_id,
            "document": file.filename
        }
        
        return {"status": "success", "collection_id": collection_id, "chunks_processed": len(chunks)}
    finally:
        os.remove(temp_path)

@router.get("/collections")
def list_collections():
    return {"collections": list(collections_db.values())}

@router.post("/query")
def query_collection(req: QueryRequest):
    retrieved = retrieve_chunks(req.question, req.collection_id, top_k=3)
    if not retrieved:
        return {"answer": "No context found or collection does not exist.", "citations": []}
        
    answer = generate_answer(req.question, retrieved)
    citations = [{"text": chunk, "source": "uploaded_doc"} for chunk in retrieved]
    
    return {
        "answer": answer,
        "citations": citations
    }

@router.delete("/collections/{collection_id}")
def delete_collection(collection_id: str):
    if collection_id in collections_db:
        del collections_db[collection_id]
        return {"status": "success"}
    return {"status": "error", "message": "not found"}

@router.post("/ingest/diff")
async def ingest_diff(collection_name: str = Form(...), file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".patch") as temp:
        content = await file.read()
        temp.write(content)
        temp_path = temp.name

    try:
        chunks = parse_diff(temp_path)
        if chunks and len(chunks) > 0 and "Error" in chunks[0]:
            return {"status": "error", "message": chunks[0]}
            
        collection_id = collection_name.lower().replace(" ", "_") + "_" + str(uuid.uuid4())[:8]
        
        metadatas = [{"source": file.filename} for _ in chunks]
        embed_chunks(chunks, collection_id, metadatas)
        
        collections_db[collection_id] = {
            "name": collection_name,
            "id": collection_id,
            "document": file.filename
        }
        
        return {"status": "success", "collection_id": collection_id, "chunks_processed": len(chunks)}
    finally:
        os.remove(temp_path)
