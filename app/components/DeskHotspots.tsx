"use client";

import { Html, Float } from "@react-three/drei";
import { useState } from "react";

interface HotspotProps {
  position: [number, number, number];
  label: string;
  description: string;
  color?: string;
}

function Hotspot({ position, label, description, color = "#00E5FF" }: HotspotProps) {
  const [open, setOpen] = useState(false);

  return (
    <group position={position}>
      {/* Pulsing ring on surface */}
      <Float speed={3} floatIntensity={0.05} rotationIntensity={0}>
        <Html center style={{ pointerEvents: "auto" }}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            style={{ cursor: "pointer", position: "relative" }}
          >
            {/* Outer pulse ring */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: `1.5px solid ${color}40`,
                animation: "hotspot-pulse 2s ease-in-out infinite",
              }}
            />
            {/* Inner dot */}
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: `${color}`,
                boxShadow: `0 0 8px ${color}, 0 0 20px ${color}44`,
                position: "relative",
                zIndex: 1,
              }}
            />
            {/* Tooltip */}
            {open && (
              <div
                style={{
                  position: "absolute",
                  bottom: "24px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "180px",
                  padding: "10px",
                  background: "rgba(10, 15, 28, 0.95)",
                  border: `1px solid ${color}30`,
                  borderRadius: "6px",
                  fontFamily: "monospace",
                  backdropFilter: "blur(8px)",
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    letterSpacing: "2px",
                    color,
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: "9px", lineHeight: "1.5", color: "#8892B0" }}>
                  {description}
                </div>
              </div>
            )}
          </div>
          <style>{`
            @keyframes hotspot-pulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
              50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
          `}</style>
        </Html>
      </Float>
    </group>
  );
}

export default function DeskHotspots() {
  return (
    <group>
      {/* Studio Display */}
      <Hotspot
        position={[4.8, 0.1, -4.5]}
        label="STUDIO DISPLAY"
        description="5K Retina display running the RAG AI Terminal. Click the screen to interact with the AI assistant."
        color="#00E5FF"
      />
      {/* Mac Studio */}
      <Hotspot
        position={[6.0, -1.0, -4.2]}
        label="MAC STUDIO"
        description="M2 Ultra. Powers the local LLM inference engine and FAISS vector search."
        color="#7B61FF"
      />
      {/* Keyboard */}
      <Hotspot
        position={[4.5, -1.1, -3.5]}
        label="MAGIC KEYBOARD"
        description="Wireless keyboard with Touch ID. The command center for terminal interactions."
        color="#00FFA3"
      />
      {/* Coffee mug */}
      <Hotspot
        position={[3.8, -1.05, -3.4]}
        label="FUEL SUPPLY"
        description="Black coffee. Essential for late-night bug hunting and CTF competitions."
        color="#FFBD2E"
      />
      {/* Hologram */}
      <Hotspot
        position={[-2.5, -0.8, -1]}
        label="HOLOGRAM PROJECTOR"
        description="Volumetric holographic identity system. Displays profile with floating data rings."
        color="#FF2E88"
      />
    </group>
  );
}
