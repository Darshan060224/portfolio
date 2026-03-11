"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, Environment, Float, ContactShadows, RoundedBox } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import RAGTerminal from "./RAGTerminal";
import WallDisplays from "./WallDisplays";
import DeskHotspots from "./DeskHotspots";
import CyberParticles from "./CyberParticles";
import * as THREE from "three";

/* ───── Enclosed Room ───── */
function Room() {
  const W = 14, D = 12, H = 5;
  return (
    <group>
      {/* Wooden Floor — realistic */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshPhysicalMaterial color="#b8895a" roughness={0.55} metalness={0.02} clearcoat={0.3} clearcoatRoughness={0.4} />
      </mesh>
      {/* Floor plank lines */}
      {Array.from({ length: 13 }).map((_, i) => (
        <mesh key={`p${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[-6 + i, -1.998, 0]}>
          <planeGeometry args={[0.008, D]} />
          <meshStandardMaterial color="#a07c52" roughness={1} />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H - 2, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#f8f5f0" roughness={0.95} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, H / 2 - 2, -D / 2]} receiveShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#f3efe9" roughness={0.92} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, H / 2 - 2, D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#f3efe9" roughness={0.92} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-W / 2, H / 2 - 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#edead5" roughness={0.92} />
      </mesh>
      {/* Right wall */}
      <mesh position={[W / 2, H / 2 - 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial color="#edead5" roughness={0.92} />
      </mesh>

      {/* Baseboards */}
      {[
        { pos: [0, -1.92, -D / 2 + 0.02] as [number, number, number], rot: [0, 0, 0] as [number, number, number], w: W },
        { pos: [-W / 2 + 0.02, -1.92, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], w: D },
        { pos: [W / 2 - 0.02, -1.92, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], w: D },
      ].map((b, i) => (
        <mesh key={`base${i}`} position={b.pos} rotation={b.rot}>
          <boxGeometry args={[b.w, 0.14, 0.04]} />
          <meshStandardMaterial color="#e8e2d8" roughness={0.8} />
        </mesh>
      ))}

      {/* Ceiling light panel (center room) */}
      <mesh position={[0, 2.97, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 0.6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      {/* Ceiling light panel above desk */}
      <mesh position={[4, 2.97, -2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 0.5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
      {/* Recessed spots */}
      {[-3, 3].map((x, i) => (
        <mesh key={`spot${i}`} position={[x, 2.97, 1.5]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.2, 16]} />
          <meshStandardMaterial color="#fff" emissive="#fffaf0" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ───── Realistic Wooden Desk ───── */
function Desk() {
  return (
    <group position={[4, 0, -2]}>
      {/* Desktop surface — thick slab with rounded edges */}
      <mesh position={[0, -0.27, 0]} castShadow receiveShadow>
        <RoundedBox args={[4.2, 0.12, 1.8]} radius={0.02} smoothness={4}>
          <meshStandardMaterial color="#7a5930" roughness={0.5} metalness={0.02} />
        </RoundedBox>
      </mesh>
      {/* Desktop wood grain strip (top) */}
      <mesh position={[0, -0.208, 0]}>
        <RoundedBox args={[4.18, 0.003, 1.78]} radius={0.01} smoothness={2}>
          <meshStandardMaterial color="#8d6a3e" roughness={0.45} metalness={0.01} />
        </RoundedBox>
      </mesh>
      {/* Front edge highlight */}
      <mesh position={[0, -0.27, 0.9]}>
        <RoundedBox args={[4.2, 0.12, 0.01]} radius={0.005} smoothness={2}>
          <meshStandardMaterial color="#6e5028" roughness={0.4} metalness={0.03} />
        </RoundedBox>
      </mesh>

      {/* 4 Legs — tapered rounded */}
      {[
        [-1.9, -1.15, -0.75],
        [1.9, -1.15, -0.75],
        [-1.9, -1.15, 0.75],
        [1.9, -1.15, 0.75],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <RoundedBox args={[0.08, 1.35, 0.08]} radius={0.015} smoothness={3}>
            <meshStandardMaterial color="#6e5028" roughness={0.5} metalness={0.04} />
          </RoundedBox>
        </mesh>
      ))}

      {/* Cross support bar (back) */}
      <mesh position={[0, -1.2, -0.75]} castShadow>
        <RoundedBox args={[3.8, 0.06, 0.06]} radius={0.01} smoothness={2}>
          <meshStandardMaterial color="#6e5028" roughness={0.55} metalness={0.03} />
        </RoundedBox>
      </mesh>
      {/* Cross brace (side) */}
      {[-1.9, 1.9].map((x, i) => (
        <mesh key={`sb${i}`} position={[x, -0.8, 0]} castShadow>
          <RoundedBox args={[0.05, 0.05, 1.4]} radius={0.01} smoothness={2}>
            <meshStandardMaterial color="#6e5028" roughness={0.55} metalness={0.03} />
          </RoundedBox>
        </mesh>
      ))}
    </group>
  );
}

/* ───── Apple Studio Display (Realistic) ───── */
function StudioDisplay() {
  const tilt = -Math.PI * 0.04;
  return (
    <group position={[4, 0.65, -2.5]}>
      {/* ── Screen Assembly ── */}
      <group rotation={[tilt, 0, 0]}>
        {/* Back panel — aluminum with depth */}
        <mesh castShadow position={[0, 0, -0.04]}>
          <RoundedBox args={[2.85, 1.7, 0.05]} radius={0.04} smoothness={4}>
            <meshStandardMaterial color="#c8c8cc" roughness={0.18} metalness={0.92} />
          </RoundedBox>
        </mesh>

        {/* Mid frame — slight inset */}
        <mesh position={[0, 0, -0.01]}>
          <RoundedBox args={[2.82, 1.67, 0.03]} radius={0.035} smoothness={4}>
            <meshStandardMaterial color="#d0d0d4" roughness={0.15} metalness={0.9} />
          </RoundedBox>
        </mesh>

        {/* Front bezel frame */}
        <mesh position={[0, 0, 0.015]}>
          <RoundedBox args={[2.8, 1.65, 0.01]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#1a1a1a" roughness={0.85} metalness={0.1} />
          </RoundedBox>
        </mesh>

        {/* Screen glass — slightly inset */}
        <mesh position={[0, 0.02, 0.022]}>
          <RoundedBox args={[2.58, 1.42, 0.004]} radius={0.01} smoothness={2}>
            <meshPhysicalMaterial
              color="#0a0a0a"
              roughness={0.05}
              metalness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.05}
              reflectivity={0.9}
            />
          </RoundedBox>
        </mesh>

        {/* Camera notch */}
        <mesh position={[0, 0.78, 0.022]}>
          <sphereGeometry args={[0.013, 12, 12]} />
          <meshStandardMaterial color="#222" roughness={0.4} metalness={0.5} />
        </mesh>
        {/* Camera housing ring */}
        <mesh position={[0, 0.78, 0.023]}>
          <torusGeometry args={[0.017, 0.003, 8, 16]} />
          <meshStandardMaterial color="#444" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Terminal embedded in screen */}
        <Html
          transform
          occlude="blending"
          position={[0, 0.02, 0.025]}
          scale={0.21}
          style={{
            width: "660px",
            height: "400px",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div style={{ width: "660px", height: "400px", overflow: "hidden" }}>
            <RAGTerminal />
          </div>
        </Html>

        {/* Chin section */}
        <mesh position={[0, -0.87, -0.01]} castShadow>
          <RoundedBox args={[2.85, 0.12, 0.06]} radius={0.02} smoothness={3}>
            <meshStandardMaterial color="#c8c8cc" roughness={0.18} metalness={0.92} />
          </RoundedBox>
        </mesh>

        {/* Apple logo on chin */}
        <mesh position={[0, -0.87, 0.025]}>
          <circleGeometry args={[0.025, 16]} />
          <meshStandardMaterial color="#a0a0a0" roughness={0.1} metalness={0.95} />
        </mesh>
      </group>

      {/* ── Stand Arm — tapered aluminum ── */}
      <mesh position={[0, -0.4, -0.1]} castShadow>
        <RoundedBox args={[0.14, 0.7, 0.05]} radius={0.02} smoothness={3}>
          <meshStandardMaterial color="#c0c0c4" roughness={0.18} metalness={0.9} />
        </RoundedBox>
      </mesh>
      {/* Hinge detail */}
      <mesh position={[0, -0.06, -0.1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.16, 16]} />
        <meshStandardMaterial color="#b0b0b4" roughness={0.15} metalness={0.92} />
      </mesh>

      {/* ── Stand Base — thick aluminum slab ── */}
      <mesh position={[0, -0.78, 0.05]} castShadow receiveShadow>
        <RoundedBox args={[1.0, 0.03, 0.55]} radius={0.01} smoothness={3}>
          <meshStandardMaterial color="#c0c0c4" roughness={0.18} metalness={0.9} />
        </RoundedBox>
      </mesh>
      {/* Base bottom rubber pad */}
      <mesh position={[0, -0.795, 0.05]}>
        <RoundedBox args={[0.95, 0.005, 0.5]} radius={0.005} smoothness={2}>
          <meshStandardMaterial color="#333" roughness={0.9} metalness={0.0} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

/* ───── Mac Studio (Realistic) ───── */
function MacStudio() {
  return (
    <group position={[4.8, -0.1, -2.2]}>
      {/* Main body — rounded aluminum block */}
      <mesh castShadow>
        <RoundedBox args={[0.5, 0.18, 0.5]} radius={0.05} smoothness={5}>
          <meshPhysicalMaterial
            color="#d2d2d6"
            roughness={0.12}
            metalness={0.95}
            clearcoat={0.3}
            clearcoatRoughness={0.2}
          />
        </RoundedBox>
      </mesh>
      {/* Top subtle inset line */}
      <mesh position={[0, 0.091, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 32]} />
        <meshStandardMaterial color="#c5c5c9" roughness={0.1} metalness={0.95} />
      </mesh>
      {/* Black bottom ventilation band */}
      <mesh position={[0, -0.08, 0]}>
        <RoundedBox args={[0.5, 0.025, 0.5]} radius={0.04} smoothness={3}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.1} />
        </RoundedBox>
      </mesh>
      {/* Rubber foot pad */}
      <mesh position={[0, -0.094, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 24]} />
        <meshStandardMaterial color="#111" roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Front status LED */}
      <mesh position={[0.16, -0.03, 0.252]}>
        <circleGeometry args={[0.006, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Front USB-C ports */}
      {[-0.08, -0.02].map((x, i) => (
        <mesh key={i} position={[x, -0.03, 0.252]}>
          <RoundedBox args={[0.035, 0.015, 0.003]} radius={0.003} smoothness={2}>
            <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
          </RoundedBox>
        </mesh>
      ))}
      {/* SD card slot */}
      <mesh position={[0.06, -0.03, 0.252]}>
        <RoundedBox args={[0.025, 0.018, 0.003]} radius={0.002} smoothness={2}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

/* ───── Magic Trackpad (Realistic) ───── */
function MagicTrackpad() {
  return (
    <group position={[4.5, -0.22, -1.3]}>
      {/* Body */}
      <mesh castShadow rotation={[-0.05, 0, 0]}>
        <RoundedBox args={[0.42, 0.018, 0.52]} radius={0.008} smoothness={4}>
          <meshPhysicalMaterial
            color="#e4e4e8"
            roughness={0.15}
            metalness={0.7}
            clearcoat={0.2}
            clearcoatRoughness={0.3}
          />
        </RoundedBox>
      </mesh>
      {/* Glass tracking surface */}
      <mesh position={[0, 0.011, 0]} rotation={[-0.05, 0, 0]}>
        <RoundedBox args={[0.38, 0.003, 0.48]} radius={0.006} smoothness={3}>
          <meshPhysicalMaterial
            color="#f4f4f6"
            roughness={0.03}
            metalness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.02}
            transparent
            opacity={0.95}
          />
        </RoundedBox>
      </mesh>
      {/* Lightning port */}
      <mesh position={[0, -0.002, 0.26]}>
        <RoundedBox args={[0.025, 0.008, 0.004]} radius={0.002} smoothness={2}>
          <meshStandardMaterial color="#999" roughness={0.3} metalness={0.8} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

/* ───── Magic Keyboard (Realistic) ───── */
function MagicKeyboard() {
  return (
    <group position={[3.5, -0.23, -1.3]}>
      {/* Body */}
      <mesh castShadow>
        <RoundedBox args={[1.12, 0.015, 0.38]} radius={0.006} smoothness={4}>
          <meshPhysicalMaterial
            color="#e4e4e8"
            roughness={0.15}
            metalness={0.7}
            clearcoat={0.2}
            clearcoatRoughness={0.3}
          />
        </RoundedBox>
      </mesh>
      {/* Keys — individual rounded caps */}
      {[-0.12, -0.04, 0.04, 0.12].map((z, row) =>
        Array.from({ length: 13 }).map((_, col) => (
          <mesh key={`${row}-${col}`} position={[-0.48 + col * 0.077, 0.011, z]}>
            <RoundedBox args={[0.055, 0.006, 0.058]} radius={0.004} smoothness={2}>
              <meshStandardMaterial color="#f8f8fa" roughness={0.35} metalness={0.15} />
            </RoundedBox>
          </mesh>
        ))
      )}
      {/* Space bar */}
      <mesh position={[0, 0.011, 0.18]}>
        <RoundedBox args={[0.35, 0.006, 0.045]} radius={0.004} smoothness={2}>
          <meshStandardMaterial color="#f8f8fa" roughness={0.35} metalness={0.15} />
        </RoundedBox>
      </mesh>
    </group>
  );
}

/* ───── Flower Vase (Realistic Glass) ───── */
function FlowerVase() {
  const petalColors = ["#e84060", "#f5a623", "#4aa3df", "#e25893", "#7ec850", "#9b59b6"];
  return (
    <group position={[5.8, 0, -1.8]}>
      {/* Glass vase body */}
      <mesh position={[0, -0.08, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.055, 0.38, 20]} />
        <meshPhysicalMaterial
          color="#dff0ec"
          roughness={0.02}
          metalness={0.0}
          transmission={0.9}
          thickness={0.5}
          clearcoat={1}
          clearcoatRoughness={0.02}
          ior={1.5}
          transparent
          opacity={0.5}
        />
      </mesh>
      {/* Glass rim */}
      <mesh position={[0, 0.11, 0]}>
        <torusGeometry args={[0.09, 0.005, 8, 20]} />
        <meshPhysicalMaterial color="#dff0ec" roughness={0.02} transmission={0.8} transparent opacity={0.6} />
      </mesh>
      {/* Water */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.072, 0.055, 0.25, 12]} />
        <meshStandardMaterial color="#cce5e0" roughness={0.05} transparent opacity={0.4} />
      </mesh>

      {/* Stems */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const lean = 0.15 + i * 0.02;
        return (
          <mesh
            key={`stem${i}`}
            position={[Math.cos(angle) * 0.02, 0.15, Math.sin(angle) * 0.02]}
            rotation={[Math.sin(angle) * lean, 0, Math.cos(angle) * lean]}
          >
            <cylinderGeometry args={[0.006, 0.008, 0.55, 5]} />
            <meshStandardMaterial color="#3d7a32" roughness={0.7} />
          </mesh>
        );
      })}

      {/* Flower heads */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const lean = 0.15 + i * 0.03;
        return (
          <Float key={`flower${i}`} speed={1.5 + i * 0.3} floatIntensity={0.15} rotationIntensity={0.1}>
            <group
              position={[
                Math.cos(angle) * 0.02 + Math.sin(angle) * lean * 0.35,
                0.42 + (i % 2) * 0.04,
                Math.sin(angle) * 0.02 + Math.cos(angle) * lean * 0.1,
              ]}
            >
              {/* Center */}
              <mesh>
                <sphereGeometry args={[0.025, 8, 8]} />
                <meshStandardMaterial color="#f0d060" roughness={0.5} />
              </mesh>
              {/* Petals */}
              {Array.from({ length: 5 }).map((_, p) => {
                const pa = (p / 5) * Math.PI * 2;
                return (
                  <mesh key={p} position={[Math.cos(pa) * 0.04, 0, Math.sin(pa) * 0.04]}>
                    <sphereGeometry args={[0.02, 6, 6]} />
                    <meshStandardMaterial color={petalColors[(i + p) % petalColors.length]} roughness={0.45} />
                  </mesh>
                );
              })}
            </group>
          </Float>
        );
      })}
    </group>
  );
}

/* ───── Coffee Mug (Realistic Ceramic) ───── */
function CoffeeMug() {
  return (
    <group position={[2.2, -0.05, -1.6]}>
      {/* Mug body — ceramic */}
      <mesh castShadow>
        <cylinderGeometry args={[0.09, 0.072, 0.24, 24]} />
        <meshPhysicalMaterial
          color="#f0ece5"
          roughness={0.3}
          metalness={0.0}
          clearcoat={0.6}
          clearcoatRoughness={0.15}
        />
      </mesh>
      {/* Inside rim */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.085, 0.005, 8, 24]} />
        <meshStandardMaterial color="#e5e0d8" roughness={0.35} />
      </mesh>
      {/* Coffee */}
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.082, 0.082, 0.02, 16]} />
        <meshStandardMaterial color="#3d1f08" roughness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#f5f2ed" roughness={0.35} metalness={0.02} />
      </mesh>
      {/* Steam */}
      {[0, 1, 2].map((i) => (
        <Float key={i} speed={2.5 + i} floatIntensity={0.25} rotationIntensity={0}>
          <mesh position={[(i - 1) * 0.025, 0.16 + i * 0.05, 0]}>
            <sphereGeometry args={[0.008, 6, 6]} />
            <meshStandardMaterial color="#d0d0d0" transparent opacity={0.2 - i * 0.05} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ───── Realistic Lighting ───── */
function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} color="#fffaf5" />

      {/* Main key light — warm soft directional */}
      <directionalLight
        position={[5, 8, 4]}
        intensity={1.2}
        color="#fff5e8"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-bias={-0.0001}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Ceiling downlight above desk */}
      <pointLight position={[4, 2.8, -2]} intensity={1.8} color="#fffaf0" distance={10} decay={2} />
      {/* Ceiling downlight center */}
      <pointLight position={[0, 2.8, 0]} intensity={0.8} color="#fffaf0" distance={10} decay={2} />
      {/* Fill from left */}
      <pointLight position={[-3, 2, -1]} intensity={0.5} color="#f0f0ff" distance={10} decay={2} />

      {/* Rim / back light */}
      <pointLight position={[4, 1.5, 4]} intensity={0.4} color="#e8f0ff" distance={10} decay={2} />

      {/* Soft fill from below */}
      <pointLight position={[0, -1, 2]} intensity={0.1} color="#fff5e8" distance={6} decay={2} />
    </>
  );
}

/* ───── Hologram Projector System ───── */
function HologramProjector() {
  const holoGroupRef = useRef<THREE.Group>(null!);
  const scanRingRef = useRef<THREE.Mesh>(null!);
  const beamRef = useRef<THREE.Mesh>(null!);
  const particlesRef = useRef<THREE.Points>(null!);
  const projectorGlowRef = useRef<THREE.PointLight>(null!);

  const texture = useLoader(THREE.TextureLoader, "/me.jpeg");

  /* Hologram shader material */
  const hologramMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color("#00E5FF") },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform vec3 uColor;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vec4 tex = texture2D(uTexture, vUv);
          float luminance = dot(tex.rgb, vec3(0.299, 0.587, 0.114));

          // Hologram tint
          vec3 holo = mix(uColor * 0.5, uColor * 1.5, luminance);
          holo += tex.rgb * 0.3;

          // Scan lines
          float scanLine = sin((vUv.y * 150.0) + uTime * 4.0) * 0.5 + 0.5;
          scanLine = smoothstep(0.25, 0.75, scanLine);
          holo *= 0.65 + scanLine * 0.35;

          // Horizontal glitch band
          float glitch = step(0.993, sin(uTime * 2.5 + vUv.y * 50.0));
          holo += glitch * vec3(0.2, 0.5, 0.4);

          // Edge glow
          float edgeX = smoothstep(0.0, 0.06, vUv.x) * smoothstep(0.0, 0.06, 1.0 - vUv.x);
          float edgeY = smoothstep(0.0, 0.04, vUv.y) * smoothstep(0.0, 0.04, 1.0 - vUv.y);
          float edge = 1.0 - edgeX * edgeY;
          holo += edge * uColor * 1.0;

          // Alpha
          float alpha = 0.7 + luminance * 0.2;
          alpha *= smoothstep(0.0, 0.12, vUv.y);
          alpha *= (0.82 + sin(uTime * 1.8) * 0.12);

          gl_FragColor = vec4(holo, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [texture]);

  /* Particle positions around hologram */
  const particleData = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.3 + Math.random() * 0.8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 3.0;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.5;
    }
    return { positions, count };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    hologramMaterial.uniforms.uTime.value = t;

    // Float hologram body
    if (holoGroupRef.current) {
      holoGroupRef.current.position.y = 1.2 + Math.sin(t * 0.7) * 0.1;
      holoGroupRef.current.rotation.y = Math.sin(t * 0.25) * 0.06;
    }

    // Rotate scan ring
    if (scanRingRef.current) {
      scanRingRef.current.rotation.y = t * 0.6;
    }

    // Pulse beam opacity
    if (beamRef.current) {
      const s = 0.92 + Math.sin(t * 2.5) * 0.08;
      beamRef.current.scale.set(s, 1, s);
    }

    // Projector glow pulse
    if (projectorGlowRef.current) {
      projectorGlowRef.current.intensity = 3 + Math.sin(t * 2) * 1;
    }

    // Animate particles upward
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position;
      const arr = pos.array as Float32Array;
      for (let i = 0; i < particleData.count; i++) {
        arr[i * 3 + 1] += 0.004;
        if (arr[i * 3 + 1] > 3.0) arr[i * 3 + 1] = 0;
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group position={[1, -2, -1]}>
      {/* ════════ PROJECTOR (on floor) ════════ */}
      <group>
        {/* Projector housing - dark metallic puck */}
        <mesh position={[0, 0.04, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.08, 24]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.15} metalness={0.95} />
        </mesh>
        {/* Top lens ring */}
        <mesh position={[0, 0.085, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.13, 0.015, 8, 32]} />
          <meshStandardMaterial color="#333" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* ── RED EMITTER DOT ── */}
        <mesh position={[0, 0.09, 0]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshBasicMaterial color="#ff1a1a" />
        </mesh>
        {/* Red emitter glow halo */}
        <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.04, 0.1, 32]} />
          <meshBasicMaterial color="#ff3333" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Red point light from emitter */}
        <pointLight position={[0, 0.1, 0]} color="#ff2200" intensity={2} distance={1.5} decay={2} />
      </group>

      {/* ════════ LIGHT BEAM (projector → hologram) ════════ */}
      <mesh ref={beamRef} position={[0, 1.2, 0]}>
        <coneGeometry args={[0.65, 2.2, 32, 1, true]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Inner beam (brighter core) */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.2, 2.2, 16, 1, true]} />
        <meshBasicMaterial
          color="#00E5FF"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ════════ HOLOGRAM BODY (above projector) ════════ */}
      <group ref={holoGroupRef}>
        {/* Profile image with hologram shader */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[1.2, 1.6]} />
          <primitive object={hologramMaterial} attach="material" />
        </mesh>

        {/* Glow backdrop */}
        <mesh position={[0, 0, -0.03]}>
          <planeGeometry args={[1.4, 1.8]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.06} depthWrite={false} />
        </mesh>

        {/* Horizontal scan band that moves */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.2, 0.015]} />
          <meshBasicMaterial color="#3EF3FF" transparent opacity={0.6} depthWrite={false} />
        </mesh>

        {/* ── NAME LABEL ── */}
        <Html
          position={[0, -1.0, 0.02]}
          center
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              fontFamily: "monospace",
              fontSize: "16px",
              fontWeight: "bold",
              letterSpacing: "6px",
              color: "#00E5FF",
              textShadow: "0 0 10px #00E5FF, 0 0 30px #00E5FF55",
              whiteSpace: "nowrap",
            }}>
              DARSHAN U
            </div>
            <div style={{
              fontFamily: "monospace",
              fontSize: "9px",
              letterSpacing: "4px",
              color: "#7B61FF",
              textShadow: "0 0 8px #7B61FF",
              whiteSpace: "nowrap",
            }}>
              CYBERSECURITY ENGINEER
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#00FFA3", boxShadow: "0 0 6px #00FFA3" }} />
                <span style={{ fontFamily: "monospace", fontSize: "8px", color: "#00FFA3", letterSpacing: "2px" }}>AVAILABLE</span>
              </div>
              <span style={{ fontFamily: "monospace", fontSize: "8px", color: "#8892B0" }}>|</span>
              <span style={{ fontFamily: "monospace", fontSize: "8px", color: "#8892B0", letterSpacing: "1px" }}>COIMBATORE, IN</span>
            </div>
          </div>
        </Html>
      </group>

      {/* ════════ ROTATING SCAN RINGS ════════ */}
      <mesh ref={scanRingRef} position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.006, 8, 64]} />
        <meshBasicMaterial color="#3EF3FF" transparent opacity={0.45} />
      </mesh>
      {/* Second ring (counter-rotating via different offset) */}
      <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[0.6, 0.004, 8, 48]} />
        <meshBasicMaterial color="#7B61FF" transparent opacity={0.3} />
      </mesh>

      {/* ════════ GLOWING BASE RING (on floor around projector) ════════ */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <torusGeometry args={[0.7, 0.015, 8, 48]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <torusGeometry args={[0.5, 0.008, 8, 48]} />
        <meshBasicMaterial color="#7B61FF" transparent opacity={0.4} />
      </mesh>
      {/* Radial grid lines on floor */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh
            key={`radial${i}`}
            position={[Math.cos(angle) * 0.35, 0.003, Math.sin(angle) * 0.35]}
            rotation={[-Math.PI / 2, 0, angle]}
          >
            <planeGeometry args={[0.7, 0.002]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.2} />
          </mesh>
        );
      })}

      {/* ════════ FLOATING PARTICLES ════════ */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleData.positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#00E5FF"
          size={0.025}
          transparent
          opacity={0.6}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* ════════ HOLOGRAM LIGHTING ════════ */}
      <pointLight ref={projectorGlowRef} position={[0, 1.0, 0.5]} color="#00E5FF" intensity={3} distance={5} decay={2} />
      <pointLight position={[0, 0.3, 0]} color="#7B61FF" intensity={1.5} distance={3} decay={2} />
    </group>
  );
}

/* ───── Scene ───── */
export default function Room3D() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 3.5, 7], fov: 52 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <Suspense fallback={null}>
          <Lights />
          <Room />
          <Desk />
          <StudioDisplay />
          <MacStudio />
          <MagicTrackpad />
          <MagicKeyboard />
          <FlowerVase />
          <CoffeeMug />
          <HologramProjector />
          <WallDisplays />
          <DeskHotspots />
          <CyberParticles />
          <ContactShadows
            position={[0, -1.99, 0]}
            opacity={0.4}
            scale={18}
            blur={2}
            far={6}
            color="#5a4a3a"
          />
          <Environment preset="studio" />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            target={[2, 0, -1.5]}
            autoRotate
            autoRotateSpeed={0.2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
