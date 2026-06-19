"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Satellite, Globe, ArrowUp, Clock, Navigation, Radio, Crosshair } from "lucide-react";

interface SatelliteData {
  name: string;
  noradId: string;
  lat: number;
  lon: number;
  altKm: number;
  orbitType: "LEO" | "MEO" | "GEO" | "HEO";
  color: string;
}

interface SatelliteDetailsDrawerProps {
  satellite: SatelliteData | null;
  onClose: () => void;
  onTrack?: (name: string) => void;
}

function getOrbitalPeriod(altKm: number): number {
  const R = 6371 + altKm;
  const mu = 398600.4418;
  return (2 * Math.PI * Math.sqrt(R ** 3 / mu)) / 60;
}

function orbitTypeLabel(type: string): { label: string; color: string } {
  switch (type) {
    case "LEO": return { label: "Low Earth Orbit", color: "#38bdf8" };
    case "MEO": return { label: "Medium Earth Orbit", color: "#fb923c" };
    case "GEO": return { label: "Geostationary Orbit", color: "#818cf8" };
    case "HEO": return { label: "High Earth Orbit", color: "#c084fc" };
    default: return { label: "Unknown", color: "#71717a" };
  }
}

export default function SatelliteDetailsDrawer({
  satellite, onClose, onTrack,
}: SatelliteDetailsDrawerProps) {
  if (!satellite) return null;
  const period = getOrbitalPeriod(satellite.altKm);
  const orbit = orbitTypeLabel(satellite.orbitType);
  const velocity = Math.sqrt(398600.4418 / (6371 + satellite.altKm));

  return (
    <AnimatePresence>
      {satellite && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-2xl border-l border-white/10 z-50 flex flex-col shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: satellite.color, boxShadow: `0 0 8px ${satellite.color}` }} />
              <div>
                <div className="font-mono font-bold text-white text-sm">{satellite.name}</div>
                <div className="text-[10px] font-mono text-zinc-500">NORAD #{satellite.noradId}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Orbit type badge */}
          <div className="px-4 pt-4">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold tracking-widest"
              style={{ color: orbit.color, borderColor: `${orbit.color}40`, background: `${orbit.color}15` }}
            >
              <Satellite className="h-3 w-3" />
              {satellite.orbitType} — {orbit.label}
            </span>
          </div>

          {/* Data grid */}
          <div className="p-4 space-y-3">
            {[
              { icon: <ArrowUp className="h-3.5 w-3.5 text-cyan-400" />, label: "ALTITUDE", value: `${satellite.altKm.toFixed(1)} km` },
              { icon: <Globe className="h-3.5 w-3.5 text-blue-400" />, label: "LATITUDE", value: `${satellite.lat.toFixed(4)}°` },
              { icon: <Globe className="h-3.5 w-3.5 text-indigo-400" />, label: "LONGITUDE", value: `${satellite.lon.toFixed(4)}°` },
              { icon: <Clock className="h-3.5 w-3.5 text-amber-400" />, label: "ORBITAL PERIOD", value: `${period.toFixed(1)} min` },
              { icon: <Navigation className="h-3.5 w-3.5 text-emerald-400" />, label: "VELOCITY", value: `${velocity.toFixed(2)} km/s` },
              { icon: <Radio className="h-3.5 w-3.5 text-purple-400" />, label: "NORAD ID", value: `#${satellite.noradId}` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  {item.icon}
                  {item.label}
                </span>
                <span className="text-xs font-mono text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Track button */}
          {onTrack && (
            <div className="p-4 mt-auto">
              <button
                onClick={() => onTrack(satellite.name)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 hover:from-blue-500/30 hover:to-indigo-500/30 transition-all font-mono text-xs font-bold tracking-widest uppercase"
              >
                <Crosshair className="h-4 w-4" />
                Track on Globe
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
