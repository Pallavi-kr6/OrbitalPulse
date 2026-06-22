"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, MapPin, Loader2 } from "lucide-react";

import { useLocationStore } from "@/store/useLocationStore";
import { useSkyScore } from "@/hooks/useSkyScore";
import { useSpaceWeather } from "@/hooks/useSpaceWeather";
import { useISS } from "@/hooks/useISS";
import { useTLEs } from "@/hooks/useTLEs";

import { motion } from "framer-motion";

import SolarRibbon from "@/components/space-weather/SolarRibbon";
import OrbitalGlobe from "./components/OrbitalGlobe";
import type { ParsedSatellite } from "./components/OrbitalGlobe";
import SkyScoreCard from "./components/SkyScoreCard";
import ISSCompass from "./components/ISSCompass";
import WeatherPanel from "./components/WeatherPanel";
import SatelliteDetailsDrawer from "./components/SatelliteDetailsDrawer";
import ObservationWindow from "./components/ObservationWindow";
import SpaceWeatherPanel from "@/components/space-weather/SpaceWeatherPanel";

import { useNarration } from "@/lib/hooks/useNarration";
import { useAINarrator } from "@/hooks/useAINarrator";

export default function DashboardPage() {
  const { latitude, longitude, setLocation } = useLocationStore();

  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [selectedSat, setSelectedSat] = useState<ParsedSatellite | null>(null);
  const [trackedSatId, setTrackedSatId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<"sky" | "weather" | "space">("sky");

  const narrator = useNarration();
  const aiNarrator = useAINarrator(latitude ?? 28.6139, longitude ?? 77.209);

  // -----------------------------
  // DATA HOOKS (keep ABOVE effects)
  // -----------------------------
  const skyScore = useSkyScore(latitude ?? 28.6139, longitude ?? 77.209);
  const spaceWeather = useSpaceWeather();
  const iss = useISS();
  const tles = useTLEs();

  const issData = iss.data;
  const skyData = skyScore.data;
  const spData = spaceWeather.data;

  // -----------------------------
  // GEO LOCATION
  // -----------------------------
  useEffect(() => {
    if (latitude != null && longitude != null) {
      setGeoLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported");
      setLocation(28.6139, 77.209);
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude);
        setGeoLoading(false);
      },
      () => {
        setGeoError("Location denied — using default sky view");
        setLocation(28.6139, 77.209);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [latitude, longitude, setLocation]);

  // -----------------------------
  // 🎙️ GLOBAL INTRO (AUTO SPEAK)
  // -----------------------------
  useEffect(() => {
    narrator.speakOnce(
      "dashboard_intro",
      "Welcome to Orbital Pulse. I am your AI sky guide. I will describe everything you see in real time — satellites, weather, and space activity above you.",
      true
    );
  }, [narrator]);

  // -----------------------------
  // 🎙️ LOADING NARRATION FLOW
  // -----------------------------
  useEffect(() => {
    if (geoLoading) {
      narrator.speakOnce("dashboard_geo", "Acquiring your location to map the sky above you.");
      return;
    }

    if (iss.isLoading) {
      narrator.speakOnce("dashboard_iss", "Tracking satellites currently passing above your region.");
    }

    if (skyScore.isLoading) {
      narrator.speakOnce("dashboard_sky", "Analyzing sky clarity, cloud cover, and visibility conditions.");
    }

    if (spaceWeather.isLoading) {
      narrator.speakOnce("dashboard_space", "Checking solar activity and space weather conditions.");
    }
  }, [geoLoading, iss.isLoading, skyScore.isLoading, spaceWeather.isLoading, narrator]);

  // -----------------------------
  // 🎙️ FINAL SUMMARY NARRATION
  // -----------------------------
  useEffect(() => {
    const allLoaded =
      !geoLoading &&
      !iss.isLoading &&
      !skyScore.isLoading &&
      !spaceWeather.isLoading &&
      !tles.isLoading;

    if (!allLoaded) return;

    if (aiNarrator?.data?.summary) {
      narrator.speakOnce("dashboard_summary", aiNarrator.data.summary, true);
      return;
    }

    const visibility = skyScore.data?.visibilityKm ?? 0;
    const cloud = skyScore.data?.cloudCover ?? 0;
    const kp = spaceWeather.data?.kpIndex ?? 0;
    const nextPass = issData?.passes?.passes?.[0];

    let summary = `Sky scan complete. Visibility is ${visibility.toFixed(
      1
    )} kilometers with ${cloud}% cloud cover.`;

    if (nextPass) {
      summary += ` The International Space Station will be visible at ${new Date(
        nextPass.startUTC
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}, moving at an elevation of ${nextPass.maxElevation.toFixed(
        0
      )} degrees.`;
    }

    summary += ` Current solar activity level is Kp index ${kp}.`;

    narrator.speakOnce("dashboard_summary", summary, true);
  }, [
    geoLoading,
    iss.isLoading,
    skyScore.isLoading,
    spaceWeather.isLoading,
    tles.isLoading,
    aiNarrator.data,
    narrator
  ]);

  // -----------------------------
  // HANDLERS
  // -----------------------------
  const handleSatClick = useCallback((sat: ParsedSatellite) => {
    setSelectedSat(sat);
  }, []);

  const handleTrack = useCallback((name: string) => {
    setTrackedSatId(name);
    setSelectedSat(null);
  }, []);

  // -----------------------------
  // LOADING SCREEN
  // -----------------------------
  if (geoLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Globe className="h-16 w-16 text-blue-500 animate-spin" />
          <div className="text-center">
            <h2 className="text-white font-bold">Initializing Orbital Pulse</h2>
            <p className="text-zinc-400 text-sm">Preparing sky simulation...</p>
          </div>
          <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
        </motion.div>
      </div>
    );
  }

  const nextPass = issData?.passes?.passes?.[0] ?? null;

  return (
    <div className="min-h-screen bg-[#030014] flex flex-col">
      <SolarRibbon />

      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <Link href="/" className="text-xs text-zinc-400 flex items-center gap-2">
          <ArrowLeft className="h-3 w-3" />
          Home
        </Link>

        <div className="flex items-center gap-2 text-white font-bold text-xs">
          <Globe className="h-3 w-3 text-blue-400 animate-spin" />
          ORBITAL PULSE
        </div>

        <div className="text-[10px] text-zinc-400 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-amber-400" />
          {latitude?.toFixed(2)}°N / {longitude?.toFixed(2)}°E
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT */}
        <div className="flex-1 relative">
          <OrbitalGlobe
            tles={tles.data?.tles ?? []}
            onSatelliteClick={handleSatClick}
            trackedSatId={trackedSatId}
            userLat={latitude}
            userLon={longitude}
          />

          <SatelliteDetailsDrawer
            satellite={selectedSat}
            onClose={() => setSelectedSat(null)}
            onTrack={handleTrack}
          />
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-[420px] border-l border-white/5 bg-black/30 flex flex-col">
          <div className="p-2 text-xs text-purple-400 border-b border-white/5">
            ● Voice Narration Active
          </div>

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
            <SpaceWeatherPanel />
          )}

          <ISSCompass
            issLat={issData?.latitude ?? null}
            issLon={issData?.longitude ?? null}
            userLat={latitude}
            userLon={longitude}
            nextPass={nextPass}
            isLoading={iss.isLoading}
          />

          <ObservationWindow
            passes={issData?.passes?.passes ?? []}
            isLoading={iss.isLoading}
          />

          <div className="p-2 text-xs text-zinc-400 border-t border-white/5">
            Narration adapts automatically to sky activity in real time.
          </div>
        </div>
      </div>
    </div>
  );
}