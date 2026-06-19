import { jsonResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { parseLocation } from "@/lib/route-utils";
import { getOpenMeteoWeather } from "@/services/open-meteo";
import { getSwpcKpIndex } from "@/services/noaa-swpc";
import { getMoonPhase } from "@/services/suncalc";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export async function GET(request: Request) {
  const { lat, lon } = parseLocation(request);
  const cacheKey = `sky-score:${lat}:${lon}`;
  const payload = await memoize(cacheKey, 300, async () => {
    const weather = await getOpenMeteoWeather(lat, lon);
    const moon = getMoonPhase(new Date());
    const kpHistory = await getSwpcKpIndex().catch(() => []);
    const latestKp = kpHistory.length ? kpHistory[kpHistory.length - 1].kp_index : 0;

    const cloudScore = clamp(1 - weather.hourly.cloudcover[0] / 100);
    const visibilityScore = clamp(weather.hourly.visibility[0] / 20);
    const moonScore = clamp(1 - moon.illuminated);
    const pollutionScore = 0.7;
    const kpScore = clamp(1 - latestKp / 9);

    const skyScore = Math.round(
      (10 * (cloudScore * 0.3 + visibilityScore * 0.2 + moonScore * 0.2 + (1 - pollutionScore) * 0.15 + kpScore * 0.15)) * 10,
    ) / 10;

    return {
      skyScore,
      cloudCover: weather.hourly.cloudcover[0],
      visibilityKm: weather.hourly.visibility[0],
      moonIllumination: moon.illuminated,
      kpIndex: latestKp,
      lightPollutionEstimate: pollutionScore,
      weatherCode: weather.current_weather.weathercode,
    };
  });

  return jsonResponse(payload);
}
