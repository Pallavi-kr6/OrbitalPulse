import { z } from "zod";
import { env } from "@/config/env";
import { fetchJson } from "@/lib/api-client";
import { N2YOAboveResponse, N2YOSatelliteDetail } from "@/types/clients";

const n2yoAboveSchema = z.object({
  info: z.object({
    category: z.number(),
    satcount: z.number(),
    satlat: z.number(),
    satlng: z.number(),
    satalt: z.number(),
    observerlat: z.number(),
    observerlng: z.number(),
    observeralt: z.number(),
    seconds: z.number(),
  }),
  above: z.array(
    z.object({
      satid: z.number(),
      satname: z.string(),
      intDesignator: z.string(),
      launchDate: z.string(),
      satlat: z.number(),
      satlng: z.number(),
      satalt: z.number(),
      satvelocity: z.number(),
    }),
  ),
});

const n2yoDetailSchema = z.object({
  satid: z.number(),
  satname: z.string(),
  intDesignator: z.string(),
  launchDate: z.string(),
  satlat: z.number(),
  satlng: z.number(),
  satalt: z.number(),
  satvelocity: z.number(),
  azimuth: z.number(),
  elevation: z.number(),
  ra: z.number(),
  dec: z.number(),
  timestamp: z.number(),
});

export async function getSatellitesAbove(
  latitude: number,
  longitude: number,
  altitudeKm = 0,
  radiusKm = 70,
  category = 0,
): Promise<N2YOAboveResponse> {
  const url = `https://api.n2yo.com/rest/v1/satellite/above/${latitude}/${longitude}/${altitudeKm}/${radiusKm}/${category}/&apiKey=${env.N2YO_API_KEY}`;
  return fetchJson<N2YOAboveResponse>(url, {
    timeoutMs: 10_000,
    retries: 2,
    backoffMs: 300,
    schema: n2yoAboveSchema,
  });
}

export async function getSatelliteDetail(satelliteId: number, latitude: number, longitude: number, altitudeKm = 0): Promise<N2YOSatelliteDetail> {
  const url = `https://api.n2yo.com/rest/v1/satellite/positions/${satelliteId}/${latitude}/${longitude}/${altitudeKm}/2/&apiKey=${env.N2YO_API_KEY}`;
  return fetchJson<N2YOSatelliteDetail>(url, {
    timeoutMs: 10_000,
    retries: 2,
    backoffMs: 300,
    schema: n2yoDetailSchema,
  });
}
