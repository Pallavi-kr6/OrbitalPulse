import { z } from "zod";
import { fetchJson } from "@/lib/api-client";
import { SwpcGeomagneticStorm, SwpcKpIndex } from "@/types/clients";
import { memoize } from "@/server/redis";
import { logger } from "@/lib/logger";

const kpSchema = z.array(z.object({ time_tag: z.string(), kp_index: z.number() }));
const stormSchema = z.array(
  z.object({
    bk_p: z.number().optional(),
    storm_strength: z.string(),
    start_time: z.string(),
    peak_time: z.string(),
    end_time: z.string(),
    link: z.string().url().optional(),
  }),
);

export async function getSwpcKpIndex(): Promise<SwpcKpIndex> {
  const cacheKey = "noaa-swpc-kp-index";
  return memoize(cacheKey, 600, async () => { // 10 minutes cache
    const url = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json";
    try {
      return await fetchJson<SwpcKpIndex>(url, {
        timeoutMs: 15_000,
        retries: 3,
        backoffMs: 1_000,
        schema: kpSchema,
      });
    } catch (error) {
      logger.error("Failed to fetch KP Index from NOAA", { error: String(error) });
      throw error;
    }
  });
}

export async function getSwpcGeomagneticStorms(): Promise<SwpcGeomagneticStorm> {
  const cacheKey = "noaa-swpc-geomagnetic-storms";
  return memoize(cacheKey, 600, async () => { // 10 minutes cache
    const url = "https://services.swpc.noaa.gov/json/geomagnetic-storms.json";
    try {
      return await fetchJson<SwpcGeomagneticStorm>(url, {
        timeoutMs: 15_000,
        retries: 3,
        backoffMs: 1_000,
        schema: stormSchema,
      });
    } catch (error) {
      logger.error("Failed to fetch Geomagnetic Storms from NOAA", { error: String(error) });
      throw error;
    }
  });
}
