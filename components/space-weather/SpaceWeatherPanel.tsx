"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSpaceWeather } from "@/hooks/useSpaceWeather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Activity, Sun, Zap, AlertTriangle, Clock } from "lucide-react";
import SpaceWeatherScore from "./SpaceWeatherScore";
import FlareTimeline from "./FlareTimeline";

export default function SpaceWeatherPanel() {
  const { data: sw, isLoading } = useSpaceWeather();

  if (isLoading || !sw) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* SCORE & QUICK STATS */}
      <div className="grid grid-cols-2 gap-4">
        <SpaceWeatherScore score={sw.severityScore} level={sw.scoreLevel} />

        <div className="flex flex-col gap-2">
          {/* KP Box */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-center relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-3 w-3 text-purple-400" />
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">KP Index</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tighter">
              {sw.kpIndex.toFixed(1)}
            </div>
            {/* Glow accent */}
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-purple-500/20 blur-xl rounded-full" />
          </div>

          {/* Aurora Box */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-center relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3 w-3 text-indigo-400" />
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Aurora Prob.</span>
            </div>
            <div className="text-sm font-bold text-white tracking-widest uppercase">
              {sw.auroraLevel}
            </div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-indigo-500/20 blur-xl rounded-full" />
          </div>
        </div>
      </div>

      {/* CME WARNING (If detected) */}
      {sw.cmeDetected && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-orange-500 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-bold text-orange-500 tracking-widest uppercase">CME Approaching</div>
              <div className="text-[10px] text-orange-400/80">Geomagnetic disturbance expected.</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* FLARE TIMELINE */}
      <Card className="bg-black/20 border-white/5 backdrop-blur-md shadow-2xl">
        <CardHeader className="pb-2 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-xs text-zinc-300 font-bold uppercase tracking-widest flex items-center gap-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            Recent Flares
          </CardTitle>
          <div className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Live
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <FlareTimeline flares={sw.recentFlares} />
        </CardContent>
      </Card>
    </div>
  );
}
