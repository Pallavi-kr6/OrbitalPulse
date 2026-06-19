import { jsonResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { parseLocation } from "@/lib/route-utils";
import { getISSPosition } from "@/services/open-notify";
import { getSatellitesAbove } from "@/services/n2yo";
import { getOpenMeteoWeather } from "@/services/open-meteo";
import { getMoonPhase } from "@/services/suncalc";
import { getSwpcKpIndex } from "@/services/noaa-swpc";
import { requestGroqNarration } from "@/services/groq";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export async function GET(request: Request) {
  const { lat, lon } = parseLocation(request);
  const cacheKey = `ai-narration:${lat}:${lon}`;

  const narration = await memoize(cacheKey, 900, async () => {
    const [iss, satellites, weather, kpHistory] = await Promise.all([
      getISSPosition(),
      getSatellitesAbove(lat, lon),
      getOpenMeteoWeather(lat, lon),
      getSwpcKpIndex().catch(() => []),
    ]);

    const moon = getMoonPhase(new Date());
    const latestKp = kpHistory.length ? kpHistory[kpHistory.length - 1].kp_index : 0;
    const score = Math.round(
      10 * (clamp(1 - weather.hourly.cloudcover[0] / 100) * 0.3 + clamp(weather.hourly.visibility[0] / 20) * 0.2 + clamp(1 - moon.illuminated) * 0.2 + 0.85 * 0.15 + clamp(1 - latestKp / 9) * 0.15),
    );

    const payload = {
      satellitesAbove: satellites.above.slice(0, 4).map((sat) => sat.satname),
      issPosition: {
        latitude: iss.iss_position.latitude,
        longitude: iss.iss_position.longitude,
      },
      solarActivityScore: score,
      kpIndex: latestKp,
      moonPhase: moon.phaseName,
      illumination: Math.round(moon.illuminated * 100),
      cloudCover: weather.hourly.cloudcover[0],
      visibility: weather.hourly.visibility[0],
    };

    return requestGroqNarration({
      ...payload,
      systemPrompt: "You are an expert astronomy guide. Explain current sky conditions for the user's location. Use plain language. Maximum 3 sentences. Tell the user: what is visible when to look where to look Provide concise actionable advice.",
    });
  });

  return jsonResponse(narration);
}
