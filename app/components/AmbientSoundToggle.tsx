"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export default function AmbientSoundToggle() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);

  const start = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = 0.03;
    gain.connect(ctx.destination);
    gainRef.current = gain;

    // Create a soft ambient drone with layered oscillators
    const freqs = [55, 82.5, 110, 165];
    const oscs: OscillatorNode[] = [];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;

      const oscGain = ctx.createGain();
      oscGain.gain.value = i === 0 ? 0.4 : 0.15;
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      oscs.push(osc);
    });

    nodesRef.current = oscs;
    setPlaying(true);
  }, []);

  const stop = useCallback(() => {
    nodesRef.current.forEach((osc) => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    nodesRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    gainRef.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return (
    <button
      onClick={() => (playing ? stop() : start())}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-[#00E5FF]/20 bg-[#0A0F1C]/80 px-4 py-2 font-mono text-[10px] text-[#8892B0] backdrop-blur-sm transition-all hover:border-[#00E5FF]/40 hover:text-[#00E5FF]"
      title={playing ? "Mute ambient sound" : "Enable ambient sound"}
    >
      <span className="text-sm">{playing ? "🔊" : "🔇"}</span>
      <span className="tracking-widest">{playing ? "SOUND ON" : "SOUND OFF"}</span>
    </button>
  );
}
