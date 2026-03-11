"use client";

import { motion } from "framer-motion";
import { FaFlask, FaTrophy } from "react-icons/fa";

const platforms = [
  {
    name: "TryHackMe",
    icon: FaFlask,
    username: "darshan060224",
    details: "Web vulnerabilities, Privilege escalation, Attack simulation labs",
    highlight: "Advent of Cyber 2025 — 24 challenges completed",
    color: "text-neon-green",
    border: "border-neon-green/30 hover:border-neon-green/50",
    link: "https://tryhackme.com/p/darshan060224",
  },
  {
    name: "Hackviser VIP",
    icon: FaTrophy,
    username: "VIP Member",
    details: "Scenario-based cybersecurity challenges, Practical attack & defense exercises",
    highlight: "Top 3% percentile • 24+ hours of lab work in a single week",
    color: "text-neon-purple",
    border: "border-neon-purple/30 hover:border-neon-purple/50",
    link: "#",
  },
];

export default function CyberLab() {
  return (
    <section id="cyberlab" className="mx-auto max-w-5xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="mb-2 text-sm font-mono text-neon-blue tracking-widest uppercase">
          Cyber Lab
        </h2>
        <h3 className="mb-10 text-3xl font-bold text-[#E6F1FF]">
          Hands-On Learning
        </h3>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {platforms.map((p, i) => (
          <motion.a
            key={p.name}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className={`group block rounded-xl border bg-[#111827] p-6 transition-all hover:-translate-y-1 hover:bg-[#1a2340] ${p.border}`}
          >
            <div className="mb-4 flex items-center gap-3">
              <p.icon className={`text-2xl ${p.color}`} />
              <div>
                <h4 className="text-lg font-bold text-[#E6F1FF]">{p.name}</h4>
                <p className="text-xs text-[#8892B0]">{p.username}</p>
              </div>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-[#8892B0]">{p.details}</p>
            <div className={`rounded-lg bg-white/5 px-3 py-2 text-xs font-medium ${p.color}`}>
              {p.highlight}
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
