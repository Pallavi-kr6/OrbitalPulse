import { useCallback, useRef } from 'react';
import { useNarration } from '@/lib/hooks/useNarration';

export function useMissionNarration() {
  const narrator = useNarration();
  const lastSpokenSatRef = useRef<string | null>(null);

  const playIntroSequence = useCallback(() => {
    narrator.speakOnce("globe_intro_1", "Welcome to Orbital Pulse Mission Control.");
    narrator.pause(1500);
    narrator.speakOnce("globe_intro_2", "You are currently viewing Earth from orbit. Every moving point around the globe represents a real object being tracked in space at this moment.");
    narrator.pause(1500);
    narrator.speakOnce("globe_intro_3", "Our network is monitoring thousands of satellites, scientific missions, and pieces of orbital debris traveling around the planet.");
    narrator.pause(1500);
    narrator.speakOnce("globe_intro_4", "Different orbital regions serve different purposes. Low Earth orbit hosts spacecraft such as the International Space Station, while higher orbits support navigation, communications, and Earth observation systems.");
    narrator.pause(1500);
    narrator.speakOnce("globe_intro_5", "The telemetry panel provides live space weather and solar activity data, while the satellite panels display active objects currently visible within the simulation.");
    narrator.pause(1500);
    narrator.speakOnce("globe_intro_6", "Rotate the globe to explore Earth's orbital environment. Select any satellite to learn its mission, altitude, speed, and purpose.");
  }, [narrator]);

  const narrateSpaceWeather = useCallback((kpIndex: number) => {
    if (kpIndex >= 5) {
      narrator.speakOnce("globe_weather_high", "Elevated geomagnetic activity detected. Solar disturbances may affect satellite operations and navigation systems.");
    } else {
      narrator.speakOnce("globe_weather_low", "Space weather conditions are currently stable with minimal impact on orbital operations.");
    }
  }, [narrator]);

  const narrateSatellite = useCallback((satellite: { name: string; alt: number; lat?: number; lon?: number }) => {
    if (!satellite || lastSpokenSatRef.current === satellite.name) return;
    lastSpokenSatRef.current = satellite.name;

    const nameUpper = satellite.name.toUpperCase();
    
    if (nameUpper.includes("ISS") || nameUpper.includes("ZARYA")) {
      narrator.speakPriority("This is the International Space Station, a permanently inhabited laboratory orbiting Earth approximately every ninety minutes.");
      return;
    }
    if (nameUpper.includes("STARLINK")) {
      narrator.speakPriority("This satellite is part of the Starlink constellation, a global communications network providing internet connectivity across the world.");
      return;
    }
    if (nameUpper.includes("GPS") || nameUpper.includes("NAVSTAR")) {
      narrator.speakPriority("This satellite contributes to the Global Positioning System used for navigation and precise timing worldwide.");
      return;
    }
    if (nameUpper.includes("HST") || nameUpper.includes("HUBBLE")) {
      narrator.speakPriority("This is the Hubble Space Telescope, one of humanity's most important scientific observatories.");
      return;
    }

    // Generic fallback
    const orbitType = satellite.alt < 2000 ? "Low Earth orbit" : satellite.alt < 35786 ? "Medium Earth orbit" : "Geosynchronous orbit";
    const missionCategory = satellite.alt < 2000 ? "Earth observation and communications" : "navigation and relay operations";
    
    narrator.speakPriority(`This is ${satellite.name}. It operates in ${orbitType} at an altitude of approximately ${Math.round(satellite.alt)} kilometers, supporting ${missionCategory}.`);
    
  }, [narrator]);

  return {
    playIntroSequence,
    narrateSpaceWeather,
    narrateSatellite,
  };
}
