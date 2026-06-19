import { z } from "zod";
import { env } from "@/config/env";
import { fetchJson } from "@/lib/api-client";
import { N2YOAboveResponse, N2YOSatelliteDetail } from "@/types/clients";
import { memoize } from "@/server/redis";
import { logger } from "@/lib/logger";

// Relaxed schema to allow unexpected values or missing fields to pass validation gracefully
const n2yoAboveSchema = z.object({
  info: z.object({
   category: z.union([
  z.number(),
  z.string().transform(Number),
]).optional(),
    satcount: z.number().optional(),
    satlat: z.number().optional(),
    satlng: z.number().optional(),
    satalt: z.number().optional(),
    observerlat: z.number().optional(),
    observerlng: z.number().optional(),
    observeralt: z.number().optional(),
    seconds: z.number().optional(),
  }).passthrough(),
  above: z.array(
    z.object({
      satid: z.number(),
      satname: z.string(),
      intDesignator: z.string().optional(),
      launchDate: z.string().optional(),
      satlat: z.number(),
      satlng: z.number(),
      satalt: z.number(),
      satvelocity: z.number().optional(),
    }).passthrough()
  ).optional().default([]),
}).passthrough();

export async function getSatellitesAbove(
  latitude: number,
  longitude: number,
  altitudeKm = 0,
  radiusKm = 70,
  category = 0,
): Promise<N2YOAboveResponse> {
  const cacheKey = `n2yo-above-${latitude}-${longitude}-${altitudeKm}-${radiusKm}-${category}`;
  
  return memoize(cacheKey, 300, async () => { // 5 minutes cache
    const url = `https://api.n2yo.com/rest/v1/satellite/above/${latitude}/${longitude}/${altitudeKm}/${radiusKm}/${category}/&apiKey=${env.N2YO_API_KEY}`;
    
    try {
      const rawData = await fetchJson<unknown>(url, {
        timeoutMs: 15_000,
        retries: 3,
        backoffMs: 1_000,
      });

      const parsed = n2yoAboveSchema.safeParse(rawData);
      if (!parsed.success) {
        logger.warn("N2YO schema mismatch", { error: parsed.error.format() });
        return {
          info: { category, satcount: 0, satlat: latitude, satlng: longitude, satalt: altitudeKm, observerlat: latitude, observerlng: longitude, observeralt: altitudeKm, seconds: 0 },
          above: []
        };
      }

      return parsed.data as unknown as N2YOAboveResponse;
    } catch (error) {
      logger.warn("N2YO API failed", { error: String(error) });
      return {
        info: { category, satcount: 0, satlat: latitude, satlng: longitude, satalt: altitudeKm, observerlat: latitude, observerlng: longitude, observeralt: altitudeKm, seconds: 0 },
        above: []
      };
    }
  });
}
