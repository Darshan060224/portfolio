"""Quick test of the hybrid retrieval pipeline."""
import json
import re
import numpy as np
from pathlib import Path
from rank_bm25 import BM25Okapi
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

emb = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vs = FAISS.load_local("faiss_index", emb, allow_dangerous_deserialization=True)

chunks = json.loads(Path("chunks.json").read_text(encoding="utf-8"))
corpus = [c["text"] for c in chunks]


def tokenize(text):
    text = re.sub(r"[\[\](){}:,;!?\"'\u2013\u2014/]", " ", text.lower())
    stopwords = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for",
                 "of", "and", "or", "with", "by", "from", "as", "it", "this", "that", "he",
                 "his", "has", "have", "had", "does", "do", "did", "be", "been", "being"}
    return [w for w in text.split() if w and w not in stopwords]


bm25 = BM25Okapi([tokenize(d) for d in corpus])

SECTION_KEYWORDS = {
    "PERSONAL INFORMATION": ["name", "email", "phone", "contact", "linkedin", "github"],
    "ABOUT DARSHAN": ["about", "who is", "tell me about", "introduction", "background"],
    "EDUCATION": ["education", "college", "university", "degree", "gpa", "cgpa", "school", "study"],
    "PROFESSIONAL EXPERIENCE": ["experience", "intern", "work", "job", "blackperl"],
    "TECHNICAL SKILLS": ["skill", "tool", "nmap", "burp", "metasploit", "wireshark", "splunk", "cybersecurity tool"],
    "DEVELOPMENT SKILLS": ["react", "node", "frontend", "backend", "database", "docker", "development"],
    "PROJECTS": ["project", "timescope", "fepd", "vaultcraft", "nodelink", "built", "created"],
    "CERTIFICATIONS": ["certification", "certificate", "fortinet", "google", "cisco", "ec-council"],
    "HANDS-ON LEARNING PLATFORMS": ["tryhackme", "hackviser", "lab", "platform", "hands-on"],
}


def detect_sections(query):
    ql = query.lower()
    return [sec for sec, kws in SECTION_KEYWORDS.items() if any(kw in ql for kw in kws)]


def hybrid_retrieve(query, k=6):
    scored = {}
    for q in [query, f"Darshan {query}"]:
        for doc, score in vs.similarity_search_with_score(q, k=k + 2):
            t = doc.page_content
            sim = 1.0 / (1.0 + score)
            scored[t] = max(scored.get(t, 0), sim)

    bm25_scores = bm25.get_scores(tokenize(query))
    for idx in np.argsort(bm25_scores)[::-1][:k + 2]:
        if bm25_scores[idx] > 0:
            t = corpus[idx]
            norm = bm25_scores[idx] / (bm25_scores[idx] + 1.0)
            scored[t] = max(scored.get(t, 0), norm * 0.8)

    for sec in detect_sections(query):
        for t in scored:
            if f"[{sec}]" in t:
                scored[t] += 0.15

    return sorted(scored.items(), key=lambda x: x[1], reverse=True)[:k]


queries = [
    "What certifications does Darshan have?",
    "Tell me about VaultCraft",
    "What are Darshan's skills?",
    "Where does Darshan study?",
    "What projects has Darshan built?",
]

for q in queries:
    print(f"\n{'='*60}")
    print(f"Q: {q}")
    print(f"Detected sections: {detect_sections(q)}")
    print("-" * 60)
    results = hybrid_retrieve(q)
    for i, (text, score) in enumerate(results):
        sec_tag = text.split("]")[0].replace("[", "") if "]" in text else "?"
        preview = text[:80].replace("\n", " ")
        print(f"  {i+1}. [{sec_tag:25s}] score={score:.3f} | {preview}")

print("\nHybrid retrieval test complete.")
