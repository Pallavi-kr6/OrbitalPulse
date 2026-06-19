import { successResponse, fallbackResponse } from "@/lib/api-client";
import { getISSTle } from "@/lib/satellites/issTracker";
import { getSolarFlares } from "@/lib/weather/nasaClient";
import { getSwpcKpIndex } from "@/lib/weather/noaaClient";
import { getSatellitesAbove } from "@/services/n2yo";
import { requestGroqNarration } from "@/lib/ai/groqClient";
import { getCache, setCache } from "@/server/redis";
import { logger } from "@/lib/logger";

export async function GET() {
  const status: Record<string, boolean> = {
    nasa: false,
    noaa: false,
    celestrak: false,
    n2yo: false,
    groq: false,
    redis: false,
  };

  try {
    // Check Redis
    await setCache("health-ping", "ok", 10);
    const redisCheck = await getCache("health-ping");
    status.redis = redisCheck === "ok";
  } catch {
    status.redis = false;
  }

  // Parallel health checks for external APIs
  await Promise.allSettled([
    getSolarFlares().then(() => { status.nasa = true; }).catch(() => { status.nasa = false; }),
    getSwpcKpIndex().then(() => { status.noaa = true; }).catch(() => { status.noaa = false; }),
    getISSTle().then(() => { status.celestrak = true; }).catch(() => { status.celestrak = false; }),
    getSatellitesAbove(0, 0).then(() => { status.n2yo = true; }).catch(() => { status.n2yo = false; }),
    requestGroqNarration({ test: true }, "Test ping").then(() => { status.groq = true; }).catch(() => { status.groq = false; })
  ]);

  const allHealthy = Object.values(status).every((v) => v === true);

  if (allHealthy) {
    logger.info("Health check passed", { status });
    return successResponse({ status: "healthy", ...status });
  } else {
    logger.warn("Health check degraded", { status });
    return fallbackResponse("Degraded state", { status: "degraded", ...status });
  }
}
