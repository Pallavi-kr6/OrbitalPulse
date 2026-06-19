import { jsonResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { parseLocation } from "@/lib/route-utils";
import { getISSPosition } from "@/services/open-notify";
import { getSatellitesAbove } from "@/services/n2yo";
import { getOpenMeteoWeather } from "@/services/open-meteo";
import { getMoonPhase, getMoonPosition, getSunriseSunset } from "@/services/suncalc";
import { getSwpcKpIndex } from "@/services/noaa-swpc";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export async function GET(request: Request) {
  const { lat, lon } = parseLocation(request);
  const cacheKey = `sky-status:${lat}:${lon}`;

  const payload = await memoize(cacheKey, 300, async () => {
    const [iss, satellites, weather, kpHistory] = await Promise.all([
      getISSPosition(),
      getSatellitesAbove(lat, lon),
      getOpenMeteoWeather(lat, lon),
      getSwpcKpIndex().catch(() => []),
    ]);

    const moonPhase = getMoonPhase(new Date());
    const moonPosition = getMoonPosition(new Date(), lat, lon);
    const solar = getSunriseSunset(new Date(), lat, lon);
    const latestKp = kpHistory.length ? kpHistory[kpHistory.length - 1].kp_index : 0;
    const cloudCover = weather.hourly.cloudcover[0];
    const visibilityScore = clamp(weather.hourly.visibility[0] / 20);
    const skyScore = Math.round(
      10 * (clamp(1 - cloudCover / 100) * 0.3 + visibilityScore * 0.2 + clamp(1 - moonPhase.illuminated) * 0.2 + 0.85 * 0.15 + clamp(1 - latestKp / 9) * 0.15),
    );

    return {
      location: { latitude: lat, longitude: lon },
      iss: {
        timestamp: iss.timestamp,
        latitude: Number(iss.iss_position.latitude),
        longitude: Number(iss.iss_position.longitude),
      },
      satellites: satellites.above.map((sat) => ({
        id: sat.satid,
        name: sat.satname,
        latitude: sat.satlat,
        longitude: sat.satlng,
        altitudeKm: sat.satalt,
      })),
      weather: {
        temperatureC: weather.current_weather.temperature,
        cloudCover: cloudCover,
        visibilityKm: weather.hourly.visibility[0],
        weatherCode: weather.current_weather.weathercode,
        observationTime: weather.current_weather.time,
      },
      moon: {
        phase: moonPhase,
        position: moonPosition,
        solarTimes: solar,
      },
      spaceWeather: {
        kpIndex: latestKp,
        cloudCover: cloudCover,
      },
      skyScore,
    };
  });

  return jsonResponse(payload);
}
