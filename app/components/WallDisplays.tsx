"use client";

import { Html } from "@react-three/drei";

/* ══════════════════════════════════════════════════════════════
   GALLERY FRAME
   Museum / home-gallery style:
     • 4-bar wooden (or metal) moulding
     • Cream mat board backing
     • Printed-paper HTML content (serif, warm ink)
     • Wall nail above + brass label plate below
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
  children: React.ReactNode;
}) {
  /* World-unit dimensions of the content area (matches existing scale math) */
  const fw = width * scale * 0.0055;
  const fh = height * scale * 0.0055;

  const BAR = 0.13;   /* moulding bar width  (world units) */
  const DEP = 0.065;  /* moulding depth      (world units) */

  const roughness = metallic ? 0.18 : 0.68;
  const metalness = metallic ? 0.88 : 0.06;

  return (
    <group position={position} rotation={rotation}>

      {/* ─── Wooden / metal moulding — 4 bars ─── */}
      {/* Top */}
      <mesh castShadow position={[0, fh / 2 + BAR / 2, 0]}>
        <boxGeometry args={[fw + BAR * 2, BAR, DEP]} />
        <meshStandardMaterial color={frameColor} roughness={roughness} metalness={metalness} />
      </mesh>
      {/* Bottom */}
      <mesh castShadow position={[0, -(fh / 2 + BAR / 2), 0]}>
        <boxGeometry args={[fw + BAR * 2, BAR, DEP]} />
        <meshStandardMaterial color={frameColor} roughness={roughness} metalness={metalness} />
      </mesh>
      {/* Left */}
      <mesh castShadow position={[-(fw / 2 + BAR / 2), 0, 0]}>
        <boxGeometry args={[BAR, fh, DEP]} />
        <meshStandardMaterial color={frameColor} roughness={roughness} metalness={metalness} />
      </mesh>
      {/* Right */}
      <mesh castShadow position={[fw / 2 + BAR / 2, 0, 0]}>
        <boxGeometry args={[BAR, fh, DEP]} />
        <meshStandardMaterial color={frameColor} roughness={roughness} metalness={metalness} />
      </mesh>

      {/* ─── Thin dark shadow reveal (inner lip of frame) ─── */}
      <mesh position={[0, 0, DEP / 2 - 0.003]}>
        <boxGeometry args={[fw + 0.01, fh + 0.01, 0.005]} />
        <meshStandardMaterial color="#1a1008" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* ─── Cream mat board backing ─── */}
      <mesh receiveShadow position={[0, 0, -(DEP / 2 - 0.003)]}>
        <boxGeometry args={[fw, fh, 0.008]} />
        <meshStandardMaterial color="#f5efe3" roughness={0.97} metalness={0.0} />
      </mesh>

      {/* ─── HTML: printed paper card ─── */}
      <Html
        transform
        occlude="blending"
        position={[0, 0, 0.02]}
        scale={scale * 0.5}
        style={{ width: `${width}px`, height: `${height}px`, overflow: "hidden", pointerEvents: "none" }}
      >
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            background: "linear-gradient(155deg, #fdfaf4 0%, #f8f0e0 100%)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            color: "#2c1f10",
            padding: "20px 22px 14px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* ── Header ── */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{
              fontSize: "8px",
              letterSpacing: "3px",
              color: "#9a7650",
              textTransform: "uppercase",
              marginBottom: "3px",
            }}>
              {category}
            </div>
            <div style={{
              fontSize: "17px",
              fontWeight: "bold",
              color: "#1c130a",
              lineHeight: 1.1,
              letterSpacing: "0.3px",
            }}>
              {title}
            </div>
            <div style={{
              marginTop: "7px",
              height: "1px",
              background: "linear-gradient(90deg, #c8a86a 0%, rgba(200,168,106,0.1) 100%)",
            }} />
          </div>
          {/* ── Content ── */}
          <div style={{ fontSize: "11px", color: "#3d2c18", lineHeight: 1.65 }}>
            {children}
          </div>
        </div>
      </Html>

      {/* ─── Wall mounting nail (above frame) ─── */}
      <mesh position={[0, fh / 2 + BAR + 0.025, -(DEP / 2) + 0.01]}>
        <cylinderGeometry args={[0.008, 0.008, 0.022, 8]} />
        <meshStandardMaterial color="#7a6a58" roughness={0.35} metalness={0.65} />
      </mesh>
      {/* Nail head disc */}
      <mesh position={[0, fh / 2 + BAR + 0.025, -(DEP / 2) + 0.022]}>
        <cylinderGeometry args={[0.017, 0.011, 0.009, 12]} />
        <meshStandardMaterial color="#9a8a72" roughness={0.28} metalness={0.72} />
      </mesh>

      {/* ─── Brass museum label plate (below frame) ─── */}
      <mesh castShadow position={[0, -(fh / 2 + BAR + 0.055), 0.008]}>
        <boxGeometry args={[Math.min(fw * 0.68, 1.02), 0.055, 0.007]} />
        <meshStandardMaterial color="#c9a448" roughness={0.20} metalness={0.88} />
      </mesh>
      {/* Engraved inset on plate */}
      <mesh position={[0, -(fh / 2 + BAR + 0.055), 0.013]}>
        <boxGeometry args={[Math.min(fw * 0.68, 1.02) - 0.022, 0.033, 0.001]} />
        <meshStandardMaterial color="#b8932a" roughness={0.15} metalness={0.92} />
      </mesh>

    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   FRAME CONTENT — gallery print layouts (no glow, no cyber)
   ══════════════════════════════════════════════════════════════ */

/* ─── Skills ─── */
function SkillsContent() {
  const cats = [
    { name: "Offensive Security", items: ["Penetration Testing", "Bug Bounty", "VAPT", "Red Teaming"] },
    { name: "Development & Cloud", items: ["Python", "React", "Next.js", "AWS", "Docker"] },
    { name: "Tools & Platforms",   items: ["Burp Suite", "Nmap", "Metasploit", "Wireshark"] },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {cats.map((cat) => (
        <div key={cat.name}>
          <div style={{
            fontSize: "8px", letterSpacing: "2px", color: "#9a7040",
            textTransform: "uppercase", marginBottom: "4px", fontStyle: "italic",
          }}>
            {cat.name}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {cat.items.map((s) => (
              <span key={s} style={{
                fontSize: "10px", padding: "2px 8px",
                background: "#ede5d3", border: "1px solid #d4c0a0",
                borderRadius: "1px", color: "#3d2c18",
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Projects ─── */
function ProjectsContent() {
  const projects = [
    { name: "RAG Portfolio AI",  tech: "LangChain · FAISS · Ollama", status: "Live" },
    { name: "3D Cyber Room",     tech: "Three.js · R3F · Next.js",   status: "Live" },
    { name: "VAPT Dashboard",    tech: "Python · Flask · Nmap",       status: "Complete" },
    { name: "Threat Intel Feed", tech: "Python · OSINT APIs",         status: "Complete" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {projects.map((p, i) => (
        <div key={p.name} style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          borderBottom: "1px solid #e0d4bc", paddingBottom: "8px", marginBottom: "8px",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span style={{ fontSize: "9px", color: "#9a7040" }}>{String(i + 1).padStart(2, "0")}.</span>
              <span style={{ fontSize: "11px", color: "#1c130a", fontWeight: "600" }}>{p.name}</span>
            </div>
            <div style={{ fontSize: "9px", color: "#7a6040", fontStyle: "italic", marginLeft: "18px" }}>
              {p.tech}
            </div>
          </div>
          <span style={{
            fontSize: "8px", letterSpacing: "1px", flexShrink: 0, marginTop: "2px",
            color: p.status === "Live" ? "#5a7a2a" : "#7a6040",
          }}>
            ● {p.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─── Certifications ─── */
function CertsContent() {
  const certs = [
    { abbr: "CEH",  name: "Certified Ethical Hacker",  org: "EC-Council" },
    { abbr: "Sec+", name: "CompTIA Security+",          org: "CompTIA" },
    { abbr: "CCP",  name: "AWS Cloud Practitioner",     org: "Amazon Web Services" },
    { abbr: "GCC",  name: "Google Cybersecurity Cert.", org: "Google" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {certs.map((c) => (
        <div key={c.name} style={{
          display: "flex", alignItems: "center", gap: "12px",
          borderBottom: "1px solid #e8dcc8", paddingBottom: "8px", marginBottom: "8px",
        }}>
          {/* Credential badge */}
          <div style={{
            width: "34px", height: "34px", flexShrink: 0,
            border: "1px solid #c8a870", background: "#f0e8d8",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "8px", fontWeight: "bold", color: "#7a5030", letterSpacing: "0.5px",
          }}>
            {c.abbr}
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#1c130a", fontWeight: "600" }}>{c.name}</div>
            <div style={{ fontSize: "9px", color: "#9a7040", fontStyle: "italic" }}>{c.org}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Experience ─── */
function ExperienceContent() {
  const roles = [
    { title: "Security Engineer Intern", company: "CyberTech Labs", period: "2024" },
    { title: "Full-Stack Developer",     company: "Freelance",       period: "2023–24" },
    { title: "Bug Bounty Hunter",        company: "Independent",     period: "2022–Present" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {roles.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: "12px", paddingBottom: i < roles.length - 1 ? "13px" : 0 }}>
          {/* Timeline spine */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3px" }}>
            <div style={{
              width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0,
              border: "1.5px solid #c8a870",
              background: i === 0 ? "#c8a870" : "#fdfaf4",
            }} />
            {i < roles.length - 1 && (
              <div style={{ width: "1px", flexGrow: 1, background: "#d8c8a8", marginTop: "4px" }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#1c130a" }}>{r.title}</div>
            <div style={{ fontSize: "9.5px", color: "#7a6040", fontStyle: "italic" }}>
              {r.company}&nbsp;&nbsp;·&nbsp;&nbsp;{r.period}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Contact ─── */
function ContactContent() {
  const items = [
    { icon: "✉", label: "Email",    value: "darshan@example.com" },
    { icon: "⌘", label: "GitHub",   value: "github.com/darshan" },
    { icon: "≡", label: "LinkedIn", value: "linkedin.com/in/darshan" },
    { icon: "◎", label: "Location", value: "Coimbatore, India" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
      {items.map((c) => (
        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "30px", height: "30px", flexShrink: 0,
            border: "1px solid #d4c4a8", background: "#ede5d3",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", color: "#7a5030",
          }}>
            {c.icon}
          </div>
          <div>
            <div style={{
              fontSize: "8px", letterSpacing: "2.5px", color: "#9a7040",
              textTransform: "uppercase", marginBottom: "1px",
            }}>
              {c.label}
            </div>
            <div style={{ fontSize: "11px", color: "#2c1f10" }}>{c.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WALL GALLERY — 5 framed pieces, museum exhibition layout
   ══════════════════════════════════════════════════════════════ */
export default function WallDisplays() {
  return (
    <group>

      {/* ── Back wall — Skills (walnut) ── */}
      <GalleryFrame
        position={[-3.5, 0.8, -5.95]} rotation={[0, 0, 0]}
        title="Skills" category="Technical Proficiency"
        frameColor="#5c3d1e" width={420} height={270}
      >
        <SkillsContent />
      </GalleryFrame>

      {/* ── Back wall — Projects (dark mahogany) ── */}
      <GalleryFrame
        position={[0.5, 0.8, -5.95]} rotation={[0, 0, 0]}
        title="Projects" category="Selected Works"
        frameColor="#3a1e10" width={420} height={295}
      >
        <ProjectsContent />
      </GalleryFrame>

      {/* ── Left wall — Experience (cherry) ── */}
      <GalleryFrame
        position={[-6.95, 0.8, -2]} rotation={[0, Math.PI / 2, 0]}
        title="Experience" category="Professional History"
        frameColor="#6b2520" width={380} height={260}
      >
        <ExperienceContent />
      </GalleryFrame>

      {/* ── Left wall — Certifications (brushed gold metal) ── */}
      <GalleryFrame
        position={[-6.95, 0.8, 1.5]} rotation={[0, Math.PI / 2, 0]}
        title="Certifications" category="Professional Credentials"
        frameColor="#b8963e" metallic={true} width={380} height={290}
      >
        <CertsContent />
      </GalleryFrame>

      {/* ── Right wall — Contact (dark ebony) ── */}
      <GalleryFrame
        position={[6.95, 0.8, 1]} rotation={[0, -Math.PI / 2, 0]}
        title="Contact" category="Get In Touch"
        frameColor="#201a14" width={380} height={270}
      >
        <ContactContent />
      </GalleryFrame>

    </group>
  );
}
