"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ═══════════════════════════════════════════════
   STARS — 2000 random points in a shell
   ═══════════════════════════════════════════════ */
function Stars() {
  const geo = useMemo(() => {
    const count = 2000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#aad4ff"),
      new THREE.Color("#ffd6aa"),
      new THREE.Color("#d4aaff"),
    ];
    for (let i = 0; i < count; i++) {
      // Random point on sphere shell r=60–100
      const r = 60 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial size={0.25} transparent opacity={0.85} vertexColors sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ═══════════════════════════════════════════════
   PLANET — sphere that orbits the sun
   ═══════════════════════════════════════════════ */
interface PlanetProps {
  radius: number;
  color: string;
  emissive?: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset?: number;
  tilt?: number;
  hasRing?: boolean;
  ringColor?: string;
  ringInner?: number;
  ringOuter?: number;
}

function Planet({
  radius, color, emissive, orbitRadius, orbitSpeed, orbitOffset = 0,
  tilt = 0, hasRing = false, ringColor = "#c8a878", ringInner = 1.4, ringOuter = 2.2,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * orbitSpeed + orbitOffset;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t) * orbitRadius;
      groupRef.current.position.z = Math.sin(t) * orbitRadius;
    }
  });

  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive || color}
          emissiveIntensity={emissive ? 0.1 : 0}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      {hasRing && (
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[radius * ringInner, radius * ringOuter, 64]} />
          <meshStandardMaterial
            color={ringColor}
            side={THREE.DoubleSide}
            transparent
            opacity={0.55}
            roughness={0.9}
          />
        </mesh>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════
   ORBIT RING — faint ellipse showing the orbit path
   ═══════════════════════════════════════════════ */
function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.02, radius + 0.02, 128]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════
   SOLAR SYSTEM
   Positioned far outside the room so it's visible
   through the windows on the left/right walls
   ═══════════════════════════════════════════════ */
export default function SpaceEnvironment() {
  // Orbit radii (scene units)
  const ORBITS = {
    mercury:  5,
    venus:    8,
    earth:   11,
    mars:    15,
    jupiter: 22,
    saturn:  30,
    uranus:  38,
    neptune: 46,
  };

  return (
    <group position={[0, -2, -60]} rotation={[0.15, 0, 0]}>
      <Stars />

      {/* ── ORBIT RINGS ── */}
      {Object.values(ORBITS).map((r, i) => <OrbitRing key={i} radius={r} />)}

      {/* ── SUN ── */}
      <mesh>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshStandardMaterial color="#FDB813" emissive="#FF8C00" emissiveIntensity={1.8} roughness={0.7} />
      </mesh>
      {/* Sun glow light */}
      <pointLight color="#FFD700" intensity={2.5} distance={150} />
      {/* Sun corona halo */}
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshStandardMaterial color="#FF6600" transparent opacity={0.07} side={THREE.BackSide} emissive="#FF4400" emissiveIntensity={0.5} />
      </mesh>

      {/* ── MERCURY ── */}
      <Planet radius={0.38} color="#b5b5b5" orbitRadius={ORBITS.mercury} orbitSpeed={0.47} orbitOffset={0} />

      {/* ── VENUS ── */}
      <Planet radius={0.95} color="#e8cda0" orbitRadius={ORBITS.venus} orbitSpeed={0.35} orbitOffset={1.2} />

      {/* ── EARTH ── */}
      <Planet radius={1.0} color="#3a7bd5" orbitRadius={ORBITS.earth} orbitSpeed={0.29} orbitOffset={2.1} />

      {/* ── MARS ── */}
      <Planet radius={0.53} color="#c1440e" orbitRadius={ORBITS.mars} orbitSpeed={0.24} orbitOffset={0.8} />

      {/* ── JUPITER ── */}
      <Planet radius={2.2} color="#c88b3a" orbitRadius={ORBITS.jupiter} orbitSpeed={0.13} orbitOffset={3.5} />

      {/* ── SATURN (with rings) ── */}
      <Planet
        radius={1.9} color="#e8d5a0" orbitRadius={ORBITS.saturn} orbitSpeed={0.096}
        orbitOffset={1.5} tilt={0.47} hasRing
        ringColor="#c8a878" ringInner={1.5} ringOuter={2.6}
      />

      {/* ── URANUS ── */}
      <Planet radius={1.4} color="#7de8e8" orbitRadius={ORBITS.uranus} orbitSpeed={0.068} orbitOffset={4.2} tilt={1.71} />

      {/* ── NEPTUNE ── */}
      <Planet radius={1.35} color="#3f54ba" orbitRadius={ORBITS.neptune} orbitSpeed={0.054} orbitOffset={2.8} />
    </group>
  );
}
