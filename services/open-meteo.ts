import { z } from "zod";
import { fetchJson } from "@/lib/api-client";
import { OpenMeteoResponse } from "@/types/clients";
import { memoize } from "@/server/redis";
import { logger } from "@/lib/logger";

const openMeteoSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  elevation: z.number(),
  current_weather: z.object({
    temperature: z.number(),
    windspeed: z.number(),
    winddirection: z.number(),
    weathercode: z.number(),
    is_day: z.number(),
    time: z.string(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    relativehumidity_2m: z.array(z.number()),
    cloudcover: z.array(z.number()),
    visibility: z.array(z.number()),
    weathercode: z.array(z.number()),
  }),
});

export async function getOpenMeteoWeather(latitude: number, longitude: number, timezone = "auto"): Promise<OpenMeteoResponse> {
  const cacheKey = `open-meteo-${latitude}-${longitude}-${timezone}`;
  return memoize(cacheKey, 600, async () => { // 10 minutes cache
    const query = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      hourly: "temperature_2m,relativehumidity_2m,cloudcover,visibility,weathercode",
      current_weather: "true",
      timezone,
    });
    const url = `https://api.open-meteo.com/v1/forecast?${query.toString()}`;
    
    try {
      return await fetchJson<OpenMeteoResponse>(url, {
        timeoutMs: 10_000,
        retries: 2,
        backoffMs: 300,
        schema: openMeteoSchema,
      });
    } catch (error) {
      logger.error("Failed to fetch Open-Meteo weather", { error: String(error) });
      throw error;
    }
  });
}
