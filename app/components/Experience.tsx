"use client";

import { motion } from "framer-motion";
import { FaBriefcase } from "react-icons/fa";

export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-5xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="mb-2 text-sm font-mono text-neon-blue tracking-widest uppercase">
          Experience
        </h2>
        <h3 className="mb-10 text-3xl font-bold text-[#E6F1FF]">
          Professional Journey
        </h3>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative border-l-2 border-neon-blue/30 pl-8 ml-4"
      >
        {/* Timeline dot */}
        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-neon-blue animate-pulse-glow" />

        <div className="rounded-xl border border-white/5 bg-[#111827] p-6 transition-all hover:border-white/10 hover:bg-[#1a2340]">
          <div className="mb-3 flex items-start justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <FaBriefcase className="text-neon-blue" />
              <h4 className="text-lg font-bold text-[#E6F1FF]">Security Engineer Intern</h4>
            </div>
            <span className="rounded-full bg-neon-blue/10 px-3 py-1 text-xs font-medium text-neon-blue">
              Jan 2026 – Feb 2026
            </span>
          </div>
          <p className="mb-3 text-sm font-semibold text-neon-purple">BlackPerl</p>
          <p className="text-sm leading-relaxed text-[#8892B0]">
            Worked in a production-grade cybersecurity environment aligned with industry practices.
            Gained exposure to real-world security operations and workflows including threat
            detection, incident analysis, and security tooling.
          </p>
        </div>
      </motion.div>

      {/* Education */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-16"
      >
        <h3 className="mb-6 text-xl font-bold text-[#E6F1FF]">Education</h3>
        <div className="relative border-l-2 border-neon-purple/30 pl-8 ml-4">
          <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-neon-purple" />
          <div className="rounded-xl border border-white/5 bg-[#111827] p-6">
            <div className="mb-2 flex items-start justify-between flex-wrap gap-2">
              <h4 className="text-lg font-bold text-[#E6F1FF]">B.E. Computer Science & Engineering</h4>
              <span className="rounded-full bg-neon-purple/10 px-3 py-1 text-xs font-medium text-neon-purple">
                2023 – 2027
              </span>
            </div>
            <p className="mb-3 text-sm font-semibold text-neon-green">KGiSL Institute of Technology</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#8892B0]">CGPA:</span>
              <span className="rounded bg-neon-green/10 px-2 py-0.5 text-sm font-bold text-neon-green">
                8.44
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
