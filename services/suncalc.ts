import SunCalc from "suncalc";
import { MoonPhase, MoonPosition, SunriseSunset } from "@/types/astronomy";

const phaseNames = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
];

export function getMoonPhase(date = new Date()): MoonPhase {
  const illumination = SunCalc.getMoonIllumination(date);
  const phaseIndex = Math.round(illumination.phase * 7) % 8;

  return {
    fraction: illumination.fraction,
    illuminated: illumination.fraction,
    phase: illumination.phase,
    phaseName: phaseNames[phaseIndex],
  };
}

export function getMoonPosition(date: Date, latitude: number, longitude: number): MoonPosition {
  const position = SunCalc.getMoonPosition(date, latitude, longitude);
  return {
    azimuth: position.azimuth,
    altitude: position.altitude,
    distanceKm: position.distance,
    parallacticAngle: position.parallacticAngle,
    ra: position.ra,
    dec: position.dec,
    altitudeDegrees: (position.altitude * 180) / Math.PI,
    azimuthDegrees: (position.azimuth * 180) / Math.PI,
  };
}

export function getSunriseSunset(date: Date, latitude: number, longitude: number): SunriseSunset {
  const times = SunCalc.getTimes(date, latitude, longitude);
  return {
    dawn: times.dawn.toISOString(),
    sunrise: times.sunrise.toISOString(),
    solarNoon: times.solarNoon.toISOString(),
    sunset: times.sunset.toISOString(),
    dusk: times.dusk.toISOString(),
    goldenHourMorning: times.goldenHourEnd.toISOString(),
    goldenHourEvening: times.goldenHour.toISOString(),
    blueHourMorning: times.nauticalDawn.toISOString(),
    blueHourEvening: times.nauticalDusk.toISOString(),
  };
}
