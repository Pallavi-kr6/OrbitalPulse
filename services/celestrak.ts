import { z } from "zod";
import { fetchJson } from "@/lib/api-client";
import { CelesTrakTle } from "@/types/clients";

const tleSchema = z.array(
  z.object({
    name: z.string(),
    line1: z.string(),
    line2: z.string(),
  }),
);

export async function getTleByGroup(groupName = "active"): Promise<CelesTrakTle[]> {
  const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${encodeURIComponent(groupName)}&FORMAT=tle`;
  const raw = await fetchJson<string>(url, {
    timeoutMs: 12_000,
    retries: 2,
    backoffMs: 300,
  });

  const lines = raw.trim().split(/\r?\n/);
  const records: CelesTrakTle[] = [];

  for (let i = 0; i + 2 < lines.length; i += 3) {
    if (!lines[i] || !lines[i + 1] || !lines[i + 2]) continue;
    records.push({ name: lines[i].trim(), line1: lines[i + 1].trim(), line2: lines[i + 2].trim() });
  }

  const parsed = tleSchema.safeParse(records);
  if (!parsed.success) {
    throw new Error("Invalid CelesTrak TLE payload");
  }

  return parsed.data;
}
