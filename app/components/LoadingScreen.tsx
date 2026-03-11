"use client";

import { useState, useEffect } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);

  const phases = [
    "INITIALIZING SYSTEM...",
    "LOADING 3D ENVIRONMENT...",
    "CONNECTING RAG PIPELINE...",
    "ESTABLISHING SECURE LINK...",
    "RENDERING WORKSPACE...",
    "SYSTEM ONLINE",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.8 + Math.random() * 1.2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setVisible(false);
            setTimeout(onComplete, 600);
          }, 400);
          return 100;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const idx = Math.min(Math.floor(progress / 18), phases.length - 1);
    setPhase(idx);
  }, [progress, phases.length]);

  if (!visible) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0A0F1C] transition-opacity duration-600 opacity-0 pointer-events-none" />
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0F1C] transition-opacity duration-600">
      {/* Scan lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.08) 2px, rgba(0,229,255,0.08) 4px)",
        }}
      />

      {/* Corner decorations */}
      {[
        "top-6 left-6 border-t-2 border-l-2",
        "top-6 right-6 border-t-2 border-r-2",
        "bottom-6 left-6 border-b-2 border-l-2",
        "bottom-6 right-6 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-8 h-8 border-[#00E5FF]/30 ${cls}`} />
      ))}

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Glitch title */}
        <div className="relative">
          <h1 className="font-mono text-4xl font-bold tracking-[0.3em] text-[#00E5FF]">
            DARSHAN U
          </h1>
          <p className="mt-2 text-center font-mono text-xs tracking-[0.5em] text-[#8892B0]">
            CYBERSECURITY ENGINEER
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-80 space-y-3">
          <div className="h-[2px] w-full overflow-hidden bg-[#1a1f35]">
            <div
              className="h-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-[#00E5FF]/70">{phases[phase]}</span>
            <span className="text-[#8892B0]">{Math.floor(progress)}%</span>
          </div>
        </div>

        {/* System log lines */}
        <div className="w-80 space-y-1 font-mono text-[10px] text-[#8892B0]/50">
          {progress > 10 && <p>[SYS] Three.js renderer initialized</p>}
          {progress > 30 && <p>[SYS] FAISS vector store loaded (20 chunks)</p>}
          {progress > 50 && <p>[SYS] LLM connection verified</p>}
          {progress > 70 && <p>[SYS] Hologram shader compiled</p>}
          {progress > 90 && <p className="text-[#00FFA3]/70">[SYS] All systems nominal</p>}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between font-mono text-[10px] text-[#8892B0]/40">
        <span>SEC_LEVEL: CLASSIFIED</span>
        <span>NODE: PORTFOLIO-01</span>
        <span>PROTOCOL: HTTPS/TLS 1.3</span>
      </div>
    </div>
  );
}
