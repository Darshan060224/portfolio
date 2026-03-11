"use client";

import { motion } from "framer-motion";
import { FaCertificate } from "react-icons/fa";

const certs = [
  { name: "Fortinet FCF – Introduction to the Threat Landscape 3.0", issuer: "Fortinet", color: "border-neon-blue/30" },
  { name: "Google Cybersecurity Professional Certificate", issuer: "Google", color: "border-neon-green/30" },
  { name: "Advent of Cyber 2025 – 24 Challenges", issuer: "TryHackMe", color: "border-neon-purple/30" },
  { name: "Cisco Certified Ethical Hacker (Intro)", issuer: "Cisco", color: "border-neon-pink/30" },
  { name: "Ethical Hacking Essentials", issuer: "EC-Council", color: "border-neon-blue/30" },
  { name: "Intermediate Ethical Hacking", issuer: "EC-Council", color: "border-neon-green/30" },
  { name: "Cloud Security Fundamentals", issuer: "Palo Alto", color: "border-neon-purple/30" },
];

export default function Certifications() {
  return (
    <section id="certifications" className="mx-auto max-w-5xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="mb-2 text-sm font-mono text-neon-blue tracking-widest uppercase">
          Certifications
        </h2>
        <h3 className="mb-10 text-3xl font-bold text-[#E6F1FF]">
          Credentials & Achievements
        </h3>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certs.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`group flex items-start gap-3 rounded-xl border bg-[#111827] p-5 transition-all hover:-translate-y-0.5 hover:bg-[#1a2340] ${c.color}`}
          >
            <FaCertificate className="mt-0.5 shrink-0 text-neon-blue opacity-60 group-hover:opacity-100 transition-opacity" />
            <div>
              <p className="text-sm font-medium leading-snug text-[#E6F1FF]">{c.name}</p>
              <p className="mt-1 text-xs text-[#8892B0]">{c.issuer}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
