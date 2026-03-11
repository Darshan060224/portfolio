"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, RoundedBox } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import RAGTerminal from "./RAGTerminal";
import WallDisplays from "./WallDisplays";
import DeskHotspots from "./DeskHotspots";
import CyberParticles from "./CyberParticles";
import * as THREE from "three";

/* ═══════════════════════════════════════════════
   DAMASK WALLPAPER TEXTURE — procedural canvas
   ═══════════════════════════════════════════════ */
function useDamaskTexture(w = 512, h = 512) {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#2a1205";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(212,175,55,0.15)";
    const S = 64;
    for (let y = 0; y < h; y += S) {
      for (let x = 0; x < w; x += S) {
        const cx = x + S / 2, cy = y + S / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - S * 0.38);
        ctx.lineTo(cx + S * 0.28, cy);
        ctx.lineTo(cx, cy + S * 0.38);
        ctx.lineTo(cx - S * 0.28, cy);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx, cy, S * 0.12, S * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, S * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.strokeStyle = "rgba(212,175,55,0.08)";
    ctx.lineWidth = 1;
    for (let y = S / 2; y < h; y += S) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < w; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.08) * 4);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 3);
    return tex;
  }, [w, h]);
}

/* ═══════════════════════════════════════════════
   ROOM — W=14, D=12, H=5, wall thickness=0.3
   ═══════════════════════════════════════════════ */
function Room() {
  const W = 14, D = 12, H = 5, T = 0.3;
  const wallTex = useDamaskTexture();

  return (
    <group>
      {/* ── FLOOR ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshPhysicalMaterial color="#1e1208" roughness={0.6} metalness={0.02} clearcoat={0.35} clearcoatRoughness={0.4} />
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
        <meshStandardMaterial color="#6b1520" roughness={0.85} />
      </mesh>
      {/* Gold carpet borders — double line */}
      {([
        { pos: [0, -1.994, -(D / 2 - 0.6)] as [number, number, number], args: [W - 0.8, 0.12] as [number, number] },
        { pos: [0, -1.994, (D / 2 - 0.6)] as [number, number, number], args: [W - 0.8, 0.12] as [number, number] },
        { pos: [-(W / 2 - 0.6), -1.994, 0] as [number, number, number], args: [0.12, D - 0.8] as [number, number] },
        { pos: [(W / 2 - 0.6), -1.994, 0] as [number, number, number], args: [0.12, D - 0.8] as [number, number] },
      ]).map((b, i) => (
        <mesh key={`cb-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={b.pos}>
          <planeGeometry args={b.args} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      {/* Inner border line */}
      {([
        { pos: [0, -1.993, -(D / 2 - 0.9)] as [number, number, number], args: [W - 1.4, 0.06] as [number, number] },
        { pos: [0, -1.993, (D / 2 - 0.9)] as [number, number, number], args: [W - 1.4, 0.06] as [number, number] },
        { pos: [-(W / 2 - 0.9), -1.993, 0] as [number, number, number], args: [0.06, D - 1.4] as [number, number] },
        { pos: [(W / 2 - 0.9), -1.993, 0] as [number, number, number], args: [0.06, D - 1.4] as [number, number] },
      ]).map((b, i) => (
        <mesh key={`cbi-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={b.pos}>
          <planeGeometry args={b.args} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
        </mesh>
      ))}
      {/* Center diamond medallion */}
      <mesh rotation={[-Math.PI / 2, Math.PI / 4, 0]} position={[0, -1.992, 0]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshStandardMaterial color="#7a1a25" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, Math.PI / 4, 0]} position={[0, -1.991, 0]}>
        <ringGeometry args={[1.1, 1.2, 4]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* ── CEILING ── */}
      <mesh position={[0, H - 2, 0]}>
        <boxGeometry args={[W + T * 2, T, D + T * 2]} />
        <meshStandardMaterial color="#1a1008" roughness={0.95} />
      </mesh>

      {/* ── WALLS (thick box geometry) ── */}
      {/* Back wall (z-) */}
      <mesh position={[0, H / 2 - 2, -D / 2 - T / 2]}>
        <boxGeometry args={[W + T * 2, H, T]} />
        <meshStandardMaterial map={wallTex} color="#3a1a0a" roughness={0.88} />
      </mesh>
      {/* Front wall left of door */}
      <mesh position={[-W / 4 - 0.6, H / 2 - 2, D / 2 + T / 2]}>
        <boxGeometry args={[W / 2 - 0.8, H, T]} />
        <meshStandardMaterial map={wallTex} color="#3a1a0a" roughness={0.88} />
      </mesh>
      {/* Front wall right of door */}
      <mesh position={[W / 4 + 0.6, H / 2 - 2, D / 2 + T / 2]}>
        <boxGeometry args={[W / 2 - 0.8, H, T]} />
        <meshStandardMaterial map={wallTex} color="#3a1a0a" roughness={0.88} />
      </mesh>
      {/* Door header */}
      <mesh position={[0, H - 2 - 0.4, D / 2 + T / 2]}>
        <boxGeometry args={[2.0, 0.8, T]} />
        <meshStandardMaterial map={wallTex} color="#3a1a0a" roughness={0.88} />
      </mesh>
      {/* Left wall (x-) */}
      <mesh position={[-W / 2 - T / 2, H / 2 - 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <meshStandardMaterial map={wallTex} color="#3a1a0a" roughness={0.88} />
      </mesh>
      {/* Right wall (x+) */}
      <mesh position={[W / 2 + T / 2, H / 2 - 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <meshStandardMaterial map={wallTex} color="#3a1a0a" roughness={0.88} />
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
      {/* Door panel (slightly ajar) */}
      <group position={[0.85, -2, D / 2 + T / 2]} rotation={[0, -0.35, 0]}>
        <mesh position={[-0.85, H / 2 - 0.4, 0]}>
          <boxGeometry args={[1.6, H - 0.8, 0.06]} />
          <meshStandardMaterial color="#3a2210" roughness={0.75} metalness={0.02} />
        </mesh>
        <mesh position={[-1.5, H / 2 - 0.5, 0.06]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
        </mesh>
        <mesh position={[-1.5, H / 2 - 0.5, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 8]} />
          <meshStandardMaterial color="#c9a448" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* ── GOLD BASEBOARDS ── */}
      {([
        { pos: [0, -1.88, -D / 2 + 0.02] as [number, number, number], rot: [0, 0, 0] as [number, number, number], w: W },
        { pos: [-W / 2 + 0.02, -1.88, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], w: D },
        { pos: [W / 2 - 0.02, -1.88, 0] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number], w: D },
      ]).map((b, i) => (
        <mesh key={`base${i}`} position={b.pos} rotation={b.rot}>
          <boxGeometry args={[b.w, 0.2, 0.05]} />
          <meshStandardMaterial color="#c9a448" roughness={0.25} metalness={0.75} />
        </mesh>
      ))}

      {/* ── CROWN MOLDING ── */}
      {([
        { pos: [0, H - 2.06, -D / 2 + 0.02] as [number, number, number], rot: [0, 0, 0] as [number, number, number], w: W },
        { pos: [-W / 2 + 0.02, H - 2.06, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], w: D },
        { pos: [W / 2 - 0.02, H - 2.06, 0] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number], w: D },
      ]).map((b, i) => (
        <mesh key={`crown${i}`} position={b.pos} rotation={b.rot}>
          <boxGeometry args={[b.w, 0.12, 0.06]} />
          <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   DESK — right corner position [4.8, 0, -3.8]
   ═══════════════════════════════════════════════ */
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
      {([[-1.35, -0.6], [1.35, -0.6], [-1.35, 0.6], [1.35, 0.6]] as [number, number][]).map(([x, z], i) => (
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
   APPLE STUDIO DISPLAY — glass bezel, aluminum
   ═══════════════════════════════════════════════ */
function StudioDisplay() {
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
        style={{ width: "600px", height: "370px", overflow: "hidden" }}>
        <RAGTerminal />
      </Html>
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
      {([[0, 0.26, 0], [0.02, 0.23, 0.02], [-0.02, 0.24, -0.01]] as [number, number, number][]).map(([x, y, z], i) => (
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
   HOLOGRAM PROJECTOR — volumetric beam, scan rings,
   /me.jpeg portrait floating above
   ═══════════════════════════════════════════════ */
function HologramProjector() {
  const holoRef = useRef<THREE.Group>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const portraitTex = useLoader(THREE.TextureLoader, "/me.jpeg");

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (holoRef.current) holoRef.current.rotation.y = t * 0.3;
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.5;
      ring1Ref.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.4;
      ring2Ref.current.rotation.x = Math.cos(t * 0.2) * 0.3;
    }
  });

  return (
    <group position={[-2.5, -2, -1]}>
      {/* Base disc */}
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.4, 0.08, 24]} />
        <meshPhysicalMaterial color="#1a1a2e" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Emitter ring */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.3, 0.018, 8, 32]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={0.5} roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Volumetric beam cone */}
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[0.55, 1.2, 32, 1, true]} />
        <meshStandardMaterial color="#00E5FF" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating portrait */}
      <group ref={holoRef} position={[0, 1.1, 0]}>
        {/* Portrait plane with /me.jpeg */}
        <mesh>
          <planeGeometry args={[0.5, 0.6]} />
          <meshStandardMaterial
            map={portraitTex}
            transparent
            opacity={0.7}
            emissive="#00E5FF"
            emissiveIntensity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Scan ring 1 */}
        <mesh ref={ring1Ref} position={[0, -0.1, 0]}>
          <torusGeometry args={[0.45, 0.008, 8, 48]} />
          <meshStandardMaterial color="#7B61FF" transparent opacity={0.5} emissive="#7B61FF" emissiveIntensity={0.8} />
        </mesh>
        {/* Scan ring 2 */}
        <mesh ref={ring2Ref} position={[0, 0.1, 0]}>
          <torusGeometry args={[0.38, 0.006, 8, 48]} />
          <meshStandardMaterial color="#FF2E88" transparent opacity={0.4} emissive="#FF2E88" emissiveIntensity={0.6} />
        </mesh>

        {/* Name label */}
        <Html center position={[0, 0.5, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            fontFamily: "monospace", fontSize: "11px", letterSpacing: "4px",
            color: "#00E5FF", textShadow: "0 0 10px #00E5FF80",
            textTransform: "uppercase", whiteSpace: "nowrap",
          }}>
            Darshan
          </div>
        </Html>
      </group>

      {/* Base glow light */}
      <pointLight position={[0, 0.5, 0]} color="#00E5FF" intensity={0.6} distance={3} />
    </group>
  );
}

/* ═══════════════════════════════════════════════
   CINEMATIC LIGHTING
   ═══════════════════════════════════════════════ */
function Lights() {
  return (
    <>
      {/* Soft ambient fill */}
      <ambientLight intensity={0.2} color="#FFE4B5" />
      {/* Main ceiling overhead */}
      <pointLight position={[0, 2.5, 0]} color="#FFE4B5" intensity={0.5} distance={14} castShadow />
      {/* Directional key light */}
      <directionalLight position={[5, 4, 3]} color="#FFF8DC" intensity={0.3} castShadow />
      {/* Left fill */}
      <pointLight position={[-4, 2, -3]} color="#FFE4B5" intensity={0.25} distance={8} />
      {/* Right fill */}
      <pointLight position={[4, 2, 2]} color="#FFE4B5" intensity={0.25} distance={8} />
      {/* Back wall wash */}
      <spotLight position={[0, 2.8, -5.5]} angle={0.4} penumbra={0.5} color="#FFF8DC" intensity={0.6} distance={6} castShadow />
      {/* Left wall wash */}
      <spotLight position={[-6.5, 2.8, 0]} angle={0.4} penumbra={0.5} color="#FFF8DC" intensity={0.5} distance={6} castShadow />
      {/* Right wall wash */}
      <spotLight position={[6.5, 2.8, 0]} angle={0.4} penumbra={0.5} color="#FFF8DC" intensity={0.5} distance={6} castShadow />
      {/* Desk spot */}
      <spotLight position={[4.8, 2. , -3.8]} angle={0.5} penumbra={0.6} color="#FFE4B5" intensity={0.5} distance={5} castShadow />
      {/* Rim light from behind camera */}
      <pointLight position={[0, 1, 5]} color="#FFE0C0" intensity={0.15} distance={10} />
      {/* Museum spotlights above skill board (right wall) */}
      <spotLight position={[6.0, 2.8, -2.5]} angle={0.35} penumbra={0.4} color="#FFD700" intensity={0.4} distance={5} target-position={[6.85, 0.8, -1]} castShadow />
      <spotLight position={[6.0, 2.8, 0]} angle={0.35} penumbra={0.4} color="#FFD700" intensity={0.4} distance={5} castShadow />
      <spotLight position={[6.0, 2.8, 1.5]} angle={0.35} penumbra={0.4} color="#FFD700" intensity={0.3} distance={5} castShadow />
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
        camera={{ position: [6, 2, 6], fov: 55, near: 0.1, far: 100 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }}
      >
        <color attach="background" args={["#2a1505"]} />
        <fogExp2 attach="fog" args={["#2a1505", 0.018]} />
        <Suspense fallback={null}>
          <Room />
          <Desk />
          <StudioDisplay />
          <MacStudio />
          <MagicKeyboard />
          <MagicTrackpad />
          <DeskLamp />
          <BookStack />
          <CoffeeMug />
          <FlowerVase />
          <WallClock />
          <HologramProjector />
          <WallDisplays />
          <DeskHotspots />
          <CyberParticles />
          <Lights />
          <OrbitControls
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
            minDistance={2}
            maxDistance={10}
            target={[0, 0, -1]}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
