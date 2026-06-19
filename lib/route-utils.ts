import { z } from "zod";

export const locationSchema = z.object({
  lat: z.coerce.number().min(-90, "Latitude must be between -90 and 90"),
  lon: z.coerce.number().min(-180, "Longitude must be between -180 and 180"),
});

export function parseLocation(request: Request) {
  const url = new URL(request.url);
  return locationSchema.parse({ lat: url.searchParams.get("lat"), lon: url.searchParams.get("lon") });
}

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(200).optional(),
  offset: z.coerce.number().min(0).optional(),
});
