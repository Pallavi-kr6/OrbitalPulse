import { getSatellitesAbove } from "@/services/n2yo";
import { successResponse, fallbackResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { parseLocation } from "@/lib/route-utils";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const { lat, lon } = parseLocation(request);
    const cacheKey = `satellites:${lat}:${lon}`;

    const result = await memoize(cacheKey, 86400, async () => { // 24 hours TTL
      const response = await getSatellitesAbove(lat, lon);
      return response?.above?.map((sat) => ({
        id: sat.satid,
        name: sat.satname,
        latitude: sat.satlat,
        longitude: sat.satlng,
        altitudeKm: sat.satalt,
        velocityKmh: sat.satvelocity,
      })) || [];
    });

    return successResponse({ satellites: result }, "n2yo");
  } catch (error) {
    logger.error("GET /api/satellites failed", { error: String(error) });
    return fallbackResponse("Service unavailable", { satellites: [] }, "system");
  }
}
