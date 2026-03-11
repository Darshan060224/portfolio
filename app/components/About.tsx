"use client";

import { motion } from "framer-motion";
import { FaShieldAlt, FaBug, FaSearch, FaServer } from "react-icons/fa";

const highlights = [
  { icon: FaShieldAlt, label: "SOC Operations", color: "text-neon-blue" },
  { icon: FaBug, label: "VAPT", color: "text-neon-green" },
  { icon: FaSearch, label: "DFIR", color: "text-neon-purple" },
  { icon: FaServer, label: "SIEM Engineering", color: "text-neon-pink" },
];

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="mb-2 text-sm font-mono text-neon-blue tracking-widest uppercase">
          About Me
        </h2>
        <h3 className="mb-8 text-3xl font-bold text-[#E6F1FF]">
          Who is Darshan?
        </h3>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-[#8892B0] leading-relaxed">
            <p>
              Cybersecurity enthusiast and Computer Science Engineering student at{" "}
              <span className="text-neon-blue">KGiSL Institute of Technology</span>, Coimbatore.
              Passionate about ethical hacking, digital forensics, threat analysis, and building
              security tools.
            </p>
            <p>
              Currently maintaining a <span className="text-neon-green">CGPA of 8.44</span> while
              actively pursuing cybersecurity certifications and hands-on lab work. Completed a
              Security Engineer internship at{" "}
              <span className="text-neon-purple">BlackPerl</span>.
            </p>
            <p>
              Also experienced in full-stack development — building real-time applications,
              AI-assisted tools, and RAG-powered systems.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/5 bg-[#111827] p-5 text-center transition-all hover:border-white/10 hover:bg-[#1a2340]"
              >
                <h.icon className={`text-2xl ${h.color}`} />
                <span className="text-sm font-medium text-[#E6F1FF]">{h.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
