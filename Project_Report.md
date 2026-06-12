# Project Report: Lumen - AI Knowledge & Code Insight Assistant

**Student Names:** Aryan Mehra, Sahil  
**Enrollment/Roll Nos:** 23115025, 23115127  
**Emails:** aryan_m@ee.iitr.ac.in, sahil1@ee.iitr.ac.in  
**Project Domain:** Technology  

---

## 1. Abstract
**Lumen** is a dual-mode, full-stack Artificial Intelligence assistant built on a shared Retrieval-Augmented Generation (RAG) pipeline. The system provides two primary modes of operation:
1. **Study Mode**: A conversational interface that allows users to chat with their own documents, notes, and PDFs, featuring inline citations to source texts.
2. **Code Mode**: An AI-powered Pull Request (PR) and diff summarizer that analyzes codebase changes to generate reviews, identify risks, and offer plain-English summaries.

By leveraging a shared backend abstraction for ingestion, chunking, embedding, retrieval, and LLM generation, Lumen demonstrates robust system design and resource efficiency.

## 2. Technology Stack
The application is structured as a decoupled frontend-backend architecture:
- **Backend Environment:** Python, FastAPI
- **Vector Database:** ChromaDB (Local, file-based for privacy and zero infrastructure overhead)
- **Embeddings:** `sentence-transformers` (`all-MiniLM-L6-v2`) 
- **Large Language Model (LLM):** Anthropic Claude 3.5 Sonnet (via API) with extensible fallback capabilities.
- **Frontend Framework:** Next.js (TypeScript), Tailwind CSS, shadcn/ui.
- **Data Parsers:** `GitPython`, `unidiff`, `pypdf`, `markdown`.

## 3. System Architecture & The RAG Pipeline
The core of Lumen is its mode-agnostic RAG pipeline. Rather than building separate systems for document querying and code analysis, Lumen centralizes the following 5-step pipeline:

1. **Ingestion Service**: Accepts heterogeneous inputs (PDFs, Markdown notes, Git diffs) and normalizes them into plain text.
2. **Chunking Service**: Implements sliding-window algorithms to segment text into context-rich chunks (e.g., 500 tokens with 50-token overlaps) to preserve semantic meaning.
3. **Embedding Service**: Converts text chunks into high-dimensional vector representations using Sentence Transformers and persists them alongside metadata in ChromaDB.
4. **Retrieval Service**: Processes user queries, converting them into vectors to execute a similarity search (Cosine Similarity/L2) within ChromaDB, retrieving the top-K most relevant chunks.
5. **Generation Service**: Constructs a dynamic prompt containing the retrieved context and the user's query, invoking the LLM to synthesize an accurate, hallucination-free response complete with citations.

## 4. Implementation Details
The project features a highly decoupled and modular service architecture:
- **FastAPI Core**: The backend entry point exposes robust endpoints for document ingestion, query processing, and code diff analysis.
- **Data Parsers**: Custom parsing logic handles various file types, seamlessly converting PDF bytes and markdown files into structured text for the RAG engine.
- **Vector Search Engine**: ChromaDB acts as the local knowledge base, guaranteeing data privacy while providing rapid, hardware-accelerated similarity search.
- **Context-Aware Generation**: By dynamically injecting retrieved documents into the LLM context window, Lumen minimizes hallucinations and provides direct citations to the source text.

## 5. Conclusion
Lumen provides a scalable, privacy-respecting (via local vector storage), and highly modular approach to AI-assisted learning and software development. The shared RAG architecture ensures that adding new data modalities in the future (e.g., audio transcripts, video captions) will only require writing a new ingestion adapter, without altering the underlying search and generation pipeline.
