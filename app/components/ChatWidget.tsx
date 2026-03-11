"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

const suggestions = [
  "What projects has Darshan built?",
  "What cybersecurity tools does he use?",
  "Tell me about his certifications",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm Darshan's AI assistant. Ask me anything about his skills, projects, or experience." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Could not reach the server." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function sendSuggestion(text: string) {
    setInput(text);
    const fakeEvent = { preventDefault: () => {} } as FormEvent;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    })
      .then((res) => res.json())
      .then((data) => {
        const reply = data.reply || data.error || "Something went wrong.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply, sources: data.sources },
        ]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Could not reach the server." },
        ]);
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle chat"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] text-[#0A0F1C] shadow-lg shadow-[#00E5FF]/20 transition-transform hover:scale-110"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-96 flex-col overflow-hidden rounded-2xl border border-[#00E5FF]/20 bg-[#0A0F1C] shadow-2xl shadow-[#00E5FF]/5"
          >
            {/* Header */}
            <div className="border-b border-white/5 bg-[#111827] px-4 py-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
              <span className="text-sm font-semibold text-[#E6F1FF]">Ask About Darshan</span>
              <span className="ml-auto text-[10px] text-[#8892B0] font-mono">RAG-powered</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-gradient-to-r from-[#00E5FF]/20 to-[#7B61FF]/20 text-[#E6F1FF] border border-[#00E5FF]/10"
                      : "bg-[#111827] text-[#E6F1FF]/90 border border-white/5"
                  }`}
                >
                  {m.content}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {m.sources.map((s, j) => (
                        <span
                          key={j}
                          className="inline-block rounded-full bg-[#00E5FF]/10 px-2 py-0.5 text-[10px] font-medium text-[#00E5FF]/80"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="max-w-[85%] rounded-xl bg-[#111827] border border-white/5 px-3 py-2 text-sm text-[#00E5FF]/60">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce">●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>●</span>
                    <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>●</span>
                  </span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions (only when 1 message) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendSuggestion(s)}
                    className="rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/5 px-3 py-1 text-xs text-[#00E5FF] transition-colors hover:bg-[#00E5FF]/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-white/5 bg-[#111827] px-3 py-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something…"
                className="flex-1 rounded-lg border border-white/10 bg-[#0A0F1C] px-3 py-2 text-sm text-[#E6F1FF] outline-none placeholder:text-[#8892B0]/50 focus:border-[#00E5FF]/30"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] px-3 py-2 text-sm font-medium text-[#0A0F1C] transition-opacity disabled:opacity-30"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
