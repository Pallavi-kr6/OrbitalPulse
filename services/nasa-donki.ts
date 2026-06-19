import { z } from "zod";
import { env } from "@/config/env";
import { fetchJson } from "@/lib/api-client";
import { NasaDonkiCME, NasaDonkiFlare, NasaDonkiKP } from "@/types/clients";

const flareSchema = z.array(
  z.object({
    flrID: z.string(),
    beginTime: z.string(),
    peakTime: z.string(),
    endTime: z.string(),
    classType: z.string(),
    sourceLocation: z.string().optional(),
    activeRegionNum: z.number().optional(),
    link: z.string().url().optional(),
  }),
);

const cmeSchema = z.array(
  z.object({
    activityID: z.string(),
    startTime: z.string(),
    mostAccurateTime: z.string().optional(),
    note: z.string().optional(),
    catalog: z.string().optional(),
    link: z.string().url().optional(),
  }),
);

const kpSchema = z.array(
  z.object({
    source: z.string(),
    link: z.string().url().optional(),
    data: z.array(
      z.object({
        time_tag: z.string(),
        kp_index: z.number(),
      }),
    ),
  }),
);

export async function getSolarFlares(startDate: string, endDate: string): Promise<NasaDonkiFlare[]> {
  const url = `https://api.nasa.gov/DONKI/FLR?startDate=${startDate}&endDate=${endDate}&api_key=${env.NASA_API_KEY}`;
  return fetchJson<NasaDonkiFlare[]>(url, {
    timeoutMs: 12_000,
    retries: 2,
    backoffMs: 300,
    schema: flareSchema,
  });
}

export async function getCMEs(startDate: string, endDate: string): Promise<NasaDonkiCME[]> {
  const url = `https://api.nasa.gov/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${env.NASA_API_KEY}`;
  return fetchJson<NasaDonkiCME[]>(url, {
    timeoutMs: 12_000,
    retries: 2,
    backoffMs: 300,
    schema: cmeSchema,
  });
}

export async function getKPIndex(startDate: string, endDate: string): Promise<NasaDonkiKP[]> {
  const url = `https://api.nasa.gov/DONKI/KP?startDate=${startDate}&endDate=${endDate}&api_key=${env.NASA_API_KEY}`;
  return fetchJson<NasaDonkiKP[]>(url, {
    timeoutMs: 12_000,
    retries: 2,
    backoffMs: 300,
    schema: kpSchema,
  });
}
