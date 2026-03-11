"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Room3D = dynamic(() => import("./Room3D"), { ssr: false });

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center overflow-hidden"
    >
      {/* Profile + Name */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="animate-float"
      >
        <div className="relative mb-4">
          <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#00E5FF] via-[#7B61FF] to-[#FF2E88] p-[3px] animate-pulse-glow">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0A0F1C] text-4xl font-bold text-neon-blue">
              D
            </div>
          </div>
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-3xl font-bold tracking-tight sm:text-4xl"
      >
        <span className="text-[#E6F1FF]">DARSHAN </span>
        <span className="text-neon-blue glow-blue">U</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-2 text-base text-[#8892B0] sm:text-lg"
      >
        <span className="text-neon-green">Cybersecurity</span>
        {" • "}
        <span className="text-neon-purple">DFIR</span>
        {" • "}
        <span className="text-neon-pink">VAPT</span>
      </motion.p>

      {/* ===== 3D ROOM SCENE ===== */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-8 w-full max-w-5xl"
      >
        <Room3D />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8"
      >
        <svg className="h-6 w-6 text-[#8892B0]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
