import { jsonResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";
import { parseLocation } from "@/lib/route-utils";
import { getMoonPhase, getMoonPosition, getSunriseSunset } from "@/services/suncalc";
import { getMoonEquatorialCoordinates, getRiseSet, getPlanetPositions } from "@/services/astronomy-engine";
import { Body } from "astronomy-engine";

export async function GET(request: Request) {
  const { lat, lon } = parseLocation(request);
  const cacheKey = `moon-data:${lat}:${lon}`;

  const data = await memoize(cacheKey, 43200, async () => {
    const now = new Date();
    const moonPhase = getMoonPhase(now);
    const moonPosition = getMoonPosition(now, lat, lon);
    const solarEvents = getSunriseSunset(now, lat, lon);
    const equatorial = getMoonEquatorialCoordinates(now, lat, lon);
    const planetaryPositions = getPlanetPositions(now, lat, lon);
    const moonRiseSet = getRiseSet(Body.Moon, now, lat, lon);

    return {
      moonPhase,
      moonPosition,
      moonEquatorial: equatorial,
      sunriseSunset: solarEvents,
      moonRiseSet,
      planetaryPositions,
    };
  });

  return jsonResponse(data);
}
