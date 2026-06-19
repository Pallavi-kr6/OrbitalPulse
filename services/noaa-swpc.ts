import { z } from "zod";
import { fetchJson } from "@/lib/api-client";
import { SwpcGeomagneticStorm, SwpcKpIndex } from "@/types/clients";

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
  const url = "https://services.swpc.noaa.gov/json/planetary_k_index_1m.json";
  return fetchJson<SwpcKpIndex>(url, {
    timeoutMs: 10_000,
    retries: 2,
    backoffMs: 300,
    schema: kpSchema,
  });
}

export async function getSwpcGeomagneticStorms(): Promise<SwpcGeomagneticStorm> {
  const url = "https://services.swpc.noaa.gov/json/geomagnetic-storms.json";
  return fetchJson<SwpcGeomagneticStorm>(url, {
    timeoutMs: 10_000,
    retries: 2,
    backoffMs: 300,
    schema: stormSchema,
  });
}
