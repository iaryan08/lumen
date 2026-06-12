import os

def parse_document(file_path: str, filename: str) -> str:
    """
    Parses a document (PDF, TXT, MD) into raw text for ingestion.
    """
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == ".pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text
        except ImportError:
            return "Please install pypdf to read PDFs."
    else:
        # Fallback to plain text / markdown
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
