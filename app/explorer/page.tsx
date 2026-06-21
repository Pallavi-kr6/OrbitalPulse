"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { ArrowLeft, Search, Satellite, Globe, Filter } from "lucide-react";
import Link from "next/link";
import { useLocationStore } from "@/store/useLocationStore";
import { useTLEs } from "@/hooks/useTLEs";
import OrbitalGlobe from "@/app/dashboard/components/OrbitalGlobe";
import SatelliteDetailsDrawer from "@/app/dashboard/components/SatelliteDetailsDrawer";
import SatelliteSearch from "@/app/explorer/components/SatelliteSearch";
import SatelliteFilters from "@/app/explorer/components/SatelliteFilters";
import SatelliteList from "@/app/explorer/components/SatelliteList";
import type { ParsedSatellite } from "@/app/dashboard/components/OrbitalGlobe";
import { useSatelliteStore } from "@/store/useSatelliteStore";
import type { SelectedSatellite } from "@/store/useSatelliteStore";
import * as satellite from "satellite.js";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "ISS", value: "iss" },
  { label: "Stations", value: "stations" },
  { label: "Starlink", value: "starlink" },
  { label: "Active Satellites", value: "active" },
] as const;

type FilterValue = (typeof filterOptions)[number]["value"];

type ExplorerSatellite = SelectedSatellite & {
  id: number;
  latitude: number;
  longitude: number;
  altitudeKm: number;
};

export default function ExplorerPage() {
  const { latitude, longitude } = useLocationStore();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const selectedSatellite = useSatelliteStore((s) => s.selectedSatellite);
  const setSelectedSatellite = useSatelliteStore((s) => s.setSelectedSatellite);
  const trackedSatIdStore = useSatelliteStore((s) => s.trackedSatId);
  const setTrackedSatId = useSatelliteStore((s) => s.setTrackedSatId);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchTerm(searchInput.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const tlesQuery = useTLEs();
  const tles = tlesQuery.data?.tles ?? [];

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Parse TLEs into satrec objects once
  const parsedSatrecs = useMemo(() => {
    return tles.map((tle) => {
      const noradId = tle.line1.slice(2, 7).trim();
      try {
        const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
        return {
          tle,
          noradId,
          satrec,
        };
      } catch {
        return null;
      }
    }).filter((s): s is NonNullable<typeof s> => s !== null);
  }, [tles]);

  const filteredSats = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return parsedSatrecs.filter(({ tle }) => {
      const name = tle.name.toLowerCase();
      const norad = tle.line1.slice(2, 7).trim();
      const matchesSearch = !term || name.includes(term) || norad.includes(term);

      if (!matchesSearch) return false;
      if (filter === "all") return true;
      if (filter === "iss") return /ISS|ZARYA/i.test(tle.name);
      if (filter === "stations") return /ISS|HST|TIANGONG|LUCH/i.test(tle.name);
      if (filter === "starlink") return /STARLINK/i.test(tle.name);
      if (filter === "active") return true;
      return true;
    });
  }, [searchTerm, filter, parsedSatrecs]);

  const filteredTles = useMemo(() => {
    return filteredSats.map((s) => s.tle);
  }, [filteredSats]);

  const visibleSatellites = useMemo(() => {
    const gmst = satellite.gstime(now);
    return filteredSats.map(({ tle, noradId, satrec }) => {
      let lat = 0;
      let lon = 0;
      let altKm = 0;
      let velocityKms = 0;

      try {
        const pv = satellite.propagate(satrec, now);
        const pos = pv.position;
        const vel = pv.velocity;

        if (pos && typeof pos !== "boolean") {
          const geo = satellite.eciToGeodetic(pos, gmst);
          lat = satellite.degreesLat(geo.latitude);
          lon = satellite.degreesLong(geo.longitude);
          altKm = geo.height;
        }

        if (vel && typeof vel !== "boolean") {
          velocityKms = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
        }
      } catch {}

      return {
        id: Number(noradId) || 0,
        name: tle.name.trim(),
        latitude: lat,
        longitude: lon,
        altitudeKm: altKm,
        velocityKms,
        noradId,
        lat,
        lon,
        altKm,
        color: "#60a5fa",
        orbitType: "LEO" as const,
        visible: true,
      } as ExplorerSatellite;
    });
  }, [filteredSats, now]);

  const handleSelectSatellite = useCallback((sat: ParsedSatellite) => {
    setSelectedSatellite({
      id: sat.noradId ?? sat.name,
      name: sat.name,
      noradId: sat.noradId,
      lat: sat.lat,
      lon: sat.lon,
      altKm: sat.altKm,
      orbitType: sat.orbitType,
      visible: sat.visible,
      color: sat.color,
    });
  }, [setSelectedSatellite]);

  const handleSelectSatelliteFromList = useCallback(
    (sat: any) => {
      setSelectedSatellite({
        id: sat.noradId ?? sat.id,
        name: sat.name,
        noradId: sat.noradId,
        lat: sat.lat,
        lon: sat.lon,
        altKm: sat.altKm,
        orbitType: sat.orbitType,
        visible: sat.visible,
        color: sat.color,
      });
      setTrackedSatId(sat.noradId ?? String(sat.id));
    },
    [setSelectedSatellite, setTrackedSatId]
  );

  const handleTrack = useCallback((name: string) => {
    setTrackedSatId(name);
  }, [setTrackedSatId]);

  const searchLabel = useMemo(() => "Search satellites by name or NORAD ID", []);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#020617]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-sky-300 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-slate-400">
            <Globe className="h-4 w-4 text-sky-400" /> Satellite Explorer
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-12 gap-4 px-4 py-6 lg:py-8">
        <aside className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-sky-300">
              <Search className="h-4 w-4" /> Search
            </div>
            <SatelliteSearch label={searchLabel} value={searchInput} onChange={setSearchInput} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-sky-300">
              <Filter className="h-4 w-4" /> Filters
            </div>
            <SatelliteFilters options={filterOptions} value={filter} onChange={setFilter} />
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-sky-300">
              <Satellite className="h-4 w-4" /> Satellite List
            </div>
            <SatelliteList
              isLoading={tlesQuery.isLoading}
              satellites={visibleSatellites}
              onSelect={handleSelectSatelliteFromList}
            />
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-6 rounded-3xl border border-white/10 bg-slate-950/50 p-4 shadow-xl shadow-slate-950/20 backdrop-blur-xl flex items-center justify-center h-[500px] lg:h-[650px] relative">
          <OrbitalGlobe
            tles={filteredTles}
            onSatelliteClick={handleSelectSatellite}
            trackedSatId={trackedSatIdStore ?? selectedSatellite?.name ?? null}
            userLat={latitude ?? 28.6139}
            userLon={longitude ?? 77.209}
          />
        </main>

        <aside className="col-span-12 lg:col-span-3">
          <SatelliteDetailsDrawer
            satellite={selectedSatellite}
            onClose={() => setSelectedSatellite(null)}
            onTrack={handleTrack}
          />
        </aside>
      </div>
    </div>
  );
}
