import { getISSPosition } from "@/services/open-notify";
import { getIssPasses } from "@/services/satellite-js";
import { jsonResponse } from "@/lib/api-client";
import { memoize } from "@/server/redis";

export async function GET() {
  const payload = await memoize("iss-position", 5, async () => {
    const response = await getISSPosition();
    const passes = await getIssPasses(Number(response.iss_position.latitude), Number(response.iss_position.longitude));
    return {
      timestamp: response.timestamp,
      latitude: Number(response.iss_position.latitude),
      longitude: Number(response.iss_position.longitude),
      message: response.message,
      passes,
    };
  });

  return jsonResponse(payload);
}
