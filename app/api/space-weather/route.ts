import { getCMEs, getSolarFlares, getGST } from "@/lib/weather/nasaClient";
import { getSwpcGeomagneticStorms, getSwpcKpIndex } from "@/lib/weather/noaaClient";
import { successResponse, fallbackResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { logger } from "@/lib/logger";

export async function GET() {
  const cacheKey = "space-weather-summary";
  
  try {
    const payload = await memoize(cacheKey, 21600, async () => { // 6 hours TTL
      let flares: any[] = [];
      let cmes: any[] = [];
      let kpHistory: any[] = [];
      let storms: any[] = [];
      let latestKp = 0;

      // 1. NASA DONKI (Flares, CMEs, GST)
      try {
        const [donkiFlares, donkiCmes, donkiGst] = await Promise.all([
          getSolarFlares().catch(() => []),
          getCMEs().catch(() => []),
          getGST().catch(() => []),
        ]);
        flares = donkiFlares;
        cmes = donkiCmes;
        // Donki GST is merged with NOAA Storms below if needed, or kept separate
      } catch (err) {
        logger.warn("NASA DONKI failed completely.");
      }

      // 2. NOAA SWPC (KP Index and Storms)
      try {
        const [noaaStorms, noaaKp] = await Promise.all([
          getSwpcGeomagneticStorms().catch(() => []),
          getSwpcKpIndex().catch(() => []),
        ]);
        storms = noaaStorms;
        kpHistory = noaaKp;
        
        if (noaaKp.length > 0) {
          latestKp = noaaKp[noaaKp.length - 1].kp_index;
        }
      } catch (err) {
        logger.error("NOAA SWPC failed.");
      }

      return {
        solarFlares: flares,
        coronalMassEjections: cmes,
        kpIndexHistory: kpHistory,
        geomagneticStorms: storms,
        latestKpIndex: latestKp,
      };
    });

    return successResponse(payload, "hybrid");
  } catch (error) {
    logger.error("GET /api/space-weather failed", { error: String(error) });
    return fallbackResponse("Service unavailable", {
      solarFlares: [],
      coronalMassEjections: [],
      kpIndexHistory: [],
      geomagneticStorms: [],
      latestKpIndex: 0,
    }, "system");
  }
}
