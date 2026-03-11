"use client";

import { Html } from "@react-three/drei";
import React, { useState, useMemo, useEffect } from "react";
import * as THREE from "three";

/* ══════════════════════════════════════════════════════════════
   SKILL FRAME CANVAS TEXTURE
   Paints title + skills list onto a 256×320 canvas → CanvasTexture
   Applied to a plane that fills the frame interior (no Html needed)
   ══════════════════════════════════════════════════════════════ */
function useSkillFrameTexture(
  name: string,
  icon: string,
  items: string[],
): THREE.CanvasTexture {
  return useMemo(() => {
    const W = 256, H = 320;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    // Background
    ctx.fillStyle = "#12071e";
    ctx.fillRect(0, 0, W, H);

    // Subtle inner gradient overlay
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(80,40,120,0.18)");
    grad.addColorStop(1, "rgba(10,4,20,0.0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Icon
    ctx.font = "32px serif";
    ctx.textAlign = "center";
    ctx.fillText(icon, W / 2, 46);

    // Category title
    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(name, W / 2, 82);

    // Gold divider
    const grd = ctx.createLinearGradient(20, 0, W - 20, 0);
    grd.addColorStop(0, "rgba(212,175,55,0.05)");
    grd.addColorStop(0.5, "rgba(212,175,55,0.55)");
    grd.addColorStop(1, "rgba(212,175,55,0.05)");
    ctx.strokeStyle = grd;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(20, 96); ctx.lineTo(W - 20, 96); ctx.stroke();

    // Skill items
    ctx.font = "17px Georgia, serif";
    ctx.textAlign = "left";
    items.forEach((item, i) => {
      const y = 126 + i * 36;
      // bullet diamond
      ctx.fillStyle = "#c9a448";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("◆", 22, y);
      // item text
      ctx.fillStyle = "#e0c88a";
      ctx.font = "17px Georgia, serif";
      ctx.fillText(item, 44, y);
    });

    // Tap hint at bottom
    ctx.fillStyle = "rgba(200,168,106,0.35)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TAP TO EXPAND", W / 2, H - 14);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [name, icon, items]);
}

/* Wrapper component — renders one skill frame interior as a textured plane */
function SkillFrameContent({
  name, icon, items, onClick,
}: { name: string; icon: string; items: string[]; onClick: () => void }) {
  const tex = useSkillFrameTexture(name, icon, items);
  return (
    <mesh position={[0, 0, 0.02]} onDoubleClick={onClick} >
      <planeGeometry args={[1.24, 1.16]} />
      <meshBasicMaterial map={tex} transparent={false} />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   PROJECT FRAME CANVAS TEXTURE — 2.0×1.32 interior (2.1×1.4 frame)
   ══════════════════════════════════════════════════════════════ */
function useProjectFrameTexture(
  abbr: string, name: string, tech: string, tags: string[],
): THREE.CanvasTexture {
  return useMemo(() => {
    const W = 420, H = 280;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#0c0818";
    ctx.fillRect(0, 0, W, H);

    // Abbr badge (top-left)
    ctx.fillStyle = "#c9a44820";
    ctx.fillRect(18, 18, 62, 62);
    ctx.strokeStyle = "#c9a448";
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 18, 62, 62);
    ctx.fillStyle = "#c9a448";
    ctx.font = "bold 18px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(abbr, 49, 57);

    // Project name
    ctx.fillStyle = "#ffe8b0";
    ctx.font = "bold 22px Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillText(name, 96, 44);

    // Tech subtitle
    ctx.fillStyle = "#c9a44890";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText(tech, 96, 68);

    // Divider
    const grd = ctx.createLinearGradient(18, 0, W - 18, 0);
    grd.addColorStop(0, "rgba(212,175,55,0.05)");
    grd.addColorStop(0.5, "rgba(212,175,55,0.45)");
    grd.addColorStop(1, "rgba(212,175,55,0.05)");
    ctx.strokeStyle = grd;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(18, 96); ctx.lineTo(W - 18, 96); ctx.stroke();

    // Tags
    let tx = 18, ty = 120;
    ctx.font = "14px sans-serif";
    tags.forEach((tag) => {
      const tw = ctx.measureText(tag).width + 18;
      if (tx + tw > W - 18) { tx = 18; ty += 34; }
      ctx.fillStyle = "rgba(200,168,106,0.12)";
      ctx.fillRect(tx, ty - 18, tw, 26);
      ctx.strokeStyle = "#c9a44850";
      ctx.lineWidth = 1;
      ctx.strokeRect(tx, ty - 18, tw, 26);
      ctx.fillStyle = "#e0c88a";
      ctx.fillText(tag, tx + 9, ty + 2);
      tx += tw + 8;
    });

    // Click hint
    ctx.fillStyle = "rgba(200,168,106,0.3)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("▶  CLICK TO EXPAND", W / 2, H - 16);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [abbr, name, tech, tags]);
}

function ProjectFrameContent({ p, onClick }: { p: typeof PROJECTS[0]; onClick: () => void }) {
  const tex = useProjectFrameTexture(p.abbr, p.name, p.tech, p.tags);
  return (
    <mesh position={[0, 0, 0.02]} onDoubleClick={onClick}>
      <planeGeometry args={[2.0, 1.32]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   CERT FRAME CANVAS TEXTURE — 2.0×1.32 interior
   ══════════════════════════════════════════════════════════════ */
function useCertFrameTexture(
  abbr: string, name: string, org: string, year: string, color: string,
): THREE.CanvasTexture {
  return useMemo(() => {
    const W = 420, H = 280;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#0c0810";
    ctx.fillRect(0, 0, W, H);

    // Color badge
    ctx.fillStyle = color + "20";
    ctx.fillRect(18, 18, 62, 62);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, 62, 62);
    ctx.fillStyle = color;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("★", 49, 42);
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(abbr, 49, 63);

    // Name
    ctx.fillStyle = "#ffe8b0";
    ctx.font = "bold 19px Georgia, serif";
    ctx.textAlign = "left";
    // wrap long name
    const words = name.split(" ");
    let line = "", lineY = 38;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 290 && line) {
        ctx.fillText(line.trim(), 96, lineY);
        line = word + " "; lineY += 26;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), 96, lineY);

    // Org + year
    ctx.fillStyle = color + "cc";
    ctx.font = "italic 15px Georgia, serif";
    ctx.fillText(`${org}  ·  ${year}`, 96, lineY + 24);

    // Gold divider
    const grd = ctx.createLinearGradient(18, 0, W - 18, 0);
    grd.addColorStop(0, "rgba(212,175,55,0.05)");
    grd.addColorStop(0.5, "rgba(212,175,55,0.45)");
    grd.addColorStop(1, "rgba(212,175,55,0.05)");
    ctx.strokeStyle = grd;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(18, 102); ctx.lineTo(W - 18, 102); ctx.stroke();

    // Verified ribbon
    ctx.fillStyle = color + "18";
    ctx.fillRect(18, 118, W - 36, 36);
    ctx.strokeStyle = color + "44";
    ctx.strokeRect(18, 118, W - 36, 36);
    ctx.fillStyle = color;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✓  VERIFIED CERTIFICATION", W / 2, 142);

    // Click hint
    ctx.fillStyle = "rgba(200,168,106,0.3)";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("▶  CLICK TO EXPAND", W / 2, H - 16);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [abbr, name, org, year, color]);
}

function CertFrameContent({ c, onClick }: { c: typeof CERTIFICATIONS[0]; onClick: () => void }) {
  const tex = useCertFrameTexture(c.abbr, c.name, c.org, c.year, c.color);
  return (
    <mesh position={[0, 0, 0.02]} onDoubleClick={onClick}>
      <planeGeometry args={[2.0, 1.32]} />
      <meshBasicMaterial map={tex} />
    </mesh>
  );
}

/* ══════════════════════════════════════════════════════════════
   GALLERY FRAME — museum style with wood moulding
   ══════════════════════════════════════════════════════════════ */
function GalleryFrame({
  position,
  rotation,
  title,
  category,
  frameColor = "#5c3d1e",
  metallic = false,
  width = 420,
  height = 270,
  scale = 0.8,
  onClick,
  children,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  title: string;
  category: string;
  frameColor?: string;
  metallic?: boolean;
  width?: number;
  height?: number;
  scale?: number;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const fw = width * scale * 0.0055;
  const fh = height * scale * 0.0055;
  const BAR = 0.13;
  const DEP = 0.065;
  const roughness = metallic ? 0.18 : 0.68;
  const metalness = metallic ? 0.88 : 0.06;

  return (
    <group position={position} rotation={rotation}>
      {/* Moulding — 4 bars */}
      <mesh castShadow position={[0, fh / 2 + BAR / 2, 0]}>
        <boxGeometry args={[fw + BAR * 2, BAR, DEP]} />
        <meshStandardMaterial color={frameColor} roughness={roughness} metalness={metalness} />
      </mesh>
      <mesh castShadow position={[0, -(fh / 2 + BAR / 2), 0]}>
        <boxGeometry args={[fw + BAR * 2, BAR, DEP]} />
        <meshStandardMaterial color={frameColor} roughness={roughness} metalness={metalness} />
      </mesh>
      <mesh castShadow position={[-(fw / 2 + BAR / 2), 0, 0]}>
        <boxGeometry args={[BAR, fh, DEP]} />
        <meshStandardMaterial color={frameColor} roughness={roughness} metalness={metalness} />
      </mesh>
      <mesh castShadow position={[fw / 2 + BAR / 2, 0, 0]}>
        <boxGeometry args={[BAR, fh, DEP]} />
        <meshStandardMaterial color={frameColor} roughness={roughness} metalness={metalness} />
      </mesh>
      {/* Inner lip */}
      <mesh position={[0, 0, DEP / 2 - 0.003]}>
        <boxGeometry args={[fw + 0.01, fh + 0.01, 0.005]} />
        <meshStandardMaterial color="#1a1008" roughness={0.9} />
      </mesh>
      {/* Cream mat board */}
      <mesh receiveShadow position={[0, 0, -(DEP / 2 - 0.003)]}>
        <boxGeometry args={[fw, fh, 0.008]} />
        <meshStandardMaterial color="#f5efe3" roughness={0.97} />
      </mesh>
      {/* HTML content */}
      <Html
        transform
        occlude="blending"
        position={[0, 0, 0.02]}
        scale={scale * 0.5}
        style={{ width: `${width}px`, height: `${height}px`, overflow: "hidden", pointerEvents: onClick ? "auto" : "none", cursor: onClick ? "pointer" : "default" }}
      >
        <div
          onClick={onClick}
          style={{
            width: `${width}px`, height: `${height}px`,
            background: "linear-gradient(155deg, #fdfaf4 0%, #f8f0e0 100%)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#2c1f10", padding: "20px 22px 14px", boxSizing: "border-box", overflow: "hidden",
          }}
        >
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "8px", letterSpacing: "3px", color: "#9a7650", textTransform: "uppercase", marginBottom: "3px" }}>
              {category}
            </div>
            <div style={{ fontSize: "17px", fontWeight: "bold", color: "#1c130a", lineHeight: 1.1, letterSpacing: "0.3px" }}>
              {title}
            </div>
            <div style={{ marginTop: "7px", height: "1px", background: "linear-gradient(90deg, #c8a86a 0%, rgba(200,168,106,0.1) 100%)" }} />
          </div>
          <div style={{ fontSize: "11px", color: "#3d2c18", lineHeight: 1.65 }}>
            {children}
          </div>
        </div>
      </Html>
      {/* Brass label plate */}
      <mesh castShadow position={[0, -(fh / 2 + BAR + 0.055), 0.008]}>
        <boxGeometry args={[Math.min(fw * 0.68, 1.02), 0.055, 0.007]} />
        <meshStandardMaterial color="#c9a448" roughness={0.20} metalness={0.88} />
      </mesh>
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXPANDED OVERLAY MODAL
   ══════════════════════════════════════════════════════════════ */
function ExpandedOverlay({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  // Animate in
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  // Close on ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <Html fullscreen style={{ pointerEvents: "auto" }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(2, 6, 12, 0.92)",
          backdropFilter: "blur(10px) brightness(0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "opacity 0.25s",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Panel */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(680px, 92vw)",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(170deg, #050d18 0%, #090e1a 60%, #0a0a0f 100%)",
            border: "1px solid rgba(180,140,50,0.55)",
            boxShadow: "0 0 0 1px rgba(0,180,255,0.08), 0 0 60px rgba(0,140,255,0.12), inset 0 0 40px rgba(0,0,0,0.6)",
            transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
            transition: "transform 0.28s cubic-bezier(0.22,1,0.36,1), opacity 0.25s",
            opacity: visible ? 1 : 0,
          }}
        >
          {/* ── Header bar ── */}
          <div style={{
            padding: "14px 24px",
            borderBottom: "1px solid rgba(200,164,72,0.3)",
            background: "linear-gradient(90deg, rgba(180,140,50,0.12) 0%, transparent 100%)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
            flexShrink: 0,
          }}>
            {/* Left: status dot + title */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#00e5ff",
                boxShadow: "0 0 8px #00e5ff",
                flexShrink: 0,
                animation: "pulse-dot 2s ease-in-out infinite",
              }} />
              <span style={{
                fontFamily: "monospace", fontSize: "11px",
                letterSpacing: "3px", color: "rgba(200,164,72,0.7)",
                textTransform: "uppercase",
              }}>PORTFOLIO // </span>
              <span style={{
                fontFamily: "'Georgia', serif", fontSize: "18px",
                fontWeight: "bold", color: "#e8d9b0",
                letterSpacing: "1px",
              }}>{title}</span>
            </div>
            {/* Right: close button */}
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid rgba(200,164,72,0.4)",
                color: "rgba(200,164,72,0.8)",
                fontFamily: "monospace", fontSize: "11px",
                letterSpacing: "2px", padding: "5px 14px",
                cursor: "pointer",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(200,164,72,0.15)";
                (e.currentTarget as HTMLButtonElement).style.color = "#e8d080";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "rgba(200,164,72,0.8)";
              }}
            >
              ESC ✕
            </button>
          </div>

          {/* ── Scrollable content ── */}
          <div style={{
            padding: "28px 28px 24px",
            overflowY: "auto",
            flex: 1,
          }}>
            {children}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: "10px 24px",
            borderTop: "1px solid rgba(200,164,72,0.2)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(0,229,255,0.4)", letterSpacing: "2px" }}>
              DARSHAN U // PORTFOLIO
            </span>
            <span style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(200,164,72,0.4)", letterSpacing: "2px" }}>
              PRESS ESC OR CLICK OUTSIDE TO CLOSE
            </span>
          </div>
        </div>
      </div>

      {/* Keyframe for pulsing dot */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #00e5ff; }
          50% { opacity: 0.4; box-shadow: 0 0 3px #00e5ff; }
        }
      `}</style>
    </Html>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONTENT COMPONENTS
   ══════════════════════════════════════════════════════════════ */

const PROJECTS = [
  {
    abbr: "AS", name: "AetherScan", tech: "Python · Nmap · Gemini AI",
    desc: "AI-powered vulnerability scanner combining Nmap with Gemini AI for intelligent risk scoring. Integrates VirusTotal and Shodan APIs to fingerprint services and generate automated vulnerability reports.",
    tags: ["Python", "Nmap", "Gemini AI", "VirusTotal API", "Shodan API"],
  },
  {
    abbr: "FEPD", name: "FEPD – Forensics Platform", tech: "Python · Memory Forensics",
    desc: "Digital Forensics & Evidence Platform covering memory forensics, network traffic analysis, and automated artifact extraction for incident response investigations.",
    tags: ["Python", "Memory Forensics", "Network Analysis", "Artifact Extraction"],
  },
  {
    abbr: "NL", name: "NodeLink", tech: "Node.js · Socket.io · React Native",
    desc: "Real-time chat application built with Node.js and Socket.io for instant messaging. Features a React Native mobile client and containerised deployment via Docker.",
    tags: ["Node.js", "Express", "Socket.io", "React Native", "Docker"],
  },
  {
    abbr: "PORT", name: "This Portfolio", tech: "React · Three.js · FastAPI",
    desc: "Interactive 3D portfolio built as a luxury cybersecurity study room in the browser. Features a hologram AI assistant (RAG), animated solar system, gallery frames, and a live contact panel.",
    tags: ["React", "Three.js", "React Three Fiber", "TailwindCSS", "FastAPI", "LangChain", "FAISS", "Next.js"],
  },
];

function ProjectCardContent({ p, compact = false }: { p: typeof PROJECTS[0]; compact?: boolean }) {
  if (compact) {
    return (
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{
          width: "36px", height: "36px", flexShrink: 0,
          border: "1px solid rgba(0,229,255,0.3)", background: "rgba(0,229,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "9px", fontWeight: "bold", color: "#00e5ff", fontFamily: "monospace",
        }}>{p.abbr}</div>
        <div>
          <div style={{ fontSize: "14px", color: "#e8d9b0", fontWeight: "700", fontFamily: "Georgia, serif" }}>{p.name}</div>
          <div style={{ fontSize: "11px", color: "rgba(200,164,72,0.7)", fontFamily: "monospace" }}>{p.tech}</div>
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* Project header */}
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
        <div style={{
          width: "60px", height: "60px", flexShrink: 0,
          border: "1px solid rgba(0,229,255,0.4)", background: "rgba(0,229,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: "bold", color: "#00e5ff", fontFamily: "monospace",
          letterSpacing: "1px",
        }}>{p.abbr}</div>
        <div>
          <div style={{ fontSize: "22px", color: "#e8d9b0", fontWeight: "bold", fontFamily: "Georgia, serif", marginBottom: "4px" }}>{p.name}</div>
          <div style={{ fontSize: "12px", color: "rgba(200,164,72,0.8)", fontFamily: "monospace", letterSpacing: "1px" }}>{p.tech}</div>
        </div>
      </div>

      {/* Status line */}
      <div style={{
        fontFamily: "monospace", fontSize: "10px", letterSpacing: "2px",
        color: "#00e5ff", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00e5ff", display: "inline-block", boxShadow: "0 0 6px #00e5ff" }} />
        STATUS: ACTIVE &nbsp;|&nbsp; TYPE: PERSONAL PROJECT
      </div>

      {/* Description */}
      <div style={{
        fontSize: "14px", lineHeight: 1.8, color: "rgba(220,210,190,0.85)",
        fontFamily: "'Georgia', serif",
        padding: "14px 16px",
        background: "rgba(255,255,255,0.03)",
        borderLeft: "2px solid rgba(200,164,72,0.4)",
        marginBottom: "20px",
      }}>{p.desc}</div>

      {/* Tech stack */}
      <div style={{ marginBottom: "6px", fontFamily: "monospace", fontSize: "10px", letterSpacing: "2px", color: "rgba(200,164,72,0.6)" }}>TECH STACK</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {p.tags.map((t) => (
          <span key={t} style={{
            fontSize: "11px", padding: "4px 10px",
            fontFamily: "monospace", letterSpacing: "1px",
            background: "rgba(0,229,255,0.07)",
            border: "1px solid rgba(0,229,255,0.25)",
            color: "#a8d8e8",
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

const CERTIFICATIONS = [
  {
    abbr: "GCC", name: "Google Cybersecurity Certificate", org: "Google",
    year: "2024", detail: "Professional cybersecurity program covering threat analysis, SIEM tools, Python automation, and incident response playbooks.",
    color: "#4285F4",
  },
  {
    abbr: "FCF", name: "Fortinet FCF", org: "Fortinet",
    year: "2024", detail: "Fundamentals of Cybersecurity: network security, firewalls, threat landscape, and Fortinet Security Fabric architecture.",
    color: "#EE3124",
  },
  {
    abbr: "CEH", name: "Cisco Ethical Hacker", org: "Cisco",
    year: "2023", detail: "Ethical hacking methodology, network penetration testing, web application security, and responsible disclosure practices.",
    color: "#1BA0D7",
  },
  {
    abbr: "ECH", name: "EC-Council Ethical Hacking", org: "EC-Council",
    year: "2023", detail: "CEH curriculum: advanced pen testing, footprinting, scanning, enumeration, exploitation, and post-exploitation techniques.",
    color: "#d4173b",
  },
];

function CertCardContent({ c, compact = false }: { c: typeof CERTIFICATIONS[0]; compact?: boolean }) {
  if (compact) {
    return (
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <div style={{
          width: "36px", height: "36px", flexShrink: 0,
          border: `1px solid ${c.color}55`, background: `${c.color}10`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "9px", fontWeight: "bold", color: c.color, fontFamily: "monospace",
        }}>★</div>
        <div>
          <div style={{ fontSize: "14px", color: "#e8d9b0", fontWeight: "700", fontFamily: "Georgia, serif" }}>{c.name}</div>
          <div style={{ fontSize: "11px", color: "rgba(200,164,72,0.7)", fontFamily: "monospace" }}>{c.org} · {c.year}</div>
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* Cert header */}
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
        <div style={{
          width: "60px", height: "60px", flexShrink: 0,
          border: `1px solid ${c.color}66`, background: `${c.color}12`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: c.color, fontFamily: "monospace",
        }}>
          <span style={{ fontSize: "20px" }}>★</span>
          <span style={{ fontSize: "9px", letterSpacing: "1px", marginTop: "2px" }}>{c.abbr}</span>
        </div>
        <div>
          <div style={{ fontSize: "20px", color: "#e8d9b0", fontWeight: "bold", fontFamily: "Georgia, serif", marginBottom: "4px" }}>{c.name}</div>
          <div style={{ fontSize: "12px", fontFamily: "monospace", letterSpacing: "1px" }}>
            <span style={{ color: c.color }}>{c.org}</span>
            <span style={{ color: "rgba(200,164,72,0.5)" }}> · {c.year}</span>
          </div>
        </div>
      </div>

      {/* Verified badge */}
      <div style={{
        fontFamily: "monospace", fontSize: "10px", letterSpacing: "2px",
        color: c.color, marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.color, display: "inline-block", boxShadow: `0 0 6px ${c.color}` }} />
        CERTIFIED &nbsp;|&nbsp; VERIFIED CREDENTIAL
      </div>

      {/* Detail */}
      <div style={{
        fontSize: "14px", lineHeight: 1.8, color: "rgba(220,210,190,0.85)",
        fontFamily: "'Georgia', serif",
        padding: "14px 16px",
        background: "rgba(255,255,255,0.03)",
        borderLeft: `2px solid ${c.color}55`,
      }}>{c.detail}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROYAL SKILL GALLERY BOARD — 3×2 portrait frames
   Big outer gold frame 5.0×3.6 on back wall
   Each frame: gold beveled border, corner L-brackets,
   dark velvet interior, gold ◆ bullets
   ═══════════════════════════════════════════════ */
function SkillsGalleryBoard({ onFrameClick }: { onFrameClick: (name: string) => void }) {
  const categories = [
    { name: "SOC", icon: "🛡", items: ["SIEM Monitoring", "Log Analysis", "Threat Detection", "Alert Triage", "Threat Intelligence"] },
    { name: "PENTESTING", icon: "🔓", items: ["Nmap", "Burp Suite", "Metasploit", "Web Vuln Testing", "Enumeration"] },
    { name: "DFIR", icon: "🔍", items: ["Disk Forensics", "Memory Analysis", "Incident Response", "Timeline Analysis", "Malware Investigation"] },
    { name: "AI/RAG", icon: "🤖", items: ["LLM Integration", "RAG Pipelines", "LangChain", "FAISS Vector DB", "Prompt Engineering"] },
    { name: "FULLSTACK", icon: "⟨/⟩", items: ["React", "Node.js", "Python", "FastAPI", "API Development"] },
  ];

  // 3+2 layout: row 0 has 3 items, row 1 has 2 items centered
  const POSITIONS: [number, number][] = [
    [-1.6, 0.75], [0, 0.75], [1.6, 0.75],  // row 0
    [-0.8, -0.75], [0.8, -0.75],             // row 1 centered
  ];

  return (
    <group>
      {/* ── OUTER FRAME — 5.0×3.6 ── */}
      {/* Dark backing panel */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[5.2, 3.8, 0.04]} />
        <meshStandardMaterial color="#0a0608" roughness={0.9} />
      </mesh>
      {/* Top bar */}
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[5.2, 0.12, 0.08]} />
        <meshStandardMaterial color="#c9a448" roughness={0.18} metalness={0.85} />
      </mesh>
      {/* Bottom bar */}
      <mesh position={[0, -1.85, 0]}>
        <boxGeometry args={[5.2, 0.12, 0.08]} />
        <meshStandardMaterial color="#c9a448" roughness={0.18} metalness={0.85} />
      </mesh>
      {/* Left bar */}
      <mesh position={[-2.6, 0, 0]}>
        <boxGeometry args={[0.12, 3.82, 0.08]} />
        <meshStandardMaterial color="#c9a448" roughness={0.18} metalness={0.85} />
      </mesh>
      {/* Right bar */}
      <mesh position={[2.6, 0, 0]}>
        <boxGeometry args={[0.12, 3.82, 0.08]} />
        <meshStandardMaterial color="#c9a448" roughness={0.18} metalness={0.85} />
      </mesh>

      {/* Title plate */}
      <mesh position={[0, 2.0, 0.01]}>
        <boxGeometry args={[1.8, 0.14, 0.012]} />
        <meshStandardMaterial color="#c9a448" roughness={0.18} metalness={0.88} />
      </mesh>
      <Html transform position={[0, 2.0, 0.025]} scale={0.12} style={{ pointerEvents: "none" }}>
        <div style={{
          fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: "bold",
          letterSpacing: "5px", color: "#1c130a", textTransform: "uppercase",
          textAlign: "center", width: "200px",
        }}>
          Skills
        </div>
      </Html>

      {/* ── 3+2 GRID OF PORTRAIT FRAMES ── */}
      {categories.map((cat, i) => {
        const [x, y] = POSITIONS[i];

        return (
          <group key={cat.name} position={[x, y, 0]}>
            {/* Dark velvet interior */}
            <mesh position={[0, 0, -0.01]}>
              <boxGeometry args={[1.3, 1.2, 0.02]} />
              <meshStandardMaterial color="#1a0812" roughness={0.95} />
            </mesh>

            {/* Gold beveled border — 4 bars */}
            <mesh position={[0, 0.63, 0]}>
              <boxGeometry args={[1.38, 0.06, 0.05]} />
              <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.82} />
            </mesh>
            <mesh position={[0, -0.63, 0]}>
              <boxGeometry args={[1.38, 0.06, 0.05]} />
              <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.82} />
            </mesh>
            <mesh position={[-0.68, 0, 0]}>
              <boxGeometry args={[0.06, 1.32, 0.05]} />
              <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.82} />
            </mesh>
            <mesh position={[0.68, 0, 0]}>
              <boxGeometry args={[0.06, 1.32, 0.05]} />
              <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.82} />
            </mesh>

            {/* Corner L-brackets */}
            {([[-0.58, 0.53], [0.58, 0.53], [-0.58, -0.53], [0.58, -0.53]] as [number, number][]).map(([cx, cy], ci) => (
              <group key={ci}>
                <mesh position={[cx, cy, 0.026]}>
                  <boxGeometry args={[0.12, 0.008, 0.008]} />
                  <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.9} />
                </mesh>
                <mesh position={[cx > 0 ? cx - 0.056 : cx + 0.056, cy, 0.026]}>
                  <boxGeometry args={[0.008, 0.12, 0.008]} />
                  <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.9} />
                </mesh>
              </group>
            ))}

            {/* Frame content — canvas texture plane, no Html scaling issues */}
            <SkillFrameContent
              name={cat.name}
              icon={cat.icon}
              items={cat.items}
              onClick={() => onFrameClick(cat.name)}
            />
          </group>
        );
      })}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   SKILLS EXPANDED MODAL
   ══════════════════════════════════════════════════════════════ */
function SkillsExpandedContent({ category }: { category: string }) {
  const allSkills: Record<string, { icon: string; items: string[]; desc: string }> = {
    SOC: {
      icon: "🛡",
      items: ["SIEM Monitoring", "Log Analysis", "Alert Triage", "Incident Response", "Threat Detection", "Threat Intelligence", "Security Monitoring", "SOC Workflows"],
      desc: "Security Operations Center — detection, analysis, and response to active threats in real time.",
    },
    PENTESTING: {
      icon: "🔓",
      items: ["Nmap", "Burp Suite", "Metasploit", "SQLMap", "Hydra", "Nikto", "OWASP ZAP", "Gobuster", "Web Vulnerability Testing", "Enumeration"],
      desc: "Penetration Testing — offensive security, red team operations, and vulnerability assessment.",
    },
    DFIR: {
      icon: "🔍",
      items: ["Disk Forensics", "Memory Analysis", "Incident Response", "Timeline Analysis", "Malware Investigation", "Volatility", "Autopsy", "FTK Imager", "Chain of Custody"],
      desc: "Digital Forensics & Incident Response — evidence collection and investigation.",
    },
    "AI/RAG": {
      icon: "🤖",
      items: ["LLM Integration", "RAG Pipelines", "LangChain", "FAISS Vector DB", "Prompt Engineering", "Embeddings", "Ollama", "HuggingFace", "Semantic Search"],
      desc: "AI / RAG — large language models, retrieval-augmented generation, and intelligent pipelines.",
    },
    FULLSTACK: {
      icon: "⟨/⟩",
      items: ["React", "Next.js", "Node.js", "Python", "FastAPI", "TypeScript", "API Development", "MongoDB", "PostgreSQL", "Automation Scripts"],
      desc: "Full-Stack Development — end-to-end web applications and backend systems.",
    },
  };
  const data = allSkills[category] || { icon: "◆", items: [], desc: "" };
  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <span style={{ fontSize: "28px" }}>{data.icon}</span>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "3px", color: "rgba(0,229,255,0.6)", marginBottom: "3px" }}>SKILL DOMAIN</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: "13px", color: "rgba(220,210,190,0.7)", lineHeight: 1.6 }}>{data.desc}</div>
        </div>
      </div>

      {/* Status line */}
      <div style={{
        fontFamily: "monospace", fontSize: "10px", letterSpacing: "2px",
        color: "#00e5ff", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00e5ff", display: "inline-block", boxShadow: "0 0 6px #00e5ff" }} />
        {data.items.length} SKILLS ACTIVE
      </div>

      {/* Skills grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {data.items.map((item, i) => (
          <div key={item} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 14px",
            background: "rgba(0,229,255,0.04)",
            border: "1px solid rgba(0,229,255,0.15)",
            transition: "border-color 0.2s",
          }}>
            <span style={{
              fontSize: "10px", fontWeight: "bold", color: "rgba(200,164,72,0.7)",
              fontFamily: "monospace", minWidth: "20px",
            }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: "13px", color: "#d8cdb0", fontFamily: "Georgia, serif" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PROJECTS GALLERY BOARD — 2×2 grid on left wall
   ══════════════════════════════════════════════════════════════ */
function ProjectsGalleryBoard({ onProjectClick }: { onProjectClick: (idx: number) => void }) {
  const GRID: [number, number][] = [[-1.2, 0.8], [1.2, 0.8], [-1.2, -0.8], [1.2, -0.8]];

  return (
    <group>
      {/* Outer frame backing */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[5.2, 3.8, 0.04]} />
        <meshStandardMaterial color="#0a0608" roughness={0.9} />
      </mesh>
      {/* Gold border bars */}
      {[
        { pos: [0, 1.95, 0] as [number, number, number], args: [5.2, 0.12, 0.08] as [number, number, number] },
        { pos: [0, -1.95, 0] as [number, number, number], args: [5.2, 0.12, 0.08] as [number, number, number] },
        { pos: [-2.6, 0, 0] as [number, number, number], args: [0.12, 4.02, 0.08] as [number, number, number] },
        { pos: [2.6, 0, 0] as [number, number, number], args: [0.12, 4.02, 0.08] as [number, number, number] },
      ].map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.args} />
          <meshStandardMaterial color="#c9a448" roughness={0.18} metalness={0.85} />
        </mesh>
      ))}
      {/* Title */}
      <mesh position={[0, 2.1, 0.01]}>
        <boxGeometry args={[2.2, 0.14, 0.012]} />
        <meshStandardMaterial color="#c9a448" roughness={0.18} metalness={0.88} />
      </mesh>
      <Html transform position={[0, 2.1, 0.025]} scale={0.12} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: "bold", letterSpacing: "5px", color: "#1c130a", textTransform: "uppercase", textAlign: "center", width: "240px" }}>
          Projects
        </div>
      </Html>

      {/* 2×2 Project frames */}
      {PROJECTS.map((project, i) => {
        const [x, y] = GRID[i];
        return (
          <group key={project.abbr} position={[x, y, 0]}>
            <mesh position={[0, 0, -0.01]}><boxGeometry args={[2.1, 1.4, 0.02]} /><meshStandardMaterial color="#0e0a18" roughness={0.95} /></mesh>
            {/* Gold border */}
            {[
              { pos: [0, 0.73, 0] as [number, number, number], args: [2.16, 0.06, 0.05] as [number, number, number] },
              { pos: [0, -0.73, 0] as [number, number, number], args: [2.16, 0.06, 0.05] as [number, number, number] },
              { pos: [-1.08, 0, 0] as [number, number, number], args: [0.06, 1.46, 0.05] as [number, number, number] },
              { pos: [1.08, 0, 0] as [number, number, number], args: [0.06, 1.46, 0.05] as [number, number, number] },
            ].map((b, bi) => (
              <mesh key={bi} position={b.pos}><boxGeometry args={b.args} /><meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.82} /></mesh>
            ))}
            <ProjectFrameContent p={project} onClick={() => onProjectClick(i)} />
          </group>
        );
      })}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   CERTIFICATIONS GALLERY BOARD — 2×2 grid on right wall
   ══════════════════════════════════════════════════════════════ */
function CertificationsGalleryBoard({ onCertClick }: { onCertClick: (idx: number) => void }) {
  const GRID: [number, number][] = [[-1.2, 0.8], [1.2, 0.8], [-1.2, -0.8], [1.2, -0.8]];

  return (
    <group>
      {/* Outer frame backing */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[5.2, 3.8, 0.04]} />
        <meshStandardMaterial color="#0a0608" roughness={0.9} />
      </mesh>
      {/* Gold border bars */}
      {[
        { pos: [0, 1.95, 0] as [number, number, number], args: [5.2, 0.12, 0.08] as [number, number, number] },
        { pos: [0, -1.95, 0] as [number, number, number], args: [5.2, 0.12, 0.08] as [number, number, number] },
        { pos: [-2.6, 0, 0] as [number, number, number], args: [0.12, 4.02, 0.08] as [number, number, number] },
        { pos: [2.6, 0, 0] as [number, number, number], args: [0.12, 4.02, 0.08] as [number, number, number] },
      ].map((b, i) => (
        <mesh key={i} position={b.pos}>
          <boxGeometry args={b.args} />
          <meshStandardMaterial color="#b8963e" roughness={0.18} metalness={0.85} />
        </mesh>
      ))}
      {/* Title */}
      <mesh position={[0, 2.1, 0.01]}>
        <boxGeometry args={[3.0, 0.14, 0.012]} />
        <meshStandardMaterial color="#b8963e" roughness={0.18} metalness={0.88} />
      </mesh>
      <Html transform position={[0, 2.1, 0.025]} scale={0.12} style={{ pointerEvents: "none" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "14px", fontWeight: "bold", letterSpacing: "4px", color: "#1c130a", textTransform: "uppercase", textAlign: "center", width: "300px" }}>
          Certifications
        </div>
      </Html>

      {/* 2×2 Cert frames */}
      {CERTIFICATIONS.map((cert, i) => {
        const [x, y] = GRID[i];
        return (
          <group key={cert.abbr} position={[x, y, 0]}>
            <mesh position={[0, 0, -0.01]}><boxGeometry args={[2.1, 1.4, 0.02]} /><meshStandardMaterial color="#0e0a10" roughness={0.95} /></mesh>
            {/* Gold border */}
            {[
              { pos: [0, 0.73, 0] as [number, number, number], args: [2.16, 0.06, 0.05] as [number, number, number] },
              { pos: [0, -0.73, 0] as [number, number, number], args: [2.16, 0.06, 0.05] as [number, number, number] },
              { pos: [-1.08, 0, 0] as [number, number, number], args: [0.06, 1.46, 0.05] as [number, number, number] },
              { pos: [1.08, 0, 0] as [number, number, number], args: [0.06, 1.46, 0.05] as [number, number, number] },
            ].map((b, bi) => (
              <mesh key={bi} position={b.pos}><boxGeometry args={b.args} /><meshStandardMaterial color="#b8963e" roughness={0.2} metalness={0.82} /></mesh>
            ))}
            <CertFrameContent c={cert} onClick={() => onCertClick(i)} />
          </group>
        );
      })}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   WALL GALLERY — zone-based layout
   Back wall  (z-): Skills gallery board
   Left wall  (x-): Projects gallery board
   Right wall (x+): Certifications gallery board
   ══════════════════════════════════════════════════════════════ */
export default function WallDisplays() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <group>
      {/* ══ BACK WALL — Skills Gallery Board ══ */}
      <group position={[0, 0.8, -5.95]}>
        <SkillsGalleryBoard onFrameClick={(name) => setExpanded(`skill-${name}`)} />
      </group>

      {/* ══ LEFT WALL — Projects Gallery Board ══ */}
      <group position={[-6.92, 0.8, -1.0]} rotation={[0, Math.PI / 2, 0]}>
        <ProjectsGalleryBoard onProjectClick={(idx) => setExpanded(`project-${idx}`)} />
      </group>

      {/* ══ RIGHT WALL — Certifications Gallery Board ══ */}
      <group position={[6.92, 0.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <CertificationsGalleryBoard onCertClick={(idx) => setExpanded(`cert-${idx}`)} />
      </group>

      {/* ══ EXPANDED OVERLAY MODALS ══ */}
      {expanded?.startsWith("skill-") && (
        <ExpandedOverlay title={expanded.replace("skill-", "") + " Skills"} onClose={() => setExpanded(null)}>
          <SkillsExpandedContent category={expanded.replace("skill-", "")} />
        </ExpandedOverlay>
      )}
      {expanded?.startsWith("project-") && (() => {
        const idx = parseInt(expanded.replace("project-", ""));
        const p = PROJECTS[idx];
        return p ? (
          <ExpandedOverlay title={p.name} onClose={() => setExpanded(null)}>
            <ProjectCardContent p={p} />
          </ExpandedOverlay>
        ) : null;
      })()}
      {expanded?.startsWith("cert-") && (() => {
        const idx = parseInt(expanded.replace("cert-", ""));
        const c = CERTIFICATIONS[idx];
        return c ? (
          <ExpandedOverlay title={c.name} onClose={() => setExpanded(null)}>
            <CertCardContent c={c} />
          </ExpandedOverlay>
        ) : null;
      })()}
    </group>
  );
}
