"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Globe, MapPin, Loader2 } from "lucide-react";

import { useLocationStore } from "@/store/useLocationStore";
import { useISS } from "@/hooks/useISS";
import { useSkyScore } from "@/hooks/useSkyScore";
import { useSpaceWeather } from "@/hooks/useSpaceWeather";
import { useAINarrator } from "@/hooks/useAINarrator";
import { useTLEs } from "@/hooks/useTLEs";

import SolarRibbon from "./components/SolarRibbon";
import OrbitalGlobe from "./components/OrbitalGlobe";
import type { ParsedSatellite } from "./components/OrbitalGlobe";
import SkyScoreCard from "./components/SkyScoreCard";
import ISSCompass from "./components/ISSCompass";
import WeatherPanel from "./components/WeatherPanel";
import SatelliteDetailsDrawer from "./components/SatelliteDetailsDrawer";
import ObservationWindow from "./components/ObservationWindow";
import SpaceWeatherPanel from "./components/SpaceWeatherPanel";
import AINarrator from "./components/AINarrator";

export default function DashboardPage() {
  const { latitude, longitude, setLocation } = useLocationStore();
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [selectedSat, setSelectedSat] = useState<ParsedSatellite | null>(null);
  const [trackedSatId, setTrackedSatId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<"sky" | "weather" | "space">("sky");

  // Geolocation
  useEffect(() => {
    if (latitude != null && longitude != null) {
      setGeoLoading(false);
      return;
    }
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported");
      setGeoLoading(false);
      // Default to Delhi
      setLocation(28.6139, 77.209);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude);
        setGeoLoading(false);
      },
      () => {
        setGeoError("Location denied — using Delhi");
        setLocation(28.6139, 77.209);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [latitude, longitude, setLocation]);

  // Data hooks
  const iss = useISS();
  const skyScore = useSkyScore(latitude ?? 28.6139, longitude ?? 77.209);
  const spaceWeather = useSpaceWeather();
  const aiNarrator = useAINarrator(latitude ?? 28.6139, longitude ?? 77.209);
  const tles = useTLEs();

  const issData = iss.data;
  const skyData = skyScore.data;
  const spData = spaceWeather.data;
  const aiData = aiNarrator.data;
  const tleData = tles.data;

  const handleSatClick = useCallback((sat: ParsedSatellite) => {
    setSelectedSat(sat);
  }, []);

  const handleTrack = useCallback((name: string) => {
    setTrackedSatId(name);
    setSelectedSat(null);
  }, []);

  // Loading screen
  if (geoLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <Globe className="h-16 w-16 text-blue-500 animate-spin" style={{ animationDuration: "3s" }} />
            <MapPin className="h-6 w-6 text-amber-400 absolute -bottom-1 -right-1 animate-bounce" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold font-mono text-white">Scanning Your Sky…</h2>
            <p className="text-sm text-zinc-400 font-mono">Requesting location access</p>
            <Loader2 className="h-5 w-5 text-blue-400 animate-spin mx-auto" />
          </div>
        </motion.div>
      </div>
    );
  }

  const nextPass = issData?.passes?.passes?.[0] ?? null;

  return (
    <div className="min-h-screen bg-[#030014] flex flex-col">
      {/* Solar Ribbon */}
      <SolarRibbon />

      {/* Top nav bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-blue-400 animate-spin" style={{ animationDuration: "8s" }} />
          <span className="text-xs font-mono font-bold text-white tracking-widest">ORBITAL PULSE</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <MapPin className="h-3 w-3 text-amber-400" />
          {latitude?.toFixed(2)}°N / {longitude?.toFixed(2)}°E
          {geoError && <span className="text-amber-500">({geoError})</span>}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT — Globe */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative flex-1 min-h-[50vh] lg:min-h-0"
        >
          <OrbitalGlobe
            tles={tleData?.tles ?? []}
            onSatelliteClick={handleSatClick}
            trackedSatId={trackedSatId}
            userLat={latitude}
            userLon={longitude}
          />

          {/* Satellite drawer overlay */}
          <SatelliteDetailsDrawer
            satellite={selectedSat}
            onClose={() => setSelectedSat(null)}
            onTrack={handleTrack}
          />

          {/* Tracking indicator */}
          {trackedSatId && (
            <div className="absolute top-3 left-3 z-30 bg-black/80 backdrop-blur-md border border-blue-500/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-mono text-blue-400">Tracking: {trackedSatId}</span>
              <button
                onClick={() => setTrackedSatId(null)}
                className="text-zinc-500 hover:text-white text-xs ml-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* TLE loading state */}
          {tles.isLoading && (
            <div className="absolute top-3 left-3 z-30 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
              <span className="text-[10px] font-mono text-zinc-400">Loading satellite TLEs from CelesTrak…</span>
            </div>
          )}
        </motion.div>

        {/* RIGHT — Panels */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full lg:w-[380px] xl:w-[420px] border-l border-white/5 bg-black/30 backdrop-blur-md flex flex-col overflow-y-auto"
        >
          {/* Tab bar */}
          <div className="flex border-b border-white/5 bg-black/20">
            {(["sky", "weather", "space"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 py-2.5 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 ${
                  rightTab === tab
                    ? "text-blue-400 border-blue-400 bg-blue-500/5"
                    : "text-zinc-600 border-transparent hover:text-zinc-400"
                }`}
              >
                {tab === "sky" ? "Sky Score" : tab === "weather" ? "Weather" : "Space Wx"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0">
            {rightTab === "sky" && (
              <SkyScoreCard
                score={skyData?.skyScore ?? null}
                cloudCover={skyData?.cloudCover ?? 0}
                visibilityKm={skyData?.visibilityKm ?? 0}
                moonIllumination={skyData?.moonIllumination ?? 0}
                kpIndex={skyData?.kpIndex ?? 0}
                lightPollution={skyData?.lightPollutionEstimate ?? 0}
                isLoading={skyScore.isLoading}
              />
            )}
            {rightTab === "weather" && (
              <WeatherPanel
                temperature={skyData?.temperature ?? 0}
                windSpeed={skyData?.windSpeed ?? 0}
                windDirection={skyData?.windDirection ?? 0}
                cloudCover={skyData?.cloudCover ?? 0}
                visibilityKm={skyData?.visibilityKm ?? 0}
                humidity={skyData?.humidity ?? 0}
                weatherCode={skyData?.weatherCode ?? 0}
                isDay={skyData?.isDay ?? true}
                isLoading={skyScore.isLoading}
              />
            )}
            {rightTab === "space" && (
              <SpaceWeatherPanel
                kpIndex={spData?.latestKpIndex ?? 0}
                flares={spData?.solarFlares ?? []}
                cmes={spData?.coronalMassEjections ?? []}
                storms={spData?.geomagneticStorms ?? []}
                isLoading={spaceWeather.isLoading}
              />
            )}
          </div>

          {/* ISS Compass */}
          <div className="border-t border-white/5">
            <ISSCompass
              issLat={issData?.latitude ?? null}
              issLon={issData?.longitude ?? null}
              userLat={latitude}
              userLon={longitude}
              nextPass={nextPass}
              isLoading={iss.isLoading}
            />
          </div>

          {/* Observation Window */}
          <div className="border-t border-white/5">
            <ObservationWindow
              passes={issData?.passes?.passes ?? []}
              isLoading={iss.isLoading}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom — AI Narrator */}
      <div className="border-t border-white/5 bg-black/40 backdrop-blur-md">
        <AINarrator
          narration={aiData ?? null}
          isLoading={aiNarrator.isLoading}
          onRefresh={() => aiNarrator.refetch()}
        />
      </div>
    </div>
  );
}
