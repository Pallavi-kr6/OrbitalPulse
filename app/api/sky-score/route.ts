import { successResponse, fallbackResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { parseLocation } from "@/lib/route-utils";
import { getOpenMeteoWeather } from "@/services/open-meteo";
import { getSwpcKpIndex } from "@/lib/weather/noaaClient";
import { getMoonPhase } from "@/services/suncalc";
import { logger } from "@/lib/logger";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export async function GET(request: Request) {
  try {
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
        temperature: weather.current_weather.temperature,
        windSpeed: weather.current_weather.windspeed,
        windDirection: weather.current_weather.winddirection,
        humidity: weather.hourly.relativehumidity_2m[0] ?? 0,
        isDay: weather.current_weather.is_day === 1,
      };
    });

    return successResponse(payload, "hybrid");
  } catch (error) {
    logger.error("GET /api/sky-score failed", { error: String(error) });
    return fallbackResponse("Service unavailable", {
      skyScore: 5.0,
      cloudCover: 50,
      visibilityKm: 10000,
      moonIllumination: 0.5,
      kpIndex: 2,
      lightPollutionEstimate: 0.7,
      weatherCode: 0,
      temperature: 20,
      windSpeed: 10,
      windDirection: 0,
      humidity: 50,
      isDay: true,
    });
  }
}
