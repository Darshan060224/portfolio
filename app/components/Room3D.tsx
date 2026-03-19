"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, RoundedBox, useTexture } from "@react-three/drei";
import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import RAGTerminal from "./RAGTerminal";
import WallDisplays from "./WallDisplays";
import DeskHotspots from "./DeskHotspots";
import CyberParticles from "./CyberParticles";
import SpaceEnvironment from "./SpaceEnvironment";
import * as THREE from "three";

/* ═══════════════════════════════════════════════
   LUXURY ROYAL DIAMOND WALLPAPER — procedural
   Single canvas factory + per-wall repeat so all
   walls show the same tile density regardless of
   their actual world-space dimensions.
   ═══════════════════════════════════════════════ */
function makeDamaskCanvas(): HTMLCanvasElement {
  const w = 512, h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "#3D1E0A";
  ctx.fillRect(0, 0, w, h);

  const S = 80;
  for (let row = 0; row * (S * 0.5) < h + S; row++) {
    for (let col = 0; col * S < w + S; col++) {
      const offsetX = (row % 2) * (S * 0.5);
      const cx = col * S + offsetX;
      const cy = row * (S * 0.5);

      ctx.beginPath();
      ctx.moveTo(cx, cy - S * 0.38); ctx.lineTo(cx + S * 0.32, cy);
      ctx.lineTo(cx, cy + S * 0.38); ctx.lineTo(cx - S * 0.32, cy);
      ctx.closePath();
      ctx.fillStyle = "rgba(212,175,55,0.18)"; ctx.fill();
      ctx.strokeStyle = "rgba(212,175,55,0.75)"; ctx.lineWidth = 1.2; ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - S * 0.22); ctx.lineTo(cx + S * 0.18, cy);
      ctx.lineTo(cx, cy + S * 0.22); ctx.lineTo(cx - S * 0.18, cy);
      ctx.closePath();
      ctx.fillStyle = "rgba(212,175,55,0.10)"; ctx.fill();
      ctx.strokeStyle = "rgba(255,215,80,0.55)"; ctx.lineWidth = 0.7; ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, S * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,215,80,0.70)"; ctx.fill();
    }
  }

  ctx.strokeStyle = "rgba(212,175,55,0.20)"; ctx.lineWidth = 0.6;
  for (let x = -h; x < w + h; x += S) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + h, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - h, h); ctx.stroke();
  }
  return canvas;
}

/** Create a wall texture with the correct repeat for a given face width in world units.
 *  Target density: 1.5 tiles per unit wide, 0.8 tiles per unit tall (H=5). */
function useDamaskTexture(worldW: number, worldH = 5) {
  return useMemo(() => {
    const tex = new THREE.CanvasTexture(makeDamaskCanvas());
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(Math.round(worldW * 1.5), Math.round(worldH * 0.8));
    return tex;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldW, worldH]);
}

/* ═══════════════════════════════════════════════
   ROOM — W=14, D=12, H=5, wall thickness=0.3
   ═══════════════════════════════════════════════ */
function Room() {
  const W = 14, D = 12, H = 5, T = 0.3;

  // Each wall texture uses density-matched repeat so the pattern looks
  // the same size on every wall regardless of their width.
  const wallTexBack  = useDamaskTexture(W + T * 2, H);   // back wall   14.6 wide
  const wallTexFront = useDamaskTexture(W / 2 - 0.8, H); // front half  ~6.2 wide
  const wallTexSide4 = useDamaskTexture(4, H);            // side panels  4 wide
  const wallTexSideW = useDamaskTexture(D, H);            // above/below strips (same depth)


  // ── pre-declare typed arrays to avoid TypeScript `as` inside JSX expressions ──
  type P3 = [number,number,number];
  type P2 = [number,number];

  const carpetBorders: { pos:P3; args:P2 }[] = [
    { pos: [0, -1.994, -(D/2-0.6)],    args: [W-0.8, 0.12] },
    { pos: [0, -1.994,  (D/2-0.6)],    args: [W-0.8, 0.12] },
    { pos: [-(W/2-0.6), -1.994, 0],    args: [0.12, D-0.8] },
    { pos: [ (W/2-0.6), -1.994, 0],    args: [0.12, D-0.8] },
  ];
  const carpetInner: { pos:P3; args:P2 }[] = [
    { pos: [0, -1.993, -(D/2-0.9)],    args: [W-1.4, 0.06] },
    { pos: [0, -1.993,  (D/2-0.9)],    args: [W-1.4, 0.06] },
    { pos: [-(W/2-0.9), -1.993, 0],    args: [0.06, D-1.4] },
    { pos: [ (W/2-0.9), -1.993, 0],    args: [0.06, D-1.4] },
  ];
  const leftWinFrame: { pos:P3; args:P3 }[] = [
    { pos: [-W/2-0.01,  0.5, -2.0], args: [0.08, 2.0, 0.1] },
    { pos: [-W/2-0.01,  0.5,  2.0], args: [0.08, 2.0, 0.1] },
    { pos: [-W/2-0.01,  1.6,  0.0], args: [0.08, 0.1, 4.1] },
    { pos: [-W/2-0.01, -0.6,  0.0], args: [0.08, 0.1, 4.1] },
  ];
  const rightWinFrame: { pos:P3; args:P3 }[] = [
    { pos: [W/2+0.01,  0.5, -2.0], args: [0.08, 2.0, 0.1] },
    { pos: [W/2+0.01,  0.5,  2.0], args: [0.08, 2.0, 0.1] },
    { pos: [W/2+0.01,  1.6,  0.0], args: [0.08, 0.1, 4.1] },
    { pos: [W/2+0.01, -0.6,  0.0], args: [0.08, 0.1, 4.1] },
  ];
  const baseboards: { pos:P3; rot:P3; w:number }[] = [
    { pos: [0, -1.88, -D/2+0.02],     rot: [0, 0, 0],           w: W },
    { pos: [-W/2+0.02, -1.88, 0],     rot: [0, Math.PI/2, 0],   w: D },
    { pos: [ W/2-0.02, -1.88, 0],     rot: [0, -Math.PI/2, 0],  w: D },
  ];
  const crowns: { pos:P3; rot:P3; w:number }[] = [
    { pos: [0, H-2.06, -D/2+0.02],    rot: [0, 0, 0],           w: W },
    { pos: [-W/2+0.02, H-2.06, 0],    rot: [0, Math.PI/2, 0],   w: D },
    { pos: [ W/2-0.02, H-2.06, 0],    rot: [0, -Math.PI/2, 0],  w: D },
  ];

  return (
    <group>
      {/* ── FLOOR ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshPhysicalMaterial color="#3d2510" roughness={0.6} metalness={0.02} clearcoat={0.35} clearcoatRoughness={0.4} />
      </mesh>
      {/* Plank lines */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={`p${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-7 + i, -1.998, 0]}>
          <planeGeometry args={[0.006, D]} />
          <meshStandardMaterial color="#150d06" roughness={1} />
        </mesh>
      ))}

      {/* ── RED CARPET ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.995, 0]}>
        <planeGeometry args={[W - 1, D - 1]} />
        <meshStandardMaterial color="#8b1e2a" roughness={0.85} />
      </mesh>
      {/* Gold carpet borders */}
      {carpetBorders.map((b, i) => (
        <mesh key={`cb-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={b.pos}>
          <planeGeometry args={b.args} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      {/* Inner border line */}
      {carpetInner.map((b, i) => (
        <mesh key={`cbi-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={b.pos}>
          <planeGeometry args={b.args} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      {/* Center gold ring — removed (caused gold V shape artifact on floor) */}

      {/* ── CEILING ── */}
      <mesh position={[0, H - 2, 0]}>
        <boxGeometry args={[W + T * 2, T, D + T * 2]} />
        <meshStandardMaterial color="#6A3E1A" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* ── WALLS (thick box geometry) ── */}
      {/* Back wall (z-) */}
      <mesh position={[0, H / 2 - 2, -D / 2 - T / 2]}>
        <boxGeometry args={[W + T * 2, H, T]} />
        <meshStandardMaterial map={wallTexBack} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Front wall left of door */}
      <mesh position={[-W / 4 - 0.6, H / 2 - 2, D / 2 + T / 2]}>
        <boxGeometry args={[W / 2 - 0.8, H, T]} />
        <meshStandardMaterial map={wallTexFront} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Front wall right of door */}
      <mesh position={[W / 4 + 0.6, H / 2 - 2, D / 2 + T / 2]}>
        <boxGeometry args={[W / 2 - 0.8, H, T]} />
        <meshStandardMaterial map={wallTexFront} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Door header */}
      <mesh position={[0, H - 2 - 0.4, D / 2 + T / 2]}>
        <boxGeometry args={[2.0, 0.8, T]} />
        <meshStandardMaterial map={wallTexFront} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* ── LEFT WALL (x-) — with window opening ── */}
      {/* Panel 1: front portion z=-6 to z=-2 */}
      <mesh position={[-W / 2 - T / 2, H / 2 - 2, -4]}>
        <boxGeometry args={[T, H, 4]} />
        <meshStandardMaterial map={wallTexSide4} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Panel 2: back portion z=2 to z=6 */}
      <mesh position={[-W / 2 - T / 2, H / 2 - 2, 4]}>
        <boxGeometry args={[T, H, 4]} />
        <meshStandardMaterial map={wallTexSide4} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Above window strip */}
      <mesh position={[-W / 2 - T / 2, 2.1, 0]}>
        <boxGeometry args={[T, 0.9, 4]} />
        <meshStandardMaterial map={wallTexSide4} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Below window strip */}
      <mesh position={[-W / 2 - T / 2, -1.1, 0]}>
        <boxGeometry args={[T, 1.8, 4]} />
        <meshStandardMaterial map={wallTexSide4} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Left wall window frame (wood) */}
      {leftWinFrame.map((b, i) => (
        <mesh key={`lwf${i}`} position={b.pos}>
          <boxGeometry args={b.args} />
          <meshStandardMaterial color="#5c3d1e" roughness={0.55} metalness={0.05} />
        </mesh>
      ))}
      {/* Left wall glass pane */}
      <mesh position={[-W / 2 - 0.01, 0.5, 0]}>
        <boxGeometry args={[0.015, 2.0, 4.0]} />
        <meshPhysicalMaterial color="#88ccff" transparent opacity={0.12} roughness={0} metalness={0.1} clearcoat={1} />
      </mesh>

      {/* ── RIGHT WALL (x+) — with window opening ── */}
      {/* Panel 1: front portion */}
      <mesh position={[W / 2 + T / 2, H / 2 - 2, -4]}>
        <boxGeometry args={[T, H, 4]} />
        <meshStandardMaterial map={wallTexSide4} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Panel 2: back portion */}
      <mesh position={[W / 2 + T / 2, H / 2 - 2, 4]}>
        <boxGeometry args={[T, H, 4]} />
        <meshStandardMaterial map={wallTexSide4} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Above window strip */}
      <mesh position={[W / 2 + T / 2, 2.1, 0]}>
        <boxGeometry args={[T, 0.9, 4]} />
        <meshStandardMaterial map={wallTexSide4} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Below window strip */}
      <mesh position={[W / 2 + T / 2, -1.1, 0]}>
        <boxGeometry args={[T, 1.8, 4]} />
        <meshStandardMaterial map={wallTexSide4} color="#ffffff" roughness={0.85} metalness={0.03} />
      </mesh>
      {/* Right wall window frame (wood) */}
      {rightWinFrame.map((b, i) => (
        <mesh key={`rwf${i}`} position={b.pos}>
          <boxGeometry args={b.args} />
          <meshStandardMaterial color="#5c3d1e" roughness={0.55} metalness={0.05} />
        </mesh>
      ))}
      {/* Right wall glass pane */}
      <mesh position={[W / 2 + 0.01, 0.5, 0]}>
        <boxGeometry args={[0.015, 2.0, 4.0]} />
        <meshPhysicalMaterial color="#88ccff" transparent opacity={0.12} roughness={0} metalness={0.1} clearcoat={1} />
      </mesh>

      {/* ── DOOR FRAME ── */}
      <mesh position={[-0.85, H / 2 - 2 - 0.4, D / 2 + T / 2]}>
        <boxGeometry args={[0.1, H - 0.8, T + 0.02]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0.85, H / 2 - 2 - 0.4, D / 2 + T / 2]}>
        <boxGeometry args={[0.1, H - 0.8, T + 0.02]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0, H - 2 - 0.82, D / 2 + T / 2]}>
        <boxGeometry args={[1.8, 0.08, T + 0.02]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* ── GOLD BASEBOARDS ── */}
      {baseboards.map((b, i) => (
        <mesh key={`base${i}`} position={b.pos} rotation={b.rot}>
          <boxGeometry args={[b.w, 0.2, 0.05]} />
          <meshStandardMaterial color="#c9a448" roughness={0.25} metalness={0.75} />
        </mesh>
      ))}

      {/* ── CROWN MOLDING ── */}
      {crowns.map((b, i) => (
        <mesh key={`crown${i}`} position={b.pos} rotation={b.rot}>
          <boxGeometry args={[b.w, 0.12, 0.06]} />
          <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}

      {/* ── CORNER LANTERNS — 4 corners near ceiling ── */}
      {/* The lantern group position is where wall meets ceiling.
          y = H-2 - 0.4 = 2.6  (room y-coords: floor at -2, ceiling at H-2=3)
          x = ±(W/2-0.15) to sit just inside the wall
          z = ±(D/2-0.15) */}
      <CornerLantern position={[-(W / 2 - 0.15), H - 2 - 0.4, -(D / 2 - 0.15)]} />
      <CornerLantern position={[ (W / 2 - 0.15), H - 2 - 0.4, -(D / 2 - 0.15)]} />
      <CornerLantern position={[-(W / 2 - 0.15), H - 2 - 0.4,  (D / 2 - 0.15)]} />
      <CornerLantern position={[ (W / 2 - 0.15), H - 2 - 0.4,  (D / 2 - 0.15)]} />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   CONTACT SWITCH PANEL — wall-mounted next to door
   4 glowing LED buttons: Email, GitHub, TryHackMe, LinkedIn
   Positioned on the front-left wall section (left of door)
   ═══════════════════════════════════════════════ */
const CONTACT_BUTTONS = [
  {
    label: "EMAIL",
    icon: "✉",
    color: "#FF4444",
    glow: "#FF0000",
    action: () => window.open("mailto:darshan060224@gmail.com", "_blank"),
  },
  {
    label: "GITHUB",
    icon: "⌥",
    color: "#4488FF",
    glow: "#0055FF",
    action: () => window.open("https://github.com/Darshan060224", "_blank"),
  },
  {
    label: "TRYHACKME",
    icon: "⚡",
    color: "#00DD66",
    glow: "#00FF44",
    action: () => window.open("https://tryhackme.com/p/darshan060224", "_blank"),
  },
  {
    label: "LINKEDIN",
    icon: "◈",
    color: "#E0E0E0",
    glow: "#FFFFFF",
    action: () => window.open("https://linkedin.com/in/darshan24211", "_blank"),
  },
];

/* ─── ContactSwitchPanel ─────────────────────────────────────────
   Whole panel baked as one canvas texture so buttons are always
   visible. Four transparent hit-meshes on top handle clicks.
   Panel sits flush against front wall (z = 5.97) left of door.
────────────────────────────────────────────────────────────────── */

const PANEL_W_U = 1.10;
const PANEL_H_U = 1.20;

function ContactSwitchPanel() {
  return (
    <group position={[-2.2, 0.0, 5.92]}>
      {/* Dark plate body */}
      <mesh>
        <boxGeometry args={[PANEL_W_U, PANEL_H_U, 0.04]} />
        <meshBasicMaterial color="#0d0b1a" />
      </mesh>
      {/* Gold border strips */}
      <mesh position={[0, 0.6, 0.022]}><boxGeometry args={[PANEL_W_U, 0.012, 0.002]} /><meshBasicMaterial color="#D4AF37" /></mesh>
      <mesh position={[0, -0.6, 0.022]}><boxGeometry args={[PANEL_W_U, 0.012, 0.002]} /><meshBasicMaterial color="#D4AF37" /></mesh>
      <mesh position={[-0.55, 0, 0.022]}><boxGeometry args={[0.012, PANEL_H_U, 0.002]} /><meshBasicMaterial color="#D4AF37" /></mesh>
      <mesh position={[0.55, 0, 0.022]}><boxGeometry args={[0.012, PANEL_H_U, 0.002]} /><meshBasicMaterial color="#D4AF37" /></mesh>
      {/* Html transform — scale=0.155 maps 400×450px → 1.10×1.24 world units (monitor ref: 600px×0.14=1.5u, so 1px=0.01786u at scale=0.14, scaled: w×56/px) */}
      <Html transform position={[0, 0, 0.025]} scale={0.155}
        style={{ width: "400px", height: "450px", pointerEvents: "auto" }}>
        <div style={{
          width: 400, height: 450,
          background: "linear-gradient(160deg,#1a1230,#0d0820)",
          display: "flex", flexDirection: "column",
          alignItems: "center",
          fontFamily: "monospace",
          overflow: "hidden",
        }}>
          <div style={{ fontSize: 28, color: "#FFE066", letterSpacing: 8, marginTop: 24, fontWeight: "bold" }}>◆ CONTACT ◆</div>
          <div style={{ width: "80%", height: 2, background: "#D4AF37", opacity: 0.6, margin: "10px 0" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "10px 24px", flex: 1, alignItems: "center" }}>
            {CONTACT_BUTTONS.map((btn) => (
              <button key={btn.label} onClick={btn.action}
                style={{ background: "#1d1840", border: `3px solid ${btn.color}`, borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "18px 8px", gap: 8 }}
                onMouseEnter={e => (e.currentTarget.style.background = "#2d2560")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1d1840")}
              >
                <div style={{ fontSize: 36, filter: `drop-shadow(0 0 6px ${btn.color})` }}>{btn.icon}</div>
                <div style={{ fontSize: 22, color: "#fff", fontWeight: "bold" }}>{btn.label}</div>
              </button>
            ))}
          </div>
        </div>
      </Html>
      <pointLight position={[0, 0, 0.8]} color="#cc8833" intensity={0.8} distance={2.0} decay={2} />
    </group>
  );
}


/* ═══════════════════════════════════════════════
   RESUME MAILBOX — wall-mounted right of door
   Click → opens Google Drive resume folder
   ═══════════════════════════════════════════════ */
function ResumeBox() {
  const openDrive = () => window.open(
    "https://drive.google.com/drive/folders/10YAXBVTsql7WFJt0UNEacG7vWBkxRPzW?usp=sharing",
    "_blank"
  );
  return (
    <group position={[2.0, 0.2, 5.92]}>
      {/* Box body */}
      <mesh>
        <boxGeometry args={[0.52, 0.38, 0.08]} />
        <meshBasicMaterial color="#1a1000" />
      </mesh>
      {/* Gold border strips */}
      <mesh position={[0, 0.19, 0.041]}><boxGeometry args={[0.52, 0.012, 0.003]} /><meshBasicMaterial color="#FFD700" /></mesh>
      <mesh position={[0, -0.19, 0.041]}><boxGeometry args={[0.52, 0.012, 0.003]} /><meshBasicMaterial color="#FFD700" /></mesh>
      <mesh position={[-0.254, 0, 0.041]}><boxGeometry args={[0.012, 0.38, 0.003]} /><meshBasicMaterial color="#FFD700" /></mesh>
      <mesh position={[0.254, 0, 0.041]}><boxGeometry args={[0.012, 0.38, 0.003]} /><meshBasicMaterial color="#FFD700" /></mesh>
      {/* Mail slot */}
      <mesh position={[0, -0.02, 0.043]}><boxGeometry args={[0.28, 0.035, 0.005]} /><meshBasicMaterial color="#000" /></mesh>
      {/* Html — click opens Google Drive */}
      <Html transform position={[0, 0, 0.05]} scale={0.155}
        style={{ width: "195px", height: "143px", pointerEvents: "auto" }}>
        <div
          onClick={openDrive}
          style={{
            width: 195, height: 143,
            background: "linear-gradient(160deg,#1a1000,#0f0800)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", gap: 10,
            fontFamily: "monospace",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "linear-gradient(160deg,#2a1a00,#1a0a00)")}
          onMouseLeave={e => (e.currentTarget.style.background = "linear-gradient(160deg,#1a1000,#0f0800)")}
        >
          <div style={{ fontSize: 42 }}>📮</div>
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#FFD700", letterSpacing: 4 }}>RESUME</div>
          <div style={{ width: "70%", height: 1, background: "rgba(255,215,0,0.4)" }} />
          <div style={{ fontSize: 12, color: "rgba(255,215,0,0.7)", letterSpacing: 2 }}>◆ VIEW CV ◆</div>
        </div>
      </Html>
      {/* Corner screws */}
      {([[-0.22, 0.15], [0.22, 0.15], [-0.22, -0.15], [0.22, -0.15]] as [number,number][]).map(([sx, sy], i) => (
        <mesh key={i} position={[sx, sy, 0.043]}>
          <circleGeometry args={[0.012, 8]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      ))}
      <pointLight position={[0, 0, 0.5]} color="#FFD700" intensity={0.6} distance={1.0} decay={2} />
    </group>
  );
}


function Door({ doorOpen, onToggle }: { doorOpen: boolean; onToggle: () => void }) {
  const groupRef = useRef<THREE.Group>(null!);
  const H = 5, D = 12, T = 0.3;
  const targetY = doorOpen ? +Math.PI * 0.47 : 0;

  useFrame(() => {
    if (!groupRef.current) return;
    // Smooth lerp toward target angle
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0.85, -2, D / 2 - T / 2]}>
      {/* Door panel */}
      <mesh position={[-0.85, H / 2 - 0.4, 0]} castShadow>
        <boxGeometry args={[1.6, H - 0.8, 0.06]} />
        <meshStandardMaterial color="#5c3218" roughness={0.72} metalness={0.03} />
      </mesh>
      {/* Door knob */}
      <mesh position={[-0.22, H / 2 - 0.5, 0.07]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#c9a448" roughness={0.18} metalness={0.85} />
      </mesh>
      <mesh position={[-0.22, H / 2 - 0.5, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.013, 0.013, 0.09, 8]} />
        <meshStandardMaterial color="#c9a448" roughness={0.18} metalness={0.85} />
      </mesh>
      {/* Decorative panel insets */}
      {[0.9, -0.2].map((py, i) => (
        <mesh key={i} position={[-0.85, py, 0.04]}>
          <boxGeometry args={[1.2, 0.75, 0.01]} />
          <meshStandardMaterial color="#4a2810" roughness={0.8} />
        </mesh>
      ))}
      {/* Click target with "OPEN / CLOSE" label */}
      <Html center position={[-0.85, H / 2 - 1.5, 0.08]} style={{ pointerEvents: "auto" }}>
        <div
          onClick={onToggle}
          style={{
            cursor: "pointer",
            padding: "4px 10px",
            background: "rgba(30,15,5,0.7)",
            border: "1px solid #c9a44860",
            borderRadius: "3px",
            fontFamily: "monospace",
            fontSize: "9px",
            letterSpacing: "2px",
            color: "#c9a448cc",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {doorOpen ? "🚪 CLOSE" : "🚪 OPEN"}
        </div>
      </Html>
    </group>
  );
}
function Desk() {
  return (
    <group position={[4.8, -2, -3.8]}>
      {/* Desktop surface */}
      <RoundedBox args={[3.0, 0.06, 1.4]} radius={0.02} position={[0, 0.78, 0]} castShadow>
        <meshPhysicalMaterial color="#1a1008" roughness={0.4} metalness={0.05} clearcoat={0.3} />
      </RoundedBox>
      {/* Leather inlay */}
      <mesh position={[0, 0.812, 0]}>
        <boxGeometry args={[2.8, 0.002, 1.2]} />
        <meshStandardMaterial color="#2a1a0c" roughness={0.5} />
      </mesh>
      {/* Gold edge trim */}
      <mesh position={[0, 0.78, -0.7]}>
        <boxGeometry args={[3.0, 0.04, 0.01]} />
        <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.78, 0.7]}>
        <boxGeometry args={[3.0, 0.04, 0.01]} />
        <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Legs */}
      {([ [-1.35, -0.6], [1.35, -0.6], [-1.35, 0.6], [1.35, 0.6] ] as Array<[number,number]>).map(([x, z], i) => (
        <mesh key={`leg${i}`} position={[x, 0.39, z]} castShadow>
          <boxGeometry args={[0.06, 0.78, 0.06]} />
          <meshStandardMaterial color="#1a1008" roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
      {/* Pedestal drawer */}
      <mesh position={[1.0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.6, 0.55, 1.2]} />
        <meshStandardMaterial color="#1e1208" roughness={0.5} />
      </mesh>
      {/* Drawer handles */}
      {[0.55, 0.35, 0.15].map((y, i) => (
        <mesh key={`dh${i}`} position={[0.71, y, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
          <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   RESUME ASSISTANT MODAL — AI chat about resume
   Portal-renders above canvas, ESC to close
   ═══════════════════════════════════════════════ */
function ResumeModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<{role:"user"|"ai"; text:string}[]>([
    { role: "ai", text: "📮 Welcome! I'm Darshan's Resume Assistant.\n\nAsk me anything about his skills, projects, certifications, or experience.\n\nTry: \"What projects has Darshan built?\" or \"What are his cybersecurity skills?\"" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null!);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "No response received.";
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "⚠ Could not reach the AI server. Make sure rag_server.py is running." }]);
    } finally {
      setLoading(false);
    }
  }

  const QUICK = ["What are Darshan's skills?", "Tell me about AetherScan", "What certifications does he have?", "Describe his experience"];

  if (!mounted || typeof document === "undefined") return null;

  const overlay = (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,5,15,0.93)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "min(820px, 95vw)", maxHeight: "90vh",
        background: "#0a0f1c",
        border: "2px solid rgba(212,175,55,0.35)",
        borderRadius: "14px",
        boxShadow: "0 0 60px rgba(212,175,55,0.1), inset 0 0 30px rgba(0,0,0,0.5)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 18px",
          background: "linear-gradient(90deg, #111827 60%, #1a1200)",
          borderBottom: "1px solid rgba(212,175,55,0.15)",
        }}>
          <div style={{ fontSize: 22 }}>📮</div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: "#D4AF37", letterSpacing: 3 }}>RESUME ASSISTANT</div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(212,175,55,0.5)", letterSpacing: 2 }}>DARSHAN U — CYBERSECURITY · AI · FULLSTACK</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ffa3" }} />
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#00ffa3" }}>RAG ONLINE</div>
          </div>
          <button onClick={() => window.open("https://drive.google.com/drive/folders/10YAXBVTsql7WFJt0UNEacG7vWBkxRPzW","_blank")}
            style={{ marginLeft: 12, background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", borderRadius: 6, padding: "3px 10px", fontFamily: "monospace", fontSize: 10, cursor: "pointer", letterSpacing: 1 }}>
            ↗ Drive
          </button>
          <button onClick={onClose}
            style={{ marginLeft: 6, background: "none", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(212,175,55,0.7)", borderRadius: 6, padding: "3px 10px", fontFamily: "monospace", fontSize: 10, cursor: "pointer" }}>
            ESC ✕
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              maxWidth: "82%",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user"
                ? "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))"
                : "#111827",
              border: m.role === "user"
                ? "1px solid rgba(212,175,55,0.2)"
                : "1px solid rgba(255,255,255,0.05)",
              borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              padding: "10px 14px",
              fontFamily: "monospace", fontSize: 13, lineHeight: 1.7,
              color: m.role === "user" ? "#D4AF37" : "#e6f1ff",
              whiteSpace: "pre-wrap",
            }}>
              {m.role === "ai" && <div style={{ fontSize: 10, color: "rgba(212,175,55,0.6)", display: "block", marginBottom: 4, letterSpacing: 2 }}>◆ RESUME AI</div>}
              {m.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: "flex-start", background: "#111827", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "14px 14px 14px 4px", padding: "10px 14px", fontFamily: "monospace", fontSize: 13, color: "rgba(212,175,55,0.5)" }}>
              <div style={{ fontSize: 10, color: "rgba(212,175,55,0.6)", display: "block", marginBottom: 4, letterSpacing: 2 }}>◆ RESUME AI</div>
              ⟳ searching resume…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick questions */}
        {messages.length <= 1 && (
          <div style={{ padding: "0 18px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {QUICK.map(q => (
              <button key={q} onClick={() => { setInput(q); }}
                style={{ background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(212,175,55,0.8)", borderRadius: 20, padding: "4px 12px", fontFamily: "monospace", fontSize: 10, cursor: "pointer" }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ display: "flex", gap: 8, padding: "10px 18px 14px", borderTop: "1px solid rgba(212,175,55,0.1)", background: "#111827" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
            disabled={loading}
            placeholder="Ask about skills, projects, experience…"
            autoFocus
            style={{
              flex: 1, background: "#0a0f1c", border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: 8, padding: "8px 12px", fontFamily: "monospace", fontSize: 12,
              color: "#D4AF37", outline: "none",
            }}
          />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{
              background: "linear-gradient(135deg, #D4AF37, #8B7020)",
              border: "none", borderRadius: 8, padding: "8px 18px",
              fontFamily: "monospace", fontSize: 11, color: "#0a0f1c",
              fontWeight: "bold", cursor: "pointer", opacity: (loading || !input.trim()) ? 0.4 : 1,
            }}>
            ASK
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

/* ═══════════════════════════════════════════════
   MONITOR MODAL — full-screen terminal overlay
   Portal-renders above canvas, ESC to close
   ═══════════════════════════════════════════════ */
function MonitorModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!mounted || typeof document === "undefined") return null;

  const overlay = (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: "rgba(0,5,15,0.92)",
        backdropFilter: "blur(8px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Monitor chrome bezel */}
      <div style={{
        width: "min(900px, 94vw)", maxHeight: "92vh",
        background: "#0a0f1c",
        border: "2px solid rgba(0,229,255,0.25)",
        borderRadius: "14px",
        boxShadow: "0 0 60px rgba(0,229,255,0.12), inset 0 0 30px rgba(0,0,0,0.5)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Title bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 16px",
          background: "#111827",
          borderBottom: "1px solid rgba(0,229,255,0.1)",
        }}>
          {/* macOS dots */}
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FFBD2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "#8892b0", marginLeft: 8 }}>
            darshan@portfolio — AI Terminal
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ffa3" }} />
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#00ffa3" }}>RAG ONLINE</div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 16, background: "none", border: "1px solid rgba(0,229,255,0.2)",
              color: "#00e5ff", borderRadius: 6, padding: "2px 10px",
              fontFamily: "monospace", fontSize: 11, cursor: "pointer",
            }}
          >
            ESC ✕
          </button>
        </div>
        {/* Terminal content — full size RAGTerminal */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>
          <RAGTerminal fullscreen />
        </div>
        {/* Bottom status bar */}
        <div style={{
          padding: "6px 16px",
          background: "#0a0f1c",
          borderTop: "1px solid rgba(0,229,255,0.08)",
          display: "flex", gap: 16, alignItems: "center",
        }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(0,229,255,0.4)" }}>
            ◆ Powered by FAISS + LLaMA 3.2 (local)
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(0,229,255,0.3)", marginLeft: "auto" }}>
            Click outside or press ESC to close
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

/* ═══════════════════════════════════════════════
   APPLE STUDIO DISPLAY — glass bezel, aluminum
   ═══════════════════════════════════════════════ */
function StudioDisplay({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <group position={[4.8, -0.4, -4.5]}>
      {/* Screen body */}
      <RoundedBox args={[1.5, 0.9, 0.04]} radius={0.02} position={[0, 0, 0]} castShadow>
        <meshPhysicalMaterial color="#1a1a1e" roughness={0.12} metalness={0.88} clearcoat={0.3} />
      </RoundedBox>
      {/* Glass cover */}
      <mesh position={[0, 0, 0.021]}>
        <boxGeometry args={[1.44, 0.84, 0.002]} />
        <meshPhysicalMaterial color="#000000" roughness={0.05} metalness={0} clearcoat={1} clearcoatRoughness={0.03} />
      </mesh>
      {/* Screen content */}
      <Html transform occlude="blending" position={[0, 0, 0.025]} scale={0.14}
        style={{ width: "600px", height: "370px", overflow: "hidden", pointerEvents: "none" }}>
        <RAGTerminal />
      </Html>
      {/* Invisible click target over screen */}
      <mesh
        position={[0, 0, 0.028]}
        onPointerOver={() => { setHovered(true); if (typeof document !== "undefined") document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); if (typeof document !== "undefined") document.body.style.cursor = ""; }}
        onClick={onOpen}
      >
        <planeGeometry args={[1.44, 0.84]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Hover glow ring */}
      {hovered && (
        <pointLight position={[0, 0, 0.2]} color="#00e5ff" intensity={0.6} distance={1.5} decay={2} />
      )}
      {/* Chin bezel */}
      <mesh position={[0, -0.48, 0]}>
        <boxGeometry args={[1.5, 0.06, 0.04]} />
        <meshPhysicalMaterial color="#2a2a2e" roughness={0.15} metalness={0.85} />
      </mesh>
      {/* Stand arm */}
      <mesh position={[0, -0.55, -0.04]} castShadow>
        <boxGeometry args={[0.05, 0.25, 0.05]} />
        <meshPhysicalMaterial color="#c0c0c5" roughness={0.12} metalness={0.92} />
      </mesh>
      {/* Stand base */}
      <mesh position={[0, -0.67, 0.08]} castShadow>
        <boxGeometry args={[0.5, 0.012, 0.3]} />
        <meshPhysicalMaterial color="#c0c0c5" roughness={0.12} metalness={0.92} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   MAC STUDIO — brushed aluminum
   ═══════════════════════════════════════════════ */
function MacStudio() {
  return (
    <group position={[6.0, -1.12, -4.2]}>
      <RoundedBox args={[0.2, 0.1, 0.2]} radius={0.025} castShadow>
        <meshPhysicalMaterial color="#c0c0c5" roughness={0.15} metalness={0.92} />
      </RoundedBox>
      {/* Front indicator light */}
      <mesh position={[0, -0.02, 0.101]}>
        <circleGeometry args={[0.006, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   MAGIC KEYBOARD — brushed aluminum + keys
   ═══════════════════════════════════════════════ */
function MagicKeyboard() {
  return (
    <group position={[4.5, -1.16, -3.5]}>
      <RoundedBox args={[0.85, 0.018, 0.28]} radius={0.01} castShadow>
        <meshPhysicalMaterial color="#c0c0c5" roughness={0.18} metalness={0.88} />
      </RoundedBox>
      {Array.from({ length: 4 }).map((_, row) => (
        <group key={`kr${row}`}>
          {Array.from({ length: 12 }).map((_, col) => (
            <mesh key={`k${row}-${col}`} position={[-0.35 + col * 0.06, 0.013, -0.1 + row * 0.06]}>
              <boxGeometry args={[0.045, 0.004, 0.045]} />
              <meshStandardMaterial color="#e8e8ec" roughness={0.4} metalness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   MAGIC TRACKPAD — brushed aluminum + glass top
   ═══════════════════════════════════════════════ */
function MagicTrackpad() {
  return (
    <group position={[5.5, -1.16, -3.5]}>
      <RoundedBox args={[0.35, 0.012, 0.28]} radius={0.01} castShadow>
        <meshPhysicalMaterial color="#c0c0c5" roughness={0.12} metalness={0.9} clearcoat={0.8} clearcoatRoughness={0.05} />
      </RoundedBox>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   DESK LAMP — articulated arm with warm cone light
   ═══════════════════════════════════════════════ */
function DeskLamp() {
  return (
    <group position={[3.5, -1.2, -4.2]}>
      {/* Base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.03, 16]} />
        <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Lower arm */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
        <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Joint */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Upper arm */}
      <mesh position={[0.08, 0.5, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.35, 8]} />
        <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Shade */}
      <mesh position={[0.2, 0.62, 0]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.12, 0.15, 12, 1, true]} />
        <meshStandardMaterial color="#2a4a2a" roughness={0.7} metalness={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Warm cone light */}
      <pointLight position={[0.2, 0.58, 0]} color="#FFE4B5" intensity={0.8} distance={3} castShadow />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   BOOK STACK — 4 colored spines
   ═══════════════════════════════════════════════ */
function BookStack() {
  const books = [
    { color: "#8B0000", h: 0.05 },
    { color: "#1a1a5c", h: 0.06 },
    { color: "#2d5a27", h: 0.04 },
    { color: "#5c3d1e", h: 0.05 },
  ];
  let yOff = 0;
  return (
    <group position={[6.2, -1.2, -3.7]}>
      {books.map((b, i) => {
        const y = yOff + b.h / 2;
        yOff += b.h;
        return (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <boxGeometry args={[0.22, b.h, 0.3]} />
            <meshStandardMaterial color={b.color} roughness={0.8} metalness={0.02} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   COFFEE MUG
   ═══════════════════════════════════════════════ */
function CoffeeMug() {
  return (
    <group position={[3.8, -1.14, -3.4]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 16]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.048, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.038, 16]} />
        <meshStandardMaterial color="#3a2010" roughness={0.5} />
      </mesh>
      <mesh position={[0.06, 0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.03, 0.006, 8, 16, Math.PI]} />
        <meshPhysicalMaterial color="#1a1a1a" roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   FLOWER VASE
   ═══════════════════════════════════════════════ */
function FlowerVase() {
  return (
    <group position={[6.4, -1.2, -4.0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.18, 12]} />
        <meshPhysicalMaterial color="#f0e8d8" roughness={0.6} metalness={0.02} clearcoat={0.4} />
      </mesh>
      {[0, 0.4, -0.3].map((rot, i) => (
        <mesh key={i} position={[0, 0.15, 0]} rotation={[rot * 0.15, 0, rot * 0.2]}>
          <cylinderGeometry args={[0.003, 0.003, 0.2, 6]} />
          <meshStandardMaterial color="#2a5a2a" roughness={0.8} />
        </mesh>
      ))}
      {([[0, 0.26, 0], [0.02, 0.23, 0.02], [-0.02, 0.24, -0.01]] as Array<[number,number,number]>).map(([x, y, z], i) => (
        <mesh key={`f${i}`} position={[x, y, z]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color={["#cc4466", "#dd8844", "#aa44aa"][i]} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   WALL CLOCK — live animated hands
   ═══════════════════════════════════════════════ */
function WallClock() {
  const hourRef = useRef<THREE.Mesh>(null!);
  const minRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    const now = new Date();
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    if (hourRef.current) hourRef.current.rotation.z = -((h + m / 60) / 12) * Math.PI * 2;
    if (minRef.current) minRef.current.rotation.z = -((m + s / 60) / 60) * Math.PI * 2;
  });

  return (
    <group position={[6.85, 1.2, -2]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Frame */}
      <mesh castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.06, 32]} />
        <meshStandardMaterial color="#5c3d1e" roughness={0.6} />
      </mesh>
      {/* Face */}
      <mesh position={[0, 0, 0.032]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 32]} />
        <meshStandardMaterial color="#f5efe3" roughness={0.9} />
      </mesh>
      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * 0.26, Math.cos(a) * 0.26, 0.035]}>
            <boxGeometry args={[0.01, 0.035, 0.002]} />
            <meshStandardMaterial color="#1a1008" roughness={0.5} />
          </mesh>
        );
      })}
      {/* Hour hand */}
      <mesh ref={hourRef} position={[0, 0, 0.038]}>
        <boxGeometry args={[0.012, 0.18, 0.003]} />
        <meshStandardMaterial color="#1a1008" roughness={0.5} />
      </mesh>
      {/* Minute hand */}
      <mesh ref={minRef} position={[0, 0, 0.04]}>
        <boxGeometry args={[0.008, 0.24, 0.002]} />
        <meshStandardMaterial color="#1a1008" roughness={0.5} />
      </mesh>
      {/* Center pin */}
      <mesh position={[0, 0, 0.042]}>
        <sphereGeometry args={[0.014, 8, 8]} />
        <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   CORNER LANTERN — warm orange wall lantern
   mounted at top corners where wall meets ceiling
   ═══════════════════════════════════════════════ */
function CornerLantern({ position }: { position: [number, number, number] }) {
  const glowRef = useRef<THREE.PointLight>(null!);
  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    // Gentle flicker effect
    const t = clock.getElapsedTime();
    glowRef.current.intensity = 2.2 + Math.sin(t * 4.1) * 0.12 + Math.sin(t * 7.3) * 0.06;
  });

  return (
    <group position={position}>
      {/* Wall bracket arm */}
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[0.06, 0.06, 0.25]} />
        <meshStandardMaterial color="#8b6914" roughness={0.4} metalness={0.75} />
      </mesh>
      {/* Bracket curl top */}
      <mesh position={[0, 0.04, 0.22]}>
        <torusGeometry args={[0.05, 0.012, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#c9a448" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Main lantern body — hexagonal frame */}
      <group position={[0, -0.18, 0.24]}>
        {/* Top cap */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.09, 0.13, 0.06, 6]} />
          <meshStandardMaterial color="#c9a448" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Pyramid roof */}
        <mesh position={[0, 0.28, 0]}>
          <coneGeometry args={[0.11, 0.14, 6]} />
          <meshStandardMaterial color="#8b6914" roughness={0.3} metalness={0.75} />
        </mesh>
        {/* Hook on top */}
        <mesh position={[0, 0.38, 0]}>
          <torusGeometry args={[0.03, 0.008, 6, 10, Math.PI]} />
          <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* 6 vertical corner bars */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.1, 0, Math.sin(angle) * 0.1]}>
              <cylinderGeometry args={[0.008, 0.008, 0.44, 4]} />
              <meshStandardMaterial color="#c9a448" roughness={0.25} metalness={0.85} />
            </mesh>
          );
        })}

        {/* Glass panels — 6 faces */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.088, 0, Math.sin(angle) * 0.088]} rotation={[0, -angle, 0]}>
              <planeGeometry args={[0.115, 0.42]} />
              <meshPhysicalMaterial
                color="#FFB347" transparent opacity={0.25}
                roughness={0} metalness={0}
                emissive="#FF8800" emissiveIntensity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}

        {/* Bottom cap */}
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.13, 0.07, 0.06, 6]} />
          <meshStandardMaterial color="#c9a448" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Pendant drop */}
        <mesh position={[0, -0.29, 0]}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshStandardMaterial color="#d4af37" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Warm orange point light — the actual glow */}
        <pointLight ref={glowRef} color="#FFB347" intensity={1.5} distance={8} decay={2} />

        {/* Soft inner bloom */}
        <mesh>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FFD580" emissive="#FFD580" emissiveIntensity={2.5} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════════
   HOLOGRAM PARTICLES — floating glowing dots
   ═══════════════════════════════════════════════ */
function HologramParticles() {
  const count = 35;
  const meshRefs = useRef<THREE.Mesh[]>([]);

  const configs = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 1.1,
      y: Math.random() * 1.8 - 0.3,
      z: (Math.random() - 0.5) * 1.1,
      speed: 0.25 + Math.random() * 0.55,
      offset: Math.random() * Math.PI * 2,
      color: ["#00E5FF", "#7B61FF", "#00FFA3"][Math.floor(Math.random() * 3)],
    })), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((m, i) => {
      if (!m) return;
      const c = configs[i];
      m.position.y = c.y + Math.sin(t * c.speed + c.offset) * 0.18;
      m.position.x = c.x + Math.sin(t * c.speed * 0.7 + c.offset + 1) * 0.08;
      m.position.z = c.z + Math.cos(t * c.speed * 0.5 + c.offset) * 0.08;
    });
  });

  return (
    <group>
      {configs.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) meshRefs.current[i] = el; }}
          position={[c.x, c.y, c.z]}
        >
          <sphereGeometry args={[0.013, 4, 4]} />
          <meshStandardMaterial
            color={c.color} emissive={c.color} emissiveIntensity={1.2}
            transparent opacity={0.75} depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   SCANLINE TEXTURE — baked canvas, reused once
   ═══════════════════════════════════════════════ */
function useScanlineTexture() {
  return useMemo(() => {
    const W = 2, H = 256;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = "rgba(0,229,255,0.12)";
        ctx.fillRect(0, y, W, 1);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 5);
    return tex;
  }, []);
}

/* ═══════════════════════════════════════════════
   HOLOGRAM ASSISTANT — cinematic Iron Man / Star Wars style
   • AdditiveBlending removes dark background naturally
   • Animated scanlines scroll upward
   • Flicker + glitch in useFrame
   • Billboard: always faces camera
   • Volumetric cone from projector to hologram base
   • Color-cycling glow ring + light
   ═══════════════════════════════════════════════ */
function HologramAssistant({ onChatOpen }: { onChatOpen: () => void }) {
  const groupRef = useRef<THREE.Group>(null!);     // billboard root
  const bodyRef = useRef<THREE.Group>(null!);      // float bob
  const beamRef = useRef<THREE.Mesh>(null!);       // unused (cone removed)
  const glowRingRef = useRef<THREE.Mesh>(null!);
  const tintRef = useRef<THREE.Mesh>(null!);       // color tint overlay
  const outerGlowRef = useRef<THREE.Mesh>(null!);
  const scanlineRef = useRef<THREE.Mesh>(null!);   // animated scanlines
  const lightRef = useRef<THREE.PointLight>(null!);
  const photoRef = useRef<THREE.Mesh>(null!);      // for flicker / glitch

  const photoTex = useTexture("/me.jpeg");
  const scanTex = useScanlineTexture();

  const COLORS = useMemo(() => [
    new THREE.Color("#00E5FF"),
    new THREE.Color("#7B61FF"),
    new THREE.Color("#00FFA3"),
    new THREE.Color("#00BFFF"),
  ], []);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();

    // ── Billboard: rotate entire group to face camera (Y axis only) ──
    if (groupRef.current) {
      const pos = groupRef.current.getWorldPosition(new THREE.Vector3());
      const dir = camera.position.clone().sub(pos);
      dir.y = 0;
      if (dir.lengthSq() > 0.001) {
        groupRef.current.rotation.y = Math.atan2(dir.x, dir.z);
      }
    }

    // ── Float bob ──
    if (bodyRef.current) {
      bodyRef.current.position.y = 0.15 + Math.sin(t * 0.8) * 0.055;
    }

    // ── Beam pulse ──
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.06 + Math.sin(t * 2.2) * 0.025;
    }

    // ── Scanlines: scroll upward ──
    if (scanlineRef.current) {
      const mat = scanlineRef.current.material as THREE.MeshBasicMaterial;
      if (mat.map) mat.map.offset.y = -(t * 0.4) % 1;
    }

    // ── Flicker: randomize photo opacity ──
    if (photoRef.current) {
      const mat = photoRef.current.material as THREE.MeshBasicMaterial;
      // Mostly stable, occasional dip
      const flicker = Math.random() > 0.97 ? 0.55 + Math.random() * 0.15 : 0.88;
      mat.opacity = flicker;
    }

    // ── Color cycle ──
    const cycle = (t * 0.3) % COLORS.length;
    const idx = Math.floor(cycle);
    const frac = cycle - idx;
    const col = COLORS[idx].clone().lerp(COLORS[(idx + 1) % COLORS.length], frac);

    if (glowRingRef.current) {
      const m = glowRingRef.current.material as THREE.MeshStandardMaterial;
      m.color.copy(col); m.emissive.copy(col);
    }
    if (tintRef.current) {
      const m = tintRef.current.material as THREE.MeshBasicMaterial;
      m.color.copy(col);
    }
    if (outerGlowRef.current) {
      const m = outerGlowRef.current.material as THREE.MeshBasicMaterial;
      m.color.copy(col);
    }
    if (lightRef.current) {
      lightRef.current.color.copy(col);
    }

    // ── Glitch: occasionally shift photo UV offset ──
    if (photoRef.current) {
      const mat = photoRef.current.material as THREE.MeshBasicMaterial;
      if (mat.map && Math.random() > 0.994) {
        // brief horizontal glitch strip
        mat.map.offset.x = (Math.random() - 0.5) * 0.04;
        setTimeout(() => { if (mat.map) mat.map.offset.x = 0; }, 80);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -2, -1.5]} scale={[1.3, 1.3, 1.3]}>
      {/* ── Projector base ── */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.1, 24]} />
        <meshPhysicalMaterial color="#1a1a2e" roughness={0.15} metalness={0.92} />
      </mesh>
      {/* Projector details — concentric rings */}
      {[0.28, 0.20, 0.12].map((r, i) => (
        <mesh key={i} position={[0, 0.055, 0]}>
          <torusGeometry args={[r, 0.007, 6, 32]} />
          <meshStandardMaterial color="#c9a448" emissive="#c9a448" emissiveIntensity={0.3} roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      {/* Emitter ring — color shifts */}
      <mesh ref={glowRingRef} position={[0, 0.06, 0]}>
        <torusGeometry args={[0.32, 0.025, 8, 48]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2.0} roughness={0.05} metalness={0.5} />
      </mesh>


      {/* ── Hologram body ── */}
      <group ref={bodyRef} position={[0, 0.15, 0]}>

        {/* Photo — AdditiveBlending removes black background naturally
            dark pixels vanish, skin tones and suit glow through */}
        <mesh ref={photoRef} position={[0, 0.9, 0]}>
          <planeGeometry args={[0.78, 1.14]} />
          <meshBasicMaterial
            map={photoTex}
            transparent
            opacity={0.88}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Cyan tint overlay — color shifts, AdditiveBlending = pure color glow */}
        <mesh ref={tintRef} position={[0, 0.9, 0.002]}>
          <planeGeometry args={[0.78, 1.14]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.08}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Scanline overlay — scrolls upward */}
        <mesh ref={scanlineRef} position={[0, 0.9, 0.004]}>
          <planeGeometry args={[0.78, 1.14]} />
          <meshBasicMaterial
            map={scanTex}
            transparent
            opacity={0.55}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Edge glow — slightly larger back plane, AdditiveBlending */}
        <mesh ref={outerGlowRef} position={[0, 0.9, -0.006]}>
          <planeGeometry args={[0.96, 1.36]} />
          <meshBasicMaterial
            color="#00E5FF"
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Bottom base holo-ring on floor */}
        <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.48, 48]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 32]} />
          <meshBasicMaterial color="#00AAFF" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* Vertical edge lines — suggest 3D depth */}
        {[-0.38, 0.38].map((x, i) => (
          <mesh key={i} position={[x, 0.9, 0.005]}>
            <planeGeometry args={[0.008, 1.14]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}
        {/* Top + bottom edge lines */}
        {[-0.45, 1.47 - 0.12].map((y, i) => (
          <mesh key={i} position={[0, y, 0.005]}>
            <planeGeometry args={[0.78, 0.006]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))}

        {/* Name label */}
        <Html center position={[0, 1.68, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            fontFamily: "monospace", fontSize: "11px", letterSpacing: "4px",
            color: "#00E5FF", textShadow: "0 0 14px #00E5FF, 0 0 28px #00E5FF80",
            textTransform: "uppercase", whiteSpace: "nowrap", textAlign: "center",
          }}>
            DARSHAN U
          </div>
          <div style={{
            fontFamily: "monospace", fontSize: "8px", letterSpacing: "2px",
            color: "#00E5FF88", textAlign: "center", marginTop: "3px",
          }}>
            CYBERSECURITY · AI
          </div>
        </Html>

        {/* Click target */}
        <Html center position={[0, -0.28, 0]} style={{ pointerEvents: "auto" }}>
          <div
            onClick={onChatOpen}
            style={{
              cursor: "pointer", padding: "5px 14px",
              border: "1px solid #00E5FF55",
              background: "rgba(0,229,255,0.05)",
              fontFamily: "monospace", fontSize: "9px",
              letterSpacing: "3px", color: "#00E5FFaa",
              whiteSpace: "nowrap",
              animation: "holo-pulse 2s ease-in-out infinite",
            }}
          >
            ▶ ASK ME
            <style>{`
              @keyframes holo-pulse {
                0%,100% { opacity:0.7; } 50% { opacity:1; }
              }
            `}</style>
          </div>
        </Html>
      </group>

      {/* Floating particles */}
      <HologramParticles />

      {/* Color-shifting point light */}
      <pointLight ref={lightRef} position={[0, 1.0, 0]} color="#00E5FF" intensity={1.2} distance={5} decay={2} />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   HOLOGRAM CHAT OVERLAY — full-screen RAG chat
   ═══════════════════════════════════════════════ */
function HologramChatOverlay({ onClose }: { onClose: () => void }) {
  return (
    <Html fullscreen style={{ pointerEvents: "auto" }}>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,5,20,0.88)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: "12px", padding: "0 4px",
          }}>
            <div style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "4px", color: "#00E5FF" }}>
              ◈ HOLOGRAM ASSISTANT — DARSHAN U
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "1px solid #00E5FF44", color: "#00E5FF88",
                fontFamily: "monospace", fontSize: "11px", padding: "3px 10px",
                cursor: "pointer", letterSpacing: "2px",
              }}
            >
              ✕ CLOSE
            </button>
          </div>
          <RAGTerminal />
        </div>
      </div>
    </Html>
  );
}

/* ═══════════════════════════════════════════════
   SCENE CONTENT — manages chat + door state
   ═══════════════════════════════════════════════ */
function SceneContent() {
  const [chatOpen, setChatOpen] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [monitorOpen, setMonitorOpen] = useState(false);

  return (
    <>
      <Room />
      <Door doorOpen={doorOpen} onToggle={() => setDoorOpen((v) => !v)} />
      <Desk />
      <StudioDisplay onOpen={() => setMonitorOpen(true)} />
      {monitorOpen && <MonitorModal onClose={() => setMonitorOpen(false)} />}
      <MacStudio />
      <MagicKeyboard />
      <MagicTrackpad />
      <DeskLamp />
      <BookStack />
      <CoffeeMug />
      <FlowerVase />
      <WallClock />
      <HologramAssistant onChatOpen={() => setChatOpen(true)} />
      {chatOpen && <HologramChatOverlay onClose={() => setChatOpen(false)} />}
      <ContactSwitchPanel />
      <ResumeBox />
      <WallDisplays />
      <DeskHotspots />
      <CyberParticles />
      {/* Space only visible when door is open */}
      {doorOpen && <SpaceEnvironment />}
      {/* Outside sunlight floods in through open door */}
      {doorOpen && (
        <pointLight
          position={[0, 0, 8]}
          color="#a0c8ff"
          intensity={3.5}
          distance={18}
        />
      )}
      <Lights />
    </>
  );
}
function Lights() {
  return (
    <>
      {/* Strong white ambient — base visibility for ALL materials */}
      <ambientLight intensity={1.5} color="#ffffff" />

      {/* Main directional from above — acts like the sun */}
      <directionalLight position={[5, 10, 5]} color="#ffffff" intensity={2.0} castShadow />
      <directionalLight position={[-5, 10, -5]} color="#fff8e0" intensity={1.0} />

      {/* Ceiling point lights — directly overhead, cannot miss walls */}
      <pointLight position={[0, 2.5, 0]}    color="#ffe8c0" intensity={4} distance={20} />
      <pointLight position={[-4, 2.5, -2]}  color="#ffd580" intensity={3} distance={14} />
      <pointLight position={[4, 2.5, -2]}   color="#ffd580" intensity={3} distance={14} />
      <pointLight position={[-4, 2.5, 3]}   color="#ffd580" intensity={3} distance={14} />
      <pointLight position={[4, 2.5, 3]}    color="#ffd580" intensity={3} distance={14} />

      {/* Wall-hugging lights — shine directly onto each wall face */}
      <pointLight position={[0, 1, -5.5]}   color="#ffe0a0" intensity={3} distance={8} />  {/* back wall */}
      <pointLight position={[-6.5, 1, 0]}   color="#ffe0a0" intensity={3} distance={8} />  {/* left wall */}
      <pointLight position={[6.5, 1, 0]}    color="#ffe0a0" intensity={3} distance={8} />  {/* right wall */}
      <pointLight position={[0, 1, 5.5]}    color="#ffe0a0" intensity={3} distance={8} />  {/* front wall */}

      {/* Floor bounce */}
      <pointLight position={[0, -1.5, 0]}   color="#ff9944" intensity={1} distance={14} />

      {/* Desk area */}
      <pointLight position={[4.8, 1, -3.8]} color="#ffe8c0" intensity={3} distance={6} />
    </>
  );
}

/* ═══════════════════════════════════════════════
   MAIN EXPORT — Canvas with 360° orbit + auto-rotate
   ═══════════════════════════════════════════════ */
export default function Room3D() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        shadows
        camera={{ position: [0, 1, 4], fov: 75, near: 0.1, far: 300 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <color attach="background" args={["#0a0510"]} />
        <Suspense fallback={null}>
          <SceneContent />
          <OrbitControls
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.4}
            minDistance={1}
            maxDistance={6}
            target={[0, 0, -1]}
            enableDamping
            dampingFactor={0.05}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 1.8}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
