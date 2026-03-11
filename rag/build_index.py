"""
Build the FAISS vector index from the RAG profile data.
Run this script whenever you update darshan_rag_profile.txt.

Uses section-aware chunking: each chunk gets a metadata "section" tag
(e.g. PROJECTS, EDUCATION, SKILLS) so the retriever knows the category.

Usage:
    python build_index.py
"""

import json
import re
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

PROFILE_PATH = Path(__file__).parent / "darshan_rag_profile.txt"
INDEX_DIR = Path(__file__).parent / "faiss_index"
CHUNKS_PATH = Path(__file__).parent / "chunks.json"

SECTION_RE = re.compile(r"^==\s*(.+?)\s*==$", re.MULTILINE)


def parse_sections(text: str) -> list[dict]:
    """Split text by == SECTION == headers, returning (section_name, content) pairs."""
    matches = list(SECTION_RE.finditer(text))
    sections = []
    for i, m in enumerate(matches):
        name = m.group(1).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        content = text[start:end].strip()
        if content:
            sections.append({"section": name, "content": content})
    return sections


def build():
    text = PROFILE_PATH.read_text(encoding="utf-8")
    if not text.strip():
        raise SystemExit("ERROR: darshan_rag_profile.txt is empty. Add your data first.")

    # ── 1. Section-aware splitting ────────────────────────────
    sections = parse_sections(text)
    print(f"Found {len(sections)} sections")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=400,
        chunk_overlap=60,
        separators=["\n\n", "\nProject: ", "\n- ", "\n", ". ", " "],
    )

    all_docs: list[Document] = []
    for sec in sections:
        chunks = splitter.split_text(sec["content"])
        for chunk in chunks:
            # Prefix each chunk with section name for better retrieval
            tagged_text = f"[{sec['section']}] {chunk}"
            doc = Document(
                page_content=tagged_text,
                metadata={"section": sec["section"]},
            )
            all_docs.append(doc)

    print(f"Split into {len(all_docs)} chunks across {len(sections)} sections")

    # ── 2. Save raw chunks to JSON (for BM25 at query time) ──
    chunk_data = [
        {"text": doc.page_content, "section": doc.metadata["section"]}
        for doc in all_docs
    ]
    CHUNKS_PATH.write_text(json.dumps(chunk_data, indent=2), encoding="utf-8")
    print(f"Saved chunk data to {CHUNKS_PATH}")

    # ── 3. Build FAISS index ─────────────────────────────────
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
    )

    vectorstore = FAISS.from_documents(all_docs, embeddings)
    vectorstore.save_local(str(INDEX_DIR))
    print(f"FAISS index saved to {INDEX_DIR}")

    # ── 4. Preview chunks ────────────────────────────────────
    print("\n── Chunk preview ──")
    for i, doc in enumerate(all_docs):
        sec = doc.metadata["section"]
        preview = doc.page_content[:80].replace("\n", " ")
        print(f"  [{i:2d}] ({sec:30s}) {preview}...")


if __name__ == "__main__":
    build()
