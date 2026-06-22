"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertTriangle, Wind, Radio, ChevronRight } from "lucide-react";
import { useSpaceWeather } from "@/hooks/useSpaceWeather";

interface AlertItem {
  id: string;
  type: "flare" | "cme" | "storm" | "kp";
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}

function getKpColor(kp: number): string {
  if (kp >= 8) return "#ef4444";
  if (kp >= 6) return "#f97316";
  if (kp >= 4) return "#eab308";
  if (kp >= 2) return "#22c55e";
  return "#60a5fa";
}

function getKpLabel(kp: number): string {
  if (kp >= 8) return "EXTREME";
  if (kp >= 6) return "SEVERE";
  if (kp >= 5) return "STRONG";
  if (kp >= 4) return "ACTIVE";
  if (kp >= 2) return "UNSETTLED";
  return "QUIET";
}

export default function SolarRibbon() {
  const { data, isLoading } = useSpaceWeather();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const kp: number = data?.kpIndex ?? 0;
  const flares: { classType: string; beginTime: string }[] = data?.solarFlares ?? [];
  const cmes: { activityID: string; startTime: string }[] = data?.coronalMassEjections ?? [];
  const storms: { storm_strength: string; start_time: string }[] = data?.geomagneticStorms ?? [];

  const alerts: AlertItem[] = [
    {
      id: "kp",
      type: "kp",
      label: "GEOMAGNETIC ACTIVITY",
      value: `Kp-${kp.toFixed(1)} · ${getKpLabel(kp)}`,
      color: getKpColor(kp),
      icon: <Radio className="h-3 w-3" />,
    },
    ...flares.slice(0, 3).map((f, i) => ({
      id: `flare-${i}`,
      type: "flare" as const,
      label: "SOLAR FLARE",
      value: `Class ${f.classType} · ${new Date(f.beginTime).toUTCString().slice(5, 16)}`,
      color: "#f97316",
      icon: <Zap className="h-3 w-3" />,
    })),
    ...cmes.slice(0, 2).map((c, i) => ({
      id: `cme-${i}`,
      type: "cme" as const,
      label: "CME DETECTED",
      value: `ID ${c.activityID.slice(-6)} · ${new Date(c.startTime).toUTCString().slice(5, 16)}`,
      color: "#a78bfa",
      icon: <Wind className="h-3 w-3" />,
    })),
    ...storms.slice(0, 2).map((s, i) => ({
      id: `storm-${i}`,
      type: "storm" as const,
      label: "GEOMAGNETIC STORM",
      value: `${s.storm_strength} · ${new Date(s.start_time).toUTCString().slice(5, 16)}`,
      color: "#ef4444",
      icon: <AlertTriangle className="h-3 w-3" />,
    })),
  ];

  // Duplicate for infinite scroll effect
  const displayAlerts = alerts.length ? [...alerts, ...alerts] : [];

  return (
    <div
      className="relative w-full h-9 bg-black/60 backdrop-blur-md border-b border-white/8 overflow-hidden flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left badge */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 h-full border-r border-white/10 bg-white/3 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest whitespace-nowrap">
          SPACE WEATHER
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 text-[11px] font-mono text-zinc-500 animate-pulse">
            <span>Fetching space weather data…</span>
          </div>
        ) : (
          <motion.div
            ref={trackRef}
            className="flex items-center gap-0 whitespace-nowrap"
            animate={isPaused ? {} : { x: [0, -50 * Math.max(alerts.length, 1) * 14] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: Math.max(alerts.length * 8, 30),
                ease: "linear",
              },
            }}
          >
            {displayAlerts.map((alert, idx) => (
              <div
                key={`${alert.id}-${idx}`}
                className="flex items-center gap-2 px-5 border-r border-white/5 h-9"
              >
                <span style={{ color: alert.color }}>{alert.icon}</span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  {alert.label}:
                </span>
                <span className="text-[11px] font-mono font-semibold" style={{ color: alert.color }}>
                  {alert.value}
                </span>
                <ChevronRight className="h-3 w-3 text-zinc-700" />
              </div>
            ))}
            {displayAlerts.length === 0 && (
              <div className="px-4 text-[11px] font-mono text-zinc-600">
                No active alerts — Space weather is quiet
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Kp badge right */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full border-l border-white/10 bg-white/3"
        style={{ borderLeftColor: `${getKpColor(kp)}20` }}
      >
        <span className="text-[10px] font-mono text-zinc-500">Kp</span>
        <span className="text-sm font-mono font-bold" style={{ color: getKpColor(kp) }}>
          {kp.toFixed(1)}
        </span>
      </div>

      {/* Gradient fade left/right */}
      <div className="pointer-events-none absolute left-[110px] top-0 h-full w-8 bg-gradient-to-r from-black/60 to-transparent z-10" />
      <div className="pointer-events-none absolute right-16 top-0 h-full w-8 bg-gradient-to-l from-black/60 to-transparent z-10" />
    </div>
  );
}
