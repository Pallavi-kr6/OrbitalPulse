"use client";

import React from "react";
import { motion } from "framer-motion";
import { FlareData } from "@/types/space-weather";
import { formatDistanceToNow } from "date-fns";
import { Sun } from "lucide-react";

export default function FlareTimeline({ flares }: { flares: FlareData[] }) {
  if (!flares || flares.length === 0) {
    return (
      <div className="p-4 text-xs text-zinc-500 text-center italic">
        No recent solar flares detected in the last 7 days.
      </div>
    );
  }

  const getFlareColor = (cls: string) => {
    if (cls.startsWith("X")) return "bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]";
    if (cls.startsWith("M")) return "bg-orange-500/20 text-orange-500 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]";
    if (cls.startsWith("C")) return "bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(96,165,250,0.3)]";
    return "bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(74,222,128,0.3)]";
  };

  return (
    <div className="flex flex-col gap-3 relative pl-4 mt-2">
      {/* Vertical timeline line */}
      <div className="absolute left-[23px] top-2 bottom-2 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent" />

      {flares.slice(0, 5).map((flare, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="relative flex items-center gap-4"
        >
          {/* Timeline Dot */}
          <div className={`w-2.5 h-2.5 rounded-full z-10 border flex-shrink-0 ${getFlareColor(flare.flareClass)}`} />
          
          {/* Content Box */}
          <div className="flex-1 bg-black/40 border border-white/5 rounded-lg p-2 flex justify-between items-center backdrop-blur-sm group hover:border-white/20 transition-colors">
            <div className="flex items-center gap-2">
              <Sun className={`h-4 w-4 ${getFlareColor(flare.flareClass).split(' ')[1]}`} />
              <span className="font-bold text-sm tracking-wider text-white">
                CLASS {flare.flareClass}
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest text-right">
              {formatDistanceToNow(new Date(flare.peakTime), { addSuffix: true })}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
