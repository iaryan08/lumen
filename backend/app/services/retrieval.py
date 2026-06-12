from app.services.embeddings import chroma_client, default_ef

def retrieve_chunks(query: str, collection_name: str, top_k: int = 3) -> list:
    """
    Retrieves the most relevant chunks for a given query.
    """
    try:
        collection = chroma_client.get_collection(
            name=collection_name,
            embedding_function=default_ef
        )
    except Exception:
        # Collection doesn't exist
        return []

    results = collection.query(
        query_texts=[query],
        n_results=top_k
    )
    
    if results["documents"] and len(results["documents"]) > 0:
        return results["documents"][0]
    return []
