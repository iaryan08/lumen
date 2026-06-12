import chromadb
from chromadb.utils import embedding_functions

# Initialize a persistent client, data will be saved in backend/chroma_db
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# This will automatically download and use the sentence-transformer model
default_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

def embed_chunks(chunks: list, collection_name: str, metadatas: list = None):
    """
    Embeds the given chunks and stores them in ChromaDB.
    """
    if not chunks:
        return
        
    collection = chroma_client.get_or_create_collection(
        name=collection_name, 
        embedding_function=default_ef
    )
    
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    
    if not metadatas:
        metadatas = [{"source": "unknown"} for _ in chunks]
        
    # We clear the collection if we are just testing to prevent infinite growth
    if collection_name == "test_collection":
        # simple way to "reset" the test collection
        try:
            chroma_client.delete_collection("test_collection")
            collection = chroma_client.create_collection(
                name="test_collection",
                embedding_function=default_ef
            )
        except Exception:
            pass
            
    collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )
