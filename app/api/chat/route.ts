import { NextRequest, NextResponse } from "next/server";

const RAG_BACKEND = process.env.RAG_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${RAG_BACKEND}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `RAG backend error: ${detail}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      reply: data.reply,
      sources: data.sources || [],
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the RAG backend. Make sure rag_server.py is running." },
      { status: 502 }
    );
  }
}
