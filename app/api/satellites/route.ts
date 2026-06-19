import { getSatellitesAbove } from "@/services/n2yo";
import { jsonResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { parseLocation } from "@/lib/route-utils";

export async function GET(request: Request) {
  const { lat, lon } = parseLocation(request);
  const cacheKey = `satellites:${lat}:${lon}`;

  const result = await memoize(cacheKey, 60, async () => {
    const response = await getSatellitesAbove(lat, lon);
    return response.above.map((sat) => ({
      id: sat.satid,
      name: sat.satname,
      latitude: sat.satlat,
      longitude: sat.satlng,
      altitudeKm: sat.satalt,
      velocityKmh: sat.satvelocity,
    }));
  });

  return jsonResponse({ satellites: result });
}
