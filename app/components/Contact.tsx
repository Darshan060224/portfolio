"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { SiTryhackme } from "react-icons/si";

const links = [
  {
    icon: FaGithub,
    label: "GitHub",
    href: "https://github.com/Darshan060224/",
    color: "hover:text-neon-blue hover:border-neon-blue/40 hover:shadow-[0_0_20px_#00E5FF22]",
  },
  {
    icon: FaLinkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/darshan24211/",
    color: "hover:text-neon-blue hover:border-neon-blue/40 hover:shadow-[0_0_20px_#00E5FF22]",
  },
  {
    icon: SiTryhackme,
    label: "TryHackMe",
    href: "https://tryhackme.com/p/darshan060224",
    color: "hover:text-neon-green hover:border-neon-green/40 hover:shadow-[0_0_20px_#00FFA322]",
  },
  {
    icon: FaEnvelope,
    label: "Email",
    href: "mailto:darshan060224@gmail.com",
    color: "hover:text-neon-pink hover:border-neon-pink/40 hover:shadow-[0_0_20px_#FF2E8822]",
  },
];

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="mb-2 text-sm font-mono text-neon-blue tracking-widest uppercase">
          Contact
        </h2>
        <h3 className="mb-4 text-3xl font-bold text-[#E6F1FF]">
          Get In Touch
        </h3>
        <p className="mx-auto mb-10 max-w-md text-[#8892B0]">
          Interested in collaborating, security projects, or just want to chat about cybersecurity
          and tech? Feel free to reach out!
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-6">
        {links.map((l, i) => (
          <motion.a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={`flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-8 py-6 text-[#8892B0] transition-all duration-300 ${l.color}`}
          >
            <l.icon className="text-3xl" />
            <span className="text-sm font-medium">{l.label}</span>
          </motion.a>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-20 text-center"
      >
        <p className="text-sm text-[#8892B0]/60">
          Designed & Built by{" "}
          <span className="text-neon-blue">Darshan U</span>
        </p>
        <p className="mt-1 font-mono text-xs text-[#8892B0]/40">
          &lt;/&gt; with Next.js • TailwindCSS • FastAPI • LangChain
        </p>
      </motion.div>
    </section>
  );
}
