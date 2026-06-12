def ingest_text(raw_input: str) -> str:
    """
    Normalizes the raw input into plain text.
    For Phase 1 MVP, we just clean up the whitespace.
    """
    return raw_input.strip()
