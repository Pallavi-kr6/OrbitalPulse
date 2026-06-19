import { successResponse, fallbackResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { parseLocation } from "@/lib/route-utils";
import { getISSPosition } from "@/lib/satellites/issTracker";
import { getSatellitesAbove } from "@/services/n2yo";
import { getOpenMeteoWeather } from "@/services/open-meteo";
import { getMoonPhase } from "@/services/suncalc";
import { getSwpcKpIndex } from "@/lib/weather/noaaClient";
import { requestGroqNarration } from "@/lib/ai/groqClient";
import { logger } from "@/lib/logger";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export async function GET(request: Request) {
  try {
    const { lat, lon } = parseLocation(request);
    const cacheKey = `ai-narration:${lat}:${lon}`;

    const narration = await memoize(cacheKey, 300, async () => {
      const [iss, satellites, weather, kpHistory] = await Promise.all([
        getISSPosition().catch(() => ({ latitude: 0, longitude: 0 })),
        getSatellitesAbove(lat, lon).catch(() => ({ above: [] })),
        getOpenMeteoWeather(lat, lon),
        getSwpcKpIndex().catch(() => []),
      ]);

      const moon = getMoonPhase(new Date());
      const latestKp = kpHistory.length ? kpHistory[kpHistory.length - 1].kp_index : 0;
      const score = Math.round(
        10 * (clamp(1 - weather.hourly.cloudcover[0] / 100) * 0.3 + clamp(weather.hourly.visibility[0] / 20) * 0.2 + clamp(1 - moon.illuminated) * 0.2 + 0.85 * 0.15 + clamp(1 - latestKp / 9) * 0.15),
      );

      const payload = {
        satellitesAbove: satellites?.above?.slice(0, 4).map((sat) => sat.satname) || [],
        issPosition: {
          latitude: String(iss.latitude),
          longitude: String(iss.longitude),
        },
        solarActivityScore: score,
        kpIndex: latestKp,
        moonPhase: moon.phaseName,
        illumination: Math.round(moon.illuminated * 100),
        cloudCover: weather.hourly.cloudcover[0],
        visibility: weather.hourly.visibility[0],
      };

      const systemPrompt = `You are an expert astronomy guide. Explain current sky conditions for the user's location. Output ONLY valid JSON matching this schema: { "summary": "string", "visibility": "string", "bestTime": "string", "direction": "string" }`;
      return requestGroqNarration(payload, systemPrompt);
    });

    return successResponse(narration, "groq");
  } catch (error) {
    logger.error("GET /api/ai-narrator failed", { error: String(error) });
    return fallbackResponse("AI Narration service unavailable", {
      summary: "The sky is currently calm with moderate visibility conditions.",
      visibility: "Clear skies with limited light pollution.",
      bestTime: "Within the next hour is the best chance to observe bright objects.",
      direction: "Look toward the southern horizon for satellites and brighter planets.",
    }, "system");
  }
}
