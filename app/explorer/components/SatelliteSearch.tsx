"use client";

import { useMemo } from "react";

interface SatelliteSearchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function SatelliteSearch({ label, value, onChange }: SatelliteSearchProps) {
  const inputLabel = useMemo(() => label, [label]);

  return (
    <div className="mt-4">
      <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {inputLabel}
      </label>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search name or NORAD ID "
        className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
      />
    </div>
  );
}
