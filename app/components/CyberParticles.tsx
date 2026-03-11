"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function CyberParticles() {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, colors, count } = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cyan = new THREE.Color("#00E5FF");
    const purple = new THREE.Color("#7B61FF");
    const green = new THREE.Color("#00FFA3");
    const palette = [cyan, purple, green];

    for (let i = 0; i < count; i++) {
      // Spread throughout the room (W=14, D=12, H=5), offset to room center
      positions[i * 3] = (Math.random() - 0.5) * 12;       // x: -6 to 6
      positions[i * 3 + 1] = -2 + Math.random() * 5;        // y: floor to ceiling
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;    // z: -5 to 5

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    return { positions, colors, count };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    const arr = pos.array as Float32Array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      // Gentle upward drift + slight horizontal sway
      arr[i * 3] += Math.sin(t * 0.3 + i) * 0.0005;
      arr[i * 3 + 1] += 0.001 + Math.sin(t + i * 0.5) * 0.0003;
      arr[i * 3 + 2] += Math.cos(t * 0.2 + i) * 0.0005;

      // Reset if above ceiling
      if (arr[i * 3 + 1] > 3) {
        arr[i * 3 + 1] = -2;
        arr[i * 3] = (Math.random() - 0.5) * 12;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        transparent
        opacity={0.35}
        depthWrite={false}
        sizeAttenuation
        vertexColors
      />
    </points>
  );
}
