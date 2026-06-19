import { getCMEs, getSolarFlares, getKPIndex } from "@/services/nasa-donki";
import { getSwpcGeomagneticStorms, getSwpcKpIndex } from "@/services/noaa-swpc";
import { jsonResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";

export async function GET() {
  const cacheKey = "space-weather-summary";
  const payload = await memoize(cacheKey, 300, async () => {
    const today = new Date();
    const endDate = today.toISOString().slice(0, 10);
    const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [flares, cmes, kpHistory, storms, swpcKp] = await Promise.all([
      getSolarFlares(startDate, endDate),
      getCMEs(startDate, endDate),
      getKPIndex(startDate, endDate).catch(() => []),
      getSwpcGeomagneticStorms().catch(() => []),
      getSwpcKpIndex().catch(() => []),
    ]);

    const latestKp = swpcKp.length ? swpcKp[swpcKp.length - 1].kp_index : kpHistory.slice(-1)[0]?.data?.slice(-1)[0]?.kp_index ?? 0;

    return {
      solarFlares: flares,
      coronalMassEjections: cmes,
      kpIndexHistory: kpHistory,
      geomagneticStorms: storms,
      latestKpIndex: latestKp,
    };
  });

  return jsonResponse(payload);
}
