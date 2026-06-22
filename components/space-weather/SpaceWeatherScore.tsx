"use client";

import React from "react";
import { motion } from "framer-motion";

export default function SpaceWeatherScore({
  score,
  level
}: {
  score: number;
  level: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
}) {
  const getLevelColor = () => {
    switch (level) {
      case "LOW": return "text-green-400 border-green-500/30 bg-green-500/10 shadow-[0_0_15px_rgba(74,222,128,0.2)]";
      case "MODERATE": return "text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.2)]";
      case "HIGH": return "text-orange-500 border-orange-500/30 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]";
      case "EXTREME": return "text-red-500 border-red-500/30 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.4)]";
      default: return "text-zinc-400 border-white/10 bg-white/5";
    }
  };

  const getGlow = () => {
    switch (level) {
      case "LOW": return "rgba(74,222,128,0.8)";
      case "MODERATE": return "rgba(251,191,36,0.8)";
      case "HIGH": return "rgba(249,115,22,0.8)";
      case "EXTREME": return "rgba(239,68,68,0.8)";
      default: return "rgba(255,255,255,0.2)";
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border backdrop-blur-md ${getLevelColor()}`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="relative flex items-center justify-center w-24 h-24 mb-2"
      >
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="opacity-20"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray="251.2"
            initial={{ strokeDashoffset: 251.2 }}
            animate={{ strokeDashoffset: 251.2 - (251.2 * (score / 10)) }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 6px ${getGlow()})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black tracking-tighter" style={{ textShadow: `0 0 10px ${getGlow()}` }}>
            {score.toFixed(1)}
          </span>
          <span className="text-[10px] uppercase font-bold opacity-80">/ 10</span>
        </div>
      </motion.div>
      <div className="text-xs font-bold tracking-widest uppercase">
        {level} ACTIVITY
      </div>
    </div>
  );
}
