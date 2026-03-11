"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";

interface TerminalLine {
  type: "prompt" | "output" | "system";
  command?: string;
  text: string;
  section?: string;
}

const WELCOME_LINES: TerminalLine[] = [
  { type: "system", text: "╔══════════════════════════════════════════════════════╗" },
  { type: "system", text: "║     Darshan U — Interactive Portfolio Terminal       ║" },
  { type: "system", text: "║     Type any question to ask AI about Darshan        ║" },
  { type: "system", text: "║     Commands: help, clear, about, skills, projects   ║" },
  { type: "system", text: "╚══════════════════════════════════════════════════════╝" },
  { type: "output", text: "" },
];

const QUICK_COMMANDS: Record<string, string> = {
  help: "Available commands:\n  about       — Who is Darshan?\n  skills      — Technical skills\n  projects    — Project portfolio\n  certs       — Certifications\n  experience  — Work experience\n  contact     — Get in touch\n  clear       — Clear terminal\n  Or just type any question!",
  about: "Who is Darshan?",
  skills: "What are Darshan's technical skills?",
  projects: "What projects has Darshan built?",
  certs: "What certifications does Darshan have?",
  experience: "Tell me about Darshan's work experience",
  contact: "How can I contact Darshan?",
};

export default function RAGTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME_LINES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  function addLines(newLines: TerminalLine[]) {
    setLines((prev) => [...prev, ...newLines]);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd || loading) return;

    setInput("");
    setHistory((prev) => [cmd, ...prev]);
    setHistoryIdx(-1);

    // Add the prompt line
    addLines([{ type: "prompt", command: cmd, text: "" }]);

    // Handle "clear"
    if (cmd.toLowerCase() === "clear") {
      setLines(WELCOME_LINES);
      return;
    }

    // Handle "help" — show directly
    if (cmd.toLowerCase() === "help") {
      const helpText = QUICK_COMMANDS["help"];
      addLines(
        helpText.split("\n").map((line) => ({ type: "output" as const, text: line }))
      );
      return;
    }

    // If it's a shortcut command, convert to a question
    const query = QUICK_COMMANDS[cmd.toLowerCase()] || cmd;

    setLoading(true);
    addLines([{ type: "system", text: "  ⟳ querying AI..." }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "No response.";
      const sources: string[] = data.sources || [];

      // Remove the "querying AI..." line and add response
      setLines((prev) => {
        const filtered = prev.filter((l) => l.text !== "  ⟳ querying AI...");
        const responseLines: TerminalLine[] = reply
          .split("\n")
          .map((line: string) => ({
            type: "output" as const,
            text: "  " + line,
          }));

        if (sources.length > 0) {
          responseLines.push({
            type: "system" as const,
            text: "  ── sources: " + sources.map((s: string) => `[${s}]`).join(" "),
          });
        }

        responseLines.push({ type: "output" as const, text: "" });
        return [...filtered, ...responseLines];
      });
    } catch {
      setLines((prev) => {
        const filtered = prev.filter((l) => l.text !== "  ⟳ querying AI...");
        return [
          ...filtered,
          { type: "output", text: "  ✗ Could not reach the AI server." },
          { type: "output", text: "" },
        ];
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="w-full max-w-2xl rounded-xl border border-[#00E5FF]/20 bg-[#0A0F1C]/95 shadow-2xl shadow-[#00E5FF]/5 backdrop-blur-sm overflow-hidden cursor-text"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#111827] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="ml-3 font-mono text-xs text-[#8892B0]">
          darshan@portfolio — AI Terminal
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
          <span className="font-mono text-[10px] text-[#00FFA3]/70">ONLINE</span>
        </div>
      </div>

      {/* Terminal body */}
      <div className="h-80 overflow-y-auto p-4 font-mono text-sm leading-relaxed scrollbar-thin">
        {lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line.type === "prompt" ? (
              <div>
                <span className="text-[#00FFA3]">Darshan</span>
                <span className="text-[#E6F1FF]">@</span>
                <span className="text-[#00E5FF]">portfolio</span>
                <span className="text-[#8892B0]">:~$ </span>
                <span className="text-[#E6F1FF]">{line.command}</span>
              </div>
            ) : line.type === "system" ? (
              <div className="text-[#00E5FF]/60">{line.text}</div>
            ) : (
              <div className="text-[#E6F1FF]/90">{line.text}</div>
            )}
          </div>
        ))}

        {/* Active input line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-[#00FFA3]">Darshan</span>
          <span className="text-[#E6F1FF]">@</span>
          <span className="text-[#00E5FF]">portfolio</span>
          <span className="text-[#8892B0]">:~$ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
            className="flex-1 bg-transparent text-[#E6F1FF] outline-none caret-[#00E5FF] disabled:opacity-50 placeholder:text-[#8892B0]/30"
            placeholder={loading ? "processing..." : "type a command or question..."}
            spellCheck={false}
            autoComplete="off"
          />
        </form>

        <div ref={bottomRef} />
      </div>

      {/* Quick commands bar */}
      <div className="flex flex-wrap gap-2 border-t border-white/5 bg-[#111827]/50 px-4 py-2">
        {["about", "skills", "projects", "certs", "contact"].map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setInput(cmd);
              inputRef.current?.focus();
            }}
            className="rounded border border-white/5 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[#8892B0] transition-all hover:border-[#00E5FF]/30 hover:text-[#00E5FF]"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}
