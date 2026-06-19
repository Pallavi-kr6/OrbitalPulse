"use client";

import React from "react";
import {
  Cloud, Thermometer, Wind, Eye, Droplets, Sun, Moon, CloudRain, CloudSnow, CloudFog,
} from "lucide-react";

interface WeatherPanelProps {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  visibilityKm: number;
  humidity: number;
  weatherCode: number;
  isDay: boolean;
  isLoading?: boolean;
}

function getWeatherLabel(code: number): { label: string; icon: React.ReactNode } {
  if (code === 0) return { label: "Clear Sky", icon: <Sun className="h-5 w-5 text-amber-400" /> };
  if (code <= 3) return { label: "Partly Cloudy", icon: <Cloud className="h-5 w-5 text-blue-300" /> };
  if (code <= 49) return { label: "Foggy", icon: <CloudFog className="h-5 w-5 text-zinc-400" /> };
  if (code <= 69) return { label: "Rainy", icon: <CloudRain className="h-5 w-5 text-blue-400" /> };
  if (code <= 79) return { label: "Snowy", icon: <CloudSnow className="h-5 w-5 text-blue-200" /> };
  if (code <= 99) return { label: "Thunderstorm", icon: <CloudRain className="h-5 w-5 text-amber-500" /> };
  return { label: "Unknown", icon: <Cloud className="h-5 w-5 text-zinc-500" /> };
}

function windDir(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export default function WeatherPanel({
  temperature, windSpeed, windDirection, cloudCover,
  visibilityKm, humidity, weatherCode, isDay, isLoading,
}: WeatherPanelProps) {
  const weather = getWeatherLabel(weatherCode);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4 gap-3">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Weather</span>
        </div>
        <div className="flex-1 flex items-center justify-center animate-pulse">
          <div className="w-16 h-16 rounded-full bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">Weather</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isDay ? <Sun className="h-3 w-3 text-amber-400" /> : <Moon className="h-3 w-3 text-blue-300" />}
          <span className="text-[9px] font-mono text-zinc-500">{isDay ? "DAY" : "NIGHT"}</span>
        </div>
      </div>

      {/* Main weather */}
      <div className="flex items-center gap-3 bg-white/3 rounded-xl p-3 border border-white/5">
        <div className="flex-shrink-0">{weather.icon}</div>
        <div>
          <div className="text-2xl font-bold font-mono text-white">{temperature.toFixed(1)}°C</div>
          <div className="text-[10px] font-mono text-zinc-400">{weather.label}</div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="bg-white/3 rounded-lg p-2 flex items-center gap-2">
          <Wind className="h-3 w-3 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-zinc-500">WIND</div>
            <div className="text-white">{windSpeed} km/h {windDir(windDirection)}</div>
          </div>
        </div>
        <div className="bg-white/3 rounded-lg p-2 flex items-center gap-2">
          <Cloud className="h-3 w-3 text-blue-300 flex-shrink-0" />
          <div>
            <div className="text-zinc-500">CLOUDS</div>
            <div className="text-white">{cloudCover}%</div>
          </div>
        </div>
        <div className="bg-white/3 rounded-lg p-2 flex items-center gap-2">
          <Eye className="h-3 w-3 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-zinc-500">VISIBILITY</div>
            <div className="text-white">{Math.round(visibilityKm / 1000)} km</div>
          </div>
        </div>
        <div className="bg-white/3 rounded-lg p-2 flex items-center gap-2">
          <Droplets className="h-3 w-3 text-blue-400 flex-shrink-0" />
          <div>
            <div className="text-zinc-500">HUMIDITY</div>
            <div className="text-white">{humidity}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
