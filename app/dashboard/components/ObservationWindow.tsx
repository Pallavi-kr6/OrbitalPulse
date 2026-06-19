"use client";

import React from "react";
import { Telescope, Clock, ArrowUp, Navigation, Sunrise, Sunset, Moon } from "lucide-react";

interface Pass {
  startUTC: string;
  maxUTC: string;
  endUTC: string;
  startAzimuth: number;
  endAzimuth: number;
  maxElevation: number;
}

interface ObservationWindowProps {
  passes: Pass[];
  isLoading?: boolean;
}

function formatTime(utc: string): string {
  return new Date(utc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatCountdown(utc: string): string {
  const diff = new Date(utc).getTime() - Date.now();
  if (diff <= 0) return "Now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getElevationQuality(el: number): { label: string; color: string } {
  if (el >= 60) return { label: "EXCELLENT", color: "#34d399" };
  if (el >= 40) return { label: "GOOD", color: "#60a5fa" };
  if (el >= 20) return { label: "FAIR", color: "#f59e0b" };
  return { label: "LOW", color: "#ef4444" };
}

export default function ObservationWindow({ passes, isLoading }: ObservationWindowProps) {
  const upcomingPasses = passes
    .filter((p) => new Date(p.startUTC).getTime() > Date.now())
    .slice(0, 4);

  return (
    <div className="h-full flex flex-col p-4 gap-3 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Telescope className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Observation Window</span>
        </div>
        <span className="text-[9px] font-mono text-zinc-500">ISS PASSES</span>
      </div>

      {isLoading ? (
        <div className="flex-1 space-y-2 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-white/3 rounded-lg" />
          ))}
        </div>
      ) : upcomingPasses.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Moon className="h-8 w-8 text-zinc-700 mx-auto" />
            <p className="text-xs font-mono text-zinc-600">No ISS passes in the next 24h</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {upcomingPasses.map((pass, i) => {
            const quality = getElevationQuality(pass.maxElevation);
            const durationMin = (new Date(pass.endUTC).getTime() - new Date(pass.startUTC).getTime()) / 60000;
            const isNext = i === 0;

            return (
              <div
                key={i}
                className={`rounded-xl p-3 border transition-all ${
                  isNext
                    ? "bg-indigo-500/8 border-indigo-500/25"
                    : "bg-white/2 border-white/5"
                }`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isNext && (
                      <span className="text-[8px] font-mono font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded tracking-widest">
                        NEXT
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-zinc-400">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatCountdown(pass.startUTC)}
                    </span>
                  </div>
                  <span
                    className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded tracking-widest"
                    style={{ color: quality.color, background: `${quality.color}15` }}
                  >
                    {quality.label}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                  <div>
                    <div className="text-zinc-600 flex items-center gap-0.5">
                      <Sunrise className="h-2.5 w-2.5" /> START
                    </div>
                    <div className="text-white">{formatTime(pass.startUTC)}</div>
                  </div>
                  <div>
                    <div className="text-zinc-600 flex items-center gap-0.5">
                      <ArrowUp className="h-2.5 w-2.5" /> MAX EL
                    </div>
                    <div className="text-white">{pass.maxElevation.toFixed(1)}°</div>
                  </div>
                  <div>
                    <div className="text-zinc-600 flex items-center gap-0.5">
                      <Sunset className="h-2.5 w-2.5" /> DUR
                    </div>
                    <div className="text-white">{durationMin.toFixed(0)} min</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
