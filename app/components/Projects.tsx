"use client";

import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

const projects = [
  {
    title: "TimeScope",
    description:
      "Real-time crypto and stock market analytics dashboard tracking 50+ financial assets with AI-powered insights.",
    tech: ["React", "TypeScript", "Node.js", "MongoDB", "Redis", "Docker", "RAG"],
    color: "border-neon-blue/30 hover:border-neon-blue/60",
    glow: "hover:shadow-[0_0_30px_#00E5FF22]",
  },
  {
    title: "FEPD",
    description:
      "Digital forensics analysis system for automated artifact extraction, timeline reconstruction, and log correlation.",
    tech: ["Forensics", "Windows", "Linux", "macOS", "Android", "iOS"],
    color: "border-neon-purple/30 hover:border-neon-purple/60",
    glow: "hover:shadow-[0_0_30px_#7B61FF22]",
  },
  {
    title: "VaultCraft",
    description:
      "AI-based CTF machine generator using 180+ CVE templates with automated exploitation chain suggestions.",
    tech: ["AI", "CVE", "CTF", "Ethical Hacking", "Automation"],
    color: "border-neon-pink/30 hover:border-neon-pink/60",
    glow: "hover:shadow-[0_0_30px_#FF2E8822]",
  },
  {
    title: "NodeLink",
    description:
      "Real-time chat application with mobile-first architecture, user authentication, and instant messaging.",
    tech: ["Node.js", "React Native", "WebSocket", "Auth"],
    color: "border-neon-green/30 hover:border-neon-green/60",
    glow: "hover:shadow-[0_0_30px_#00FFA322]",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-5xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="mb-2 text-sm font-mono text-neon-blue tracking-widest uppercase">
          Projects
        </h2>
        <h3 className="mb-10 text-3xl font-bold text-[#E6F1FF]">
          What I&apos;ve Built
        </h3>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`group relative rounded-xl border bg-[#111827] p-6 transition-all duration-300 hover:-translate-y-1 ${p.color} ${p.glow}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-xl font-bold text-[#E6F1FF]">{p.title}</h4>
              <div className="flex gap-3 text-[#8892B0]">
                <FaGithub className="cursor-pointer transition-colors hover:text-neon-blue" />
                <FaExternalLinkAlt className="cursor-pointer transition-colors hover:text-neon-blue" />
              </div>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-[#8892B0]">{p.description}</p>
            <div className="flex flex-wrap gap-2">
              {p.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-[#E6F1FF]/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
