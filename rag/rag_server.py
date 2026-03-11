"""
RAG FastAPI server — high-quality retrieval pipeline.

Pipeline:
  1. Multi-query expansion (rephrase user question 3 ways)
  2. FAISS semantic search (embedding similarity)
  3. BM25 keyword search (exact term matching)
  4. Merge + deduplicate + re-rank results
  5. Send top context to local LLM via Ollama

Uses local Ollama LLM (no API key needed).
Embeddings: all-MiniLM-L6-v2 (runs locally via sentence-transformers).

Usage:
    python rag_server.py          # starts on port 8000
"""

import json
import re
from pathlib import Path

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rank_bm25 import BM25Okapi

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

INDEX_DIR = Path(__file__).parent / "faiss_index"
CHUNKS_PATH = Path(__file__).parent / "chunks.json"

# ── FastAPI app ───────────────────────────────────────────────
app = FastAPI(title="Portfolio RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# ── Load FAISS + embeddings ──────────────────────────────────
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
)

if not INDEX_DIR.exists():
    raise SystemExit("FAISS index not found. Run `python build_index.py` first.")

vectorstore = FAISS.load_local(
    str(INDEX_DIR), embeddings, allow_dangerous_deserialization=True
)

# ── Load BM25 keyword index ─────────────────────────────────
if not CHUNKS_PATH.exists():
    raise SystemExit("chunks.json not found. Run `python build_index.py` first.")

chunk_data = json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))
corpus_texts = [c["text"] for c in chunk_data]
corpus_sections = [c["section"] for c in chunk_data]


def tokenize(text: str) -> list[str]:
    """Clean tokenizer: lowercase, strip brackets/punctuation, remove stopwords."""
    text = re.sub(r"[\[\](){}:,;!?\"'–—/]", " ", text.lower())
    stopwords = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for",
                 "of", "and", "or", "with", "by", "from", "as", "it", "this", "that", "he",
                 "his", "has", "have", "had", "does", "do", "did", "be", "been", "being"}
    return [w for w in text.split() if w and w not in stopwords]


tokenized_corpus = [tokenize(doc) for doc in corpus_texts]
bm25 = BM25Okapi(tokenized_corpus)

# ── Local LLM via Ollama ─────────────────────────────────────
llm = ChatOllama(model="llama3.2", temperature=0.3)

# ── Section keyword map (helps route queries) ────────────────
SECTION_KEYWORDS = {
    "PERSONAL INFORMATION": ["name", "email", "phone", "contact", "linkedin", "github", "location", "born", "birthday", "age"],
    "ABOUT DARSHAN": ["about", "who is", "tell me about", "introduction", "background", "summary"],
    "EDUCATION": ["education", "college", "university", "degree", "gpa", "cgpa", "school", "semester", "study"],
    "PROFESSIONAL EXPERIENCE": ["experience", "intern", "work", "job", "company", "blackperl"],
    "TECHNICAL SKILLS": ["skill", "tool", "nmap", "burp", "metasploit", "wireshark", "splunk", "elk", "siem", "cybersecurity tool"],
    "DEVELOPMENT SKILLS": ["react", "node", "frontend", "backend", "database", "docker", "typescript", "javascript", "angular", "mongodb", "sql", "redis", "development"],
    "CYBERSECURITY INTERESTS": ["interest", "soc", "vapt", "dfir", "forensic", "threat", "malware", "blockchain"],
    "PROJECTS": ["project", "timescope", "fepd", "vaultcraft", "nodelink", "portfolio", "built", "created", "developed"],
    "CERTIFICATIONS": ["certification", "certificate", "fortinet", "google", "cisco", "ec-council", "palo alto", "advent"],
    "HANDS-ON LEARNING PLATFORMS": ["tryhackme", "hackviser", "lab", "platform", "hands-on", "practice", "ranking"],
    "CONTACT": ["contact", "reach", "email", "hire"],
}


def detect_relevant_sections(query: str) -> list[str]:
    """Detect which sections are most relevant to a query based on keywords."""
    query_lower = query.lower()
    matched = []
    for section, keywords in SECTION_KEYWORDS.items():
        if any(kw in query_lower for kw in keywords):
            matched.append(section)
    return matched


def expand_queries(query: str) -> list[str]:
    """Generate query variations for better recall."""
    q = query.strip()
    queries = [q]
    # Add a "tell me about" version
    queries.append(f"Darshan {q}")
    # Add a more specific version
    if "?" in q:
        queries.append(q.replace("?", "").strip())
    else:
        queries.append(f"What is Darshan's {q}?")
    return queries


def hybrid_retrieve(query: str, k: int = 8) -> list[str]:
    """
    Hybrid retrieval: FAISS (semantic) + BM25 (keyword) + section boost.
    Returns deduplicated, re-ranked chunks.
    """
    queries = expand_queries(query)
    relevant_sections = detect_relevant_sections(query)

    # ── FAISS semantic search (across all query variants) ────
    seen_texts: set[str] = set()
    scored: dict[str, float] = {}

    for q in queries:
        results = vectorstore.similarity_search_with_score(q, k=k + 2)
        for doc, score in results:
            text = doc.page_content
            if text not in scored:
                scored[text] = 0.0
            # FAISS returns L2 distance — lower is better, invert for ranking
            similarity = 1.0 / (1.0 + score)
            scored[text] = max(scored[text], similarity)

    # ── BM25 keyword search ──────────────────────────────────
    tokenized_query = tokenize(query)
    bm25_scores = bm25.get_scores(tokenized_query)
    top_bm25_indices = np.argsort(bm25_scores)[::-1][:k + 2]

    for idx in top_bm25_indices:
        if bm25_scores[idx] > 0:
            text = corpus_texts[idx]
            bm25_norm = bm25_scores[idx] / (bm25_scores[idx] + 1.0)  # normalize to 0-1
            if text not in scored:
                scored[text] = 0.0
            scored[text] = max(scored[text], bm25_norm * 0.8)  # weight BM25 slightly lower

    # ── Section boost + inject missing section chunks ─────────
    if relevant_sections:
        # Ensure all chunks from detected sections are candidates
        for i, text in enumerate(corpus_texts):
            if corpus_sections[i] in relevant_sections and text not in scored:
                scored[text] = 0.3  # baseline score for section-matched chunks

        for text in scored:
            for sec in relevant_sections:
                if f"[{sec}]" in text:
                    scored[text] += 0.25  # strong boost for matching sections

    # ── Sort by score, deduplicate, return top k ─────────────
    ranked = sorted(scored.items(), key=lambda x: x[1], reverse=True)
    results = [text for text, _ in ranked[:k]]
    return results


SYSTEM_PROMPT = """\
You are an AI assistant on Darshan U's portfolio website. Answer the visitor's question using the context below.

IMPORTANT: The context below contains real information about Darshan. Read it carefully and use it to answer.

Context:
---
{context}
---

Instructions:
- Answer based on the context above. The information IS there — read it carefully.
- Be concise (2-4 sentences) unless listing items.
- Use bullet points for lists.
- Refer to Darshan in third person.
- If truly not in context, say so.
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{question}"),
])


# ── Request / Response models ────────────────────────────────
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[str]


# ── Endpoints ─────────────────────────────────────────────────
@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Retrieve relevant chunks
    chunks = hybrid_retrieve(req.message, k=6)
    context = "\n\n---\n\n".join(chunks)

    # 2. Extract source sections for attribution
    section_re = re.compile(r"^\[(.+?)\]")
    sources = list(dict.fromkeys(
        section_re.match(c).group(1) for c in chunks if section_re.match(c)
    ))

    # 3. Generate answer
    chain = prompt | llm | StrOutputParser()
    answer = await chain.ainvoke({"context": context, "question": req.message})

    return ChatResponse(reply=answer, sources=sources)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/debug")
async def debug(req: ChatRequest):
    """Debug endpoint: shows retrieved chunks without LLM generation."""
    chunks = hybrid_retrieve(req.message, k=6)
    section_re = re.compile(r"^\[(.+?)\]")
    sources = list(dict.fromkeys(
        section_re.match(c).group(1) for c in chunks if section_re.match(c)
    ))
    return {"query": req.message, "sources": sources, "chunks": chunks}


# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
