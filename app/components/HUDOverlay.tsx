"use client";

import { useState, useEffect } from "react";

export default function HUDOverlay() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setDate(
        now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none font-mono select-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
        {/* Left — Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00FFA3] animate-pulse" />
            <span className="text-[11px] text-[#00FFA3]/80 tracking-wider">SYSTEM ACTIVE</span>
          </div>
          <span className="text-[10px] text-[#8892B0]/40">|</span>
          <span className="text-[10px] text-[#8892B0]/60 tracking-widest">DARSHAN U</span>
        </div>

        {/* Center — Title */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-[10px] tracking-[0.4em] text-[#00E5FF]/50">PORTFOLIO COMMAND CENTER</span>
          <div className="mt-1 h-[1px] w-40 bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent" />
        </div>

        {/* Right — Time */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-[#8892B0]/50">{date}</span>
          <span className="text-[11px] text-[#00E5FF]/70 tabular-nums">{time}</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4 text-[10px] text-[#8892B0]/40">
          <span>SCROLL TO EXPLORE</span>
          <span>|</span>
          <span>CLICK OBJECTS TO INTERACT</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-[#8892B0]/40">
          <span>FPS: 60</span>
          <span>|</span>
          <span>3D ENGINE: THREE.js</span>
          <span>|</span>
          <span>AI: RAG + LLM</span>
        </div>
      </div>

      {/* Corner brackets */}
      {/* Top-left */}
      <div className="absolute top-12 left-4 w-6 h-6 border-l border-t border-[#00E5FF]/15" />
      {/* Top-right */}
      <div className="absolute top-12 right-4 w-6 h-6 border-r border-t border-[#00E5FF]/15" />
      {/* Bottom-left */}
      <div className="absolute bottom-12 left-4 w-6 h-6 border-l border-b border-[#00E5FF]/15" />
      {/* Bottom-right */}
      <div className="absolute bottom-12 right-4 w-6 h-6 border-r border-b border-[#00E5FF]/15" />

      {/* Left side mini-panel */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-3">
        {[
          { label: "SEC", value: "ACTIVE", color: "#00FFA3" },
          { label: "NET", value: "ONLINE", color: "#00E5FF" },
          { label: "CPU", value: "42%", color: "#7B61FF" },
          { label: "MEM", value: "2.1G", color: "#FFBD2E" },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] tracking-wider text-[#8892B0]/40">{label}</span>
            <span className="text-[9px] tracking-wider" style={{ color: `${color}88` }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.06) 2px, rgba(0,229,255,0.06) 4px)",
        }}
      />
    </div>
  );
}
