import { z } from "zod";
import { fetchJson } from "@/lib/api-client";
import { OpenNotifyISSPosition, OpenNotifyPeople } from "@/types/clients";

const issSchema = z.object({
  timestamp: z.number(),
  iss_position: z.object({
    latitude: z.string(),
    longitude: z.string(),
  }),
  message: z.string(),
});

const peopleSchema = z.object({
  message: z.string(),
  number: z.number(),
  people: z.array(z.object({ craft: z.string(), name: z.string() })),
});

export async function getISSPosition(): Promise<OpenNotifyISSPosition> {
  return fetchJson<OpenNotifyISSPosition>("https://api.open-notify.org/iss-now.json", {
    timeoutMs: 8_000,
    retries: 2,
    backoffMs: 200,
    schema: issSchema,
  });
}

export async function getPeopleInSpace(): Promise<OpenNotifyPeople> {
  return fetchJson<OpenNotifyPeople>("https://api.open-notify.org/astros.json", {
    timeoutMs: 8_000,
    retries: 2,
    backoffMs: 200,
    schema: peopleSchema,
  });
}
