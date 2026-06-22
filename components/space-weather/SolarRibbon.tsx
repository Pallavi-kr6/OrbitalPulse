"use client";

import { motion } from "framer-motion";
import { useSpaceWeather } from "@/hooks/useSpaceWeather";
import { Activity, AlertTriangle, Sun, Zap } from "lucide-react";

export default function SolarRibbon() {
  const { data: sw, isLoading } = useSpaceWeather();

  if (isLoading || !sw) return null;

  // Color Coding Logic
  const getFlareColor = (cls: string | null) => {
    if (!cls) return "text-zinc-400";
    if (cls.startsWith("X")) return "text-red-500 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]";
    if (cls.startsWith("M")) return "text-orange-500 font-bold drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]";
    if (cls.startsWith("C")) return "text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]";
    return "text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]";
  };

  const getKpColor = (kp: number) => {
    if (kp > 7) return "text-red-500 font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]";
    if (kp > 5) return "text-purple-400 font-bold drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]";
    if (kp > 3) return "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]";
    return "text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]";
  };

  const items = [
    <span key="flare" className={`flex items-center gap-2 mx-8 ${getFlareColor(sw.flareClass)}`}>
      <Sun className="h-4 w-4" />
      {sw.flareClass ? `[${sw.flareClass} FLARE ACTIVE]` : "[NO ACTIVE FLARE]"}
    </span>,
    <span key="cme" className={`flex items-center gap-2 mx-8 ${sw.cmeDetected ? 'text-orange-500 font-bold drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'text-zinc-400'}`}>
      <AlertTriangle className="h-4 w-4" />
      {sw.cmeDetected ? "[CME DETECTED]" : "[NO CME DETECTED]"}
    </span>,
    <span key="kp" className={`flex items-center gap-2 mx-8 ${getKpColor(sw.kpIndex)}`}>
      <Activity className="h-4 w-4" />
      [KP {sw.kpIndex}]
    </span>,
    <span key="aurora" className={`flex items-center gap-2 mx-8 ${sw.auroraLevel !== "Low" ? 'text-indigo-400 font-bold drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'text-zinc-400'}`}>
      <Zap className="h-4 w-4" />
      [AURORA {sw.auroraLevel.toUpperCase()}]
    </span>
  ];

  return (
    <div className="w-full overflow-hidden bg-black/60 border-b border-white/10 py-1.5 flex whitespace-nowrap backdrop-blur-md relative z-40">
      <motion.div
        className="flex min-w-full items-center text-xs tracking-widest font-mono"
        initial={{ x: "0%" }}
        animate={{ x: "-50%" }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 30, // Adjust speed as needed
        }}
      >
        {/* Render items twice for seamless loop */}
        <div className="flex shrink-0">
          {items}
        </div>
        <div className="flex shrink-0">
          {items}
        </div>
      </motion.div>
    </div>
  );
}
