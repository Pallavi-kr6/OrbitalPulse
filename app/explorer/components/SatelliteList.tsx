"use client";

import React, { memo, useMemo } from "react";
import { useSatelliteStore } from "@/store/useSatelliteStore";

interface SatelliteListItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  altitudeKm: number;
  velocityKms?: number;
}

interface SatelliteListProps {
  satellites: SatelliteListItem[];
  isLoading: boolean;
  selectedSatelliteId?: string | number | null;
  onSelect: (sat: SatelliteListItem) => void;
}

function SatelliteListComponent({ satellites, isLoading, onSelect }: SatelliteListProps) {
  const items = useMemo(() => satellites, [satellites]);
  const selected = useSatelliteStore((s) => s.selectedSatellite);

  const isSelected = (id: number) => {
    if (!selected) return false;
    return String(selected.id) === String(id) || selected.noradId === String(id);
  };

  if (isLoading) {
    return <div className="mt-4 text-sm text-slate-400">Loading satellites...</div>;
  }

  if (!items.length) {
    return <div className="mt-4 text-sm text-slate-400">No matching satellites found.</div>;
  }

  return (
    <div className="mt-4 space-y-3 max-h-[520px] overflow-y-auto pr-1">
      {items.map((satellite) => (
        <button
          key={satellite.id}
          type="button"
          onClick={() => onSelect(satellite)}
          className={`w-full rounded-3xl border p-4 text-left text-sm transition ${
            isSelected(satellite.id)
              ? "border-sky-400 bg-sky-400/6 text-white"
              : "border-white/10 bg-slate-950/80 text-white hover:border-sky-400/40 hover:bg-slate-900/90"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-white">{satellite.name}</div>
            <div className="text-xs text-slate-400">#{satellite.id}</div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div>Lat: {satellite.latitude.toFixed(1)}°</div>
            <div>Lon: {satellite.longitude.toFixed(1)}°</div>
            <div>Alt: {satellite.altitudeKm.toFixed(0)} km</div>
            <div>Vel: {satellite.velocityKms ? `${satellite.velocityKms.toFixed(1)} km/s` : "—"}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default memo(SatelliteListComponent);
