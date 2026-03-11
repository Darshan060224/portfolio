"use client";

import { Html } from "@react-three/drei";
import { useState } from "react";

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
  return (
    <Html fullscreen style={{ pointerEvents: "auto" }}>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(10, 8, 4, 0.85)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "600px", maxHeight: "80vh", overflow: "auto",
            background: "linear-gradient(155deg, #fdfaf4 0%, #f0e8d4 100%)",
            border: "2px solid #c9a448", borderRadius: "4px", padding: "32px",
            fontFamily: "Georgia, 'Times New Roman', serif", color: "#2c1f10",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "bold", color: "#1c130a", margin: 0 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "1px solid #c9a448", color: "#9a7650",
                fontSize: "14px", padding: "4px 10px", cursor: "pointer", borderRadius: "2px",
              }}
            >
              Close
            </button>
          </div>
          <div style={{ height: "1px", background: "linear-gradient(90deg, #c8a86a, rgba(200,168,106,0.1))", marginBottom: "16px" }} />
          <div style={{ fontSize: "14px", lineHeight: 1.8, color: "#3d2c18" }}>
            {children}
          </div>
        </div>
      </div>
    </Html>
  );
}

/* ══════════════════════════════════════════════════════════════
   CONTENT COMPONENTS
   ══════════════════════════════════════════════════════════════ */

function CertsContent({ expanded = false }: { expanded?: boolean }) {
  const certs = [
    { abbr: "CEH", name: "Certified Ethical Hacker", org: "EC-Council", detail: "Certified in advanced penetration testing methodologies and network security assessment." },
    { abbr: "Sec+", name: "CompTIA Security+", org: "CompTIA", detail: "Comprehensive security certification covering network defense, compliance, and risk management." },
    { abbr: "CCP", name: "AWS Cloud Practitioner", org: "Amazon Web Services", detail: "Foundational cloud computing certification covering AWS services and architecture." },
    { abbr: "GCC", name: "Google Cybersecurity Cert.", org: "Google", detail: "Professional certification in cybersecurity operations, threat analysis, and incident response." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: expanded ? "14px" : "0" }}>
      {certs.map((c) => (
        <div key={c.name} style={{
          display: "flex", alignItems: "center", gap: "12px",
          borderBottom: "1px solid #e8dcc8", paddingBottom: expanded ? "10px" : "8px", marginBottom: expanded ? 0 : "8px",
        }}>
          <div style={{
            width: expanded ? "44px" : "34px", height: expanded ? "44px" : "34px", flexShrink: 0,
            border: "1px solid #c8a870", background: "#f0e8d8",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: expanded ? "10px" : "8px", fontWeight: "bold", color: "#7a5030", letterSpacing: "0.5px",
          }}>
            ★ {c.abbr}
          </div>
          <div>
            <div style={{ fontSize: expanded ? "14px" : "11px", color: "#1c130a", fontWeight: "600" }}>{c.name}</div>
            <div style={{ fontSize: expanded ? "11px" : "9px", color: "#9a7040", fontStyle: "italic" }}>{c.org}</div>
            {expanded && <div style={{ fontSize: "12px", color: "#5a4a30", marginTop: "3px" }}>{c.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceContent({ expanded = false }: { expanded?: boolean }) {
  const roles = [
    { title: "Security Engineer Intern", company: "CyberTech Labs", period: "2024", detail: "Conducted vulnerability assessments, developed automated scanning tools, and performed red team exercises." },
    { title: "Full-Stack Developer", company: "Freelance", period: "2023–24", detail: "Built responsive web applications using React, Next.js, and Node.js for various clients." },
    { title: "Bug Bounty Hunter", company: "Independent", period: "2022–Present", detail: "Discovered and reported critical vulnerabilities across multiple platforms and bug bounty programs." },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {roles.map((r, i) => (
        <div key={i} style={{ display: "flex", gap: "12px", paddingBottom: i < roles.length - 1 ? "13px" : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "3px" }}>
            <div style={{
              width: expanded ? "12px" : "10px", height: expanded ? "12px" : "10px", borderRadius: "50%", flexShrink: 0,
              border: "1.5px solid #c8a870", background: i === 0 ? "#c8a870" : "#fdfaf4",
            }} />
            {i < roles.length - 1 && (
              <div style={{ width: "1px", flexGrow: 1, background: "#d8c8a8", marginTop: "4px" }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: expanded ? "15px" : "12px", fontWeight: "600", color: "#1c130a" }}>{r.title}</div>
            <div style={{ fontSize: expanded ? "11px" : "9.5px", color: "#7a6040", fontStyle: "italic" }}>
              {r.company}&nbsp;&nbsp;·&nbsp;&nbsp;{r.period}
            </div>
            {expanded && <div style={{ fontSize: "13px", color: "#5a4a30", marginTop: "3px" }}>{r.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactContent({ expanded = false }: { expanded?: boolean }) {
  const items = [
    { icon: "✉", label: "Email", value: "darshan@example.com" },
    { icon: "⌘", label: "GitHub", value: "github.com/darshan" },
    { icon: "≡", label: "LinkedIn", value: "linkedin.com/in/darshan" },
    { icon: "◎", label: "Location", value: "Coimbatore, India" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
      {items.map((c) => (
        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: expanded ? "36px" : "30px", height: expanded ? "36px" : "30px", flexShrink: 0,
            border: "1px solid #d4c4a8", background: "#ede5d3",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: expanded ? "15px" : "13px", color: "#7a5030",
          }}>
            {c.icon}
          </div>
          <div>
            <div style={{ fontSize: expanded ? "10px" : "8px", letterSpacing: "2.5px", color: "#9a7040", textTransform: "uppercase", marginBottom: "1px" }}>
              {c.label}
            </div>
            <div style={{ fontSize: expanded ? "14px" : "11px", color: "#2c1f10" }}>{c.value}</div>
          </div>
        </div>
      ))}
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
    { name: "SOC", icon: "🛡", items: ["SIEM", "Log Analysis", "Alert Triage", "Incident Response"] },
    { name: "PENTEST", icon: "🔓", items: ["Burp Suite", "Nmap", "Metasploit", "SQLMap"] },
    { name: "DFIR", icon: "🔍", items: ["Volatility", "Autopsy", "FTK", "Timeline Analysis"] },
    { name: "TOOLS", icon: "⚙", items: ["Wireshark", "Snort", "Splunk", "Ghidra"] },
    { name: "PROGRAMMING", icon: "⟨/⟩", items: ["Python", "React", "Next.js", "TypeScript"] },
    { name: "AUTOMATION", icon: "⚡", items: ["Ansible", "Terraform", "Docker", "CI/CD"] },
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

      {/* ── 3×2 GRID OF PORTRAIT FRAMES ── */}
      {categories.map((cat, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = (col - 1) * 1.6;
        const y = (0.5 - row) * 1.5;

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

            {/* Frame content — clickable */}
            <Html
              transform
              occlude="blending"
              position={[0, 0, 0.015]}
              scale={0.1}
              style={{ pointerEvents: "auto", cursor: "pointer" }}
            >
              <div
                onClick={() => onFrameClick(cat.name)}
                style={{
                  width: "160px", textAlign: "center", padding: "8px",
                  fontFamily: "Georgia, serif", color: "#d4af37",
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "6px" }}>{cat.icon}</div>
                <div style={{
                  fontSize: "9px", fontWeight: "bold", letterSpacing: "2px",
                  textTransform: "uppercase", marginBottom: "8px", color: "#d4af37",
                }}>
                  {cat.name}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", alignItems: "center" }}>
                  {cat.items.map((item) => (
                    <span key={item} style={{
                      fontSize: "8px", color: "#c0a060",
                    }}>
                      ◆ {item}
                    </span>
                  ))}
                </div>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════
   SKILLS EXPANDED MODAL — shows all skills with numbered badges
   ══════════════════════════════════════════════════════════════ */
function SkillsExpandedContent({ category }: { category: string }) {
  const allSkills: Record<string, { items: string[]; desc: string }> = {
    SOC: { items: ["SIEM Management", "Log Analysis", "Alert Triage", "Incident Response", "Threat Detection", "Security Monitoring"], desc: "Security Operations Center expertise" },
    PENTEST: { items: ["Burp Suite", "Nmap", "Metasploit", "SQLMap", "Hydra", "Nikto", "OWASP ZAP", "Gobuster"], desc: "Penetration Testing & Red Team" },
    DFIR: { items: ["Volatility", "Autopsy", "FTK Imager", "Timeline Analysis", "Memory Forensics", "Disk Imaging", "Chain of Custody"], desc: "Digital Forensics & Incident Response" },
    TOOLS: { items: ["Wireshark", "Snort", "Splunk", "Ghidra", "IDA Pro", "John the Ripper", "Hashcat", "Aircrack-ng"], desc: "Security Tools & Utilities" },
    PROGRAMMING: { items: ["Python", "React", "Next.js", "TypeScript", "JavaScript", "Bash", "SQL", "Go"], desc: "Programming Languages & Frameworks" },
    AUTOMATION: { items: ["Ansible", "Terraform", "Docker", "CI/CD", "Kubernetes", "GitHub Actions", "AWS CDK"], desc: "Automation & DevSecOps" },
  };
  const data = allSkills[category] || { items: [], desc: "" };
  return (
    <div>
      <p style={{ fontSize: "13px", color: "#7a6040", fontStyle: "italic", marginBottom: "16px" }}>{data.desc}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {data.items.map((item, i) => (
          <div key={item} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 14px", background: "#ede5d3", border: "1px solid #d4c0a0",
          }}>
            <span style={{ fontSize: "12px", fontWeight: "bold", color: "#c9a448" }}>{String(i + 1).padStart(2, "0")}</span>
            <span style={{ fontSize: "14px", color: "#2c1f10" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WALL GALLERY — zone-based layout
   Back wall: Royal Skill Gallery Board
   Left wall: Experience + Certifications
   Right wall: Contact
   ══════════════════════════════════════════════════════════════ */
export default function WallDisplays() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <group>
      {/* ══ BACK WALL — Royal Skill Gallery Board ══ */}
      <group position={[0, 0.8, -5.95]} rotation={[0, 0, 0]}>
        <SkillsGalleryBoard onFrameClick={(name) => setExpanded(`skill-${name}`)} />
      </group>

      {/* ══ LEFT WALL — Experience (timeline) ══ */}
      <GalleryFrame
        position={[-6.95, 1.0, -2]} rotation={[0, Math.PI / 2, 0]}
        title="Experience" category="Professional History"
        frameColor="#6b2520" width={420} height={280}
        onClick={() => setExpanded("experience")}
      >
        <ExperienceContent />
      </GalleryFrame>

      {/* ══ LEFT WALL — Certifications (star badges) ══ */}
      <GalleryFrame
        position={[-6.95, 1.0, 2.5]} rotation={[0, Math.PI / 2, 0]}
        title="Certifications" category="Professional Credentials"
        frameColor="#b8963e" metallic width={420} height={310}
        onClick={() => setExpanded("certs")}
      >
        <CertsContent />
      </GalleryFrame>

      {/* ══ RIGHT WALL — Contact (clickable links) ══ */}
      <GalleryFrame
        position={[6.95, 1.0, 2]} rotation={[0, -Math.PI / 2, 0]}
        title="Contact" category="Get In Touch"
        frameColor="#201a14" width={380} height={270}
        onClick={() => setExpanded("contact")}
      >
        <ContactContent />
      </GalleryFrame>

      {/* ══ EXPANDED OVERLAY MODALS ══ */}
      {expanded === "certs" && (
        <ExpandedOverlay title="Professional Certifications" onClose={() => setExpanded(null)}>
          <CertsContent expanded />
        </ExpandedOverlay>
      )}
      {expanded === "experience" && (
        <ExpandedOverlay title="Professional Experience" onClose={() => setExpanded(null)}>
          <ExperienceContent expanded />
        </ExpandedOverlay>
      )}
      {expanded === "contact" && (
        <ExpandedOverlay title="Contact Information" onClose={() => setExpanded(null)}>
          <ContactContent expanded />
        </ExpandedOverlay>
      )}
      {expanded?.startsWith("skill-") && (
        <ExpandedOverlay title={expanded.replace("skill-", "") + " Skills"} onClose={() => setExpanded(null)}>
          <SkillsExpandedContent category={expanded.replace("skill-", "")} />
        </ExpandedOverlay>
      )}
    </group>
  );
}
