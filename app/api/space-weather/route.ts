import { getSpaceWeather } from "@/services/space-weather";
import { successResponse, fallbackResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { logger } from "@/lib/logger";

export async function GET() {
  const cacheKey = "space-weather-summary-v2";
  
  try {
    const payload = await memoize(cacheKey, 60, async () => { // 60s TTL
      return await getSpaceWeather();
    });

    return successResponse(payload, "hybrid");
  } catch (error) {
    logger.error("GET /api/space-weather failed", { error: String(error) });
    return fallbackResponse("Service unavailable", {
      flareClass: null,
      flareTime: null,
      cmeDetected: false,
      cmeTime: null,
      kpIndex: 0,
      auroraLevel: "Unknown",
      severityScore: 0,
      scoreLevel: "LOW",
      recentFlares: [],
      recentCMEs: [],
      recentKp: []
    }, "system");
  }
}
