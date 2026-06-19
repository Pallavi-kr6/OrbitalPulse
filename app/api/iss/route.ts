import { getISSPosition, getNextISSPass } from "@/lib/satellites/issTracker";
import { successResponse, fallbackResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const payload = await memoize("iss-position", 60, async () => {
      const position = await getISSPosition();
      const passes = await getNextISSPass(position.latitude, position.longitude, position.altitude);
      
      return {
        timestamp: position.timestamp,
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: position.altitude,
        passes,
      };
    });

    return successResponse(payload, "celestrak");
  } catch (error) {
    logger.error("GET /api/iss failed", { error: String(error) });
    return fallbackResponse("Service unavailable", null, "system");
  }
}
