import os
import google.generativeai as genai

def generate_answer(query: str, retrieved_chunks: list) -> str:
    """
    Generates an answer using the retrieved context.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    context = "\n\n---\n\n".join(retrieved_chunks)
    
    if not api_key:
        return f"[MOCK GENERATION - Set GEMINI_API_KEY to enable LLM]\nContext used:\n{context}\n\nMock answer to: '{query}'"
        
    genai.configure(api_key=api_key)
    
    prompt = f"""You are an AI assistant. Use the following retrieved context to answer the user's question.
    
Context:
{context}

Question: {query}
"""
    try:
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error calling Gemini API: {str(e)}"
