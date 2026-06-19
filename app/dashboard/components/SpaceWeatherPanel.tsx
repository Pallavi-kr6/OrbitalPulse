"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, Radio, Activity, AlertTriangle, BarChart3, Sun } from "lucide-react";

interface SpaceWeatherPanelProps {
  kpIndex: number;
  flares: { classType: string; beginTime: string }[];
  cmes: { activityID: string; startTime: string }[];
  storms: { storm_strength: string; start_time: string }[];
  isLoading?: boolean;
}

function getKpColor(kp: number): string {
  if (kp >= 8) return "#ef4444";
  if (kp >= 6) return "#f97316";
  if (kp >= 4) return "#eab308";
  if (kp >= 2) return "#22c55e";
  return "#60a5fa";
}

function getKpLabel(kp: number): string {
  if (kp >= 8) return "EXTREME STORM";
  if (kp >= 6) return "SEVERE STORM";
  if (kp >= 5) return "STRONG STORM";
  if (kp >= 4) return "ACTIVE";
  if (kp >= 2) return "UNSETTLED";
  return "QUIET";
}

function getAuroraProbability(kp: number): number {
  if (kp >= 8) return 95;
  if (kp >= 6) return 70;
  if (kp >= 5) return 50;
  if (kp >= 4) return 30;
  if (kp >= 3) return 15;
  return 5;
}

export default function SpaceWeatherPanel({
  kpIndex, flares, cmes, storms, isLoading,
}: SpaceWeatherPanelProps) {
  const kpColor = getKpColor(kpIndex);
  const aurora = getAuroraProbability(kpIndex);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4 gap-3">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Space Weather</span>
        </div>
        <div className="flex-1 flex items-center justify-center animate-pulse">
          <div className="w-20 h-20 rounded-full bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 gap-3 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Space Weather</span>
        </div>
      </div>

      {/* Kp Gauge */}
      <div className="flex items-center gap-4 bg-white/3 rounded-xl p-3 border border-white/5">
        <div className="flex flex-col items-center gap-1">
          <div className="text-3xl font-black font-mono" style={{ color: kpColor }}>
            {kpIndex.toFixed(1)}
          </div>
          <div className="text-[9px] font-mono text-zinc-500">Kp INDEX</div>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="text-xs font-mono font-bold" style={{ color: kpColor }}>
            {getKpLabel(kpIndex)}
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(kpIndex / 9) * 100}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: kpColor }}
            />
          </div>
          <div className="flex justify-between text-[8px] font-mono text-zinc-600">
            <span>0</span><span>3</span><span>6</span><span>9</span>
          </div>
        </div>
      </div>

      {/* Aurora probability */}
      <div className="flex items-center justify-between bg-white/3 rounded-lg p-2.5 border border-white/5">
        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-emerald-400" /> AURORA PROBABILITY
        </span>
        <span className="text-xs font-mono font-bold text-emerald-400">{aurora}%</span>
      </div>

      {/* Recent events */}
      <div className="space-y-2">
        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Recent Events</div>
        {flares.slice(0, 2).map((f, i) => (
          <div key={`f-${i}`} className="flex items-center gap-2 text-[10px] font-mono p-1.5 rounded bg-white/2">
            <Zap className="h-3 w-3 text-orange-400 flex-shrink-0" />
            <span className="text-zinc-400">FLARE</span>
            <span className="text-orange-400 font-bold">{f.classType}</span>
            <span className="text-zinc-600 ml-auto">{new Date(f.beginTime).toLocaleDateString()}</span>
          </div>
        ))}
        {cmes.slice(0, 1).map((c, i) => (
          <div key={`c-${i}`} className="flex items-center gap-2 text-[10px] font-mono p-1.5 rounded bg-white/2">
            <Radio className="h-3 w-3 text-purple-400 flex-shrink-0" />
            <span className="text-zinc-400">CME</span>
            <span className="text-purple-400 font-bold">{c.activityID.slice(-8)}</span>
            <span className="text-zinc-600 ml-auto">{new Date(c.startTime).toLocaleDateString()}</span>
          </div>
        ))}
        {storms.slice(0, 1).map((s, i) => (
          <div key={`s-${i}`} className="flex items-center gap-2 text-[10px] font-mono p-1.5 rounded bg-white/2">
            <AlertTriangle className="h-3 w-3 text-red-400 flex-shrink-0" />
            <span className="text-zinc-400">STORM</span>
            <span className="text-red-400 font-bold">{s.storm_strength}</span>
            <span className="text-zinc-600 ml-auto">{new Date(s.start_time).toLocaleDateString()}</span>
          </div>
        ))}
        {flares.length === 0 && cmes.length === 0 && storms.length === 0 && (
          <div className="text-[10px] font-mono text-zinc-600 p-2">No recent events</div>
        )}
      </div>
    </div>
  );
}
