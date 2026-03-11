"use client";

import { motion } from "framer-motion";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const toolCategories = [
  {
    title: "Cybersecurity Tools",
    items: ["Nmap", "Burp Suite", "Metasploit", "Wireshark", "LinPEAS"],
    color: "text-neon-blue",
    border: "border-neon-blue/20",
  },
  {
    title: "SOC / SIEM",
    items: ["ELK Stack", "Splunk"],
    color: "text-neon-purple",
    border: "border-neon-purple/20",
  },
  {
    title: "Frontend",
    items: ["React", "React Native", "Angular", "HTML/CSS", "TailwindCSS", "TypeScript"],
    color: "text-neon-green",
    border: "border-neon-green/20",
  },
  {
    title: "Backend & Infra",
    items: ["Node.js", "Express", "Docker", "SQL", "MongoDB", "Redis"],
    color: "text-neon-pink",
    border: "border-neon-pink/20",
  },
  {
    title: "Operating Systems",
    items: ["Kali Linux", "Ubuntu", "Windows"],
    color: "text-neon-blue",
    border: "border-neon-blue/20",
  },
  {
    title: "Networking",
    items: ["TCP/IP", "DNS", "Firewalls", "IDS/IPS"],
    color: "text-neon-purple",
    border: "border-neon-purple/20",
  },
];

const radarData = {
  labels: ["Cybersecurity", "Networking", "Programming", "DFIR", "Cloud", "AI/ML"],
  datasets: [
    {
      label: "Skill Level",
      data: [92, 80, 85, 88, 70, 75],
      backgroundColor: "rgba(0, 229, 255, 0.15)",
      borderColor: "#00E5FF",
      borderWidth: 2,
      pointBackgroundColor: "#00E5FF",
      pointBorderColor: "#00E5FF",
      pointRadius: 4,
    },
  ],
};

const radarOptions = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: { display: false, stepSize: 20 },
      grid: { color: "rgba(255,255,255,0.06)" },
      angleLines: { color: "rgba(255,255,255,0.06)" },
      pointLabels: {
        color: "#8892B0",
        font: { size: 12 },
      },
    },
  },
  plugins: {
    tooltip: {
      backgroundColor: "#111827",
      borderColor: "#00E5FF",
      borderWidth: 1,
      titleColor: "#E6F1FF",
      bodyColor: "#8892B0",
    },
  },
};

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-5xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="mb-2 text-sm font-mono text-neon-blue tracking-widest uppercase">
          Skills
        </h2>
        <h3 className="mb-10 text-3xl font-bold text-[#E6F1FF]">
          Technical Arsenal
        </h3>
      </motion.div>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Radar chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center rounded-xl border border-white/5 bg-[#111827] p-6"
        >
          <div className="w-full max-w-sm">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </motion.div>

        {/* Tool grid */}
        <div className="grid grid-cols-2 gap-4">
          {toolCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`rounded-xl border bg-[#111827] p-4 transition-colors hover:bg-[#1a2340] ${cat.border}`}
            >
              <h4 className={`mb-2 text-xs font-semibold uppercase tracking-wider ${cat.color}`}>
                {cat.title}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="rounded bg-white/5 px-2 py-0.5 text-xs text-[#E6F1FF]/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
