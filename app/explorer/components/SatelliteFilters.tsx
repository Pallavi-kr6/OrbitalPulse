"use client";

import { useMemo } from "react";

interface FilterOption {
  readonly label: string;
  readonly value: string;
}

interface SatelliteFiltersProps {
  options: readonly FilterOption[];
  value: string;
  onChange: (value: any) => void;
}

export default function SatelliteFilters({ options, value, onChange }: SatelliteFiltersProps) {
  const items = useMemo(() => options, [options]);

  return (
    <div className="mt-4 space-y-3">
      {items.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
            option.value === value
              ? "border-sky-400 bg-sky-400/10 text-sky-200"
              : "border-white/10 bg-slate-950/80 text-slate-300 hover:border-sky-300 hover:bg-slate-900/80"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
