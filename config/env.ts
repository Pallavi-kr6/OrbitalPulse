import { z } from "zod";

export const envSchema = z.object({
  N2YO_API_KEY: z.string().min(1, "N2YO_API_KEY is required"),
  NASA_API_KEY: z.string().min(1, "NASA_API_KEY is required"),
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  REDIS_URL: z.string().url().optional(),
  REDIS_TOKEN: z.string().optional(),
  NEXT_PUBLIC_CESIUM_BASE_URL: z.string().default("/cesium"),
});

export const env = envSchema.parse({
  N2YO_API_KEY: process.env.N2YO_API_KEY ?? "",
  NASA_API_KEY: process.env.NASA_API_KEY ?? "",
  GROQ_API_KEY: process.env.GROQ_API_KEY ?? "",
  REDIS_URL: process.env.REDIS_URL?.trim() ? process.env.REDIS_URL : undefined,
  REDIS_TOKEN: process.env.REDIS_TOKEN?.trim() ? process.env.REDIS_TOKEN : undefined,
  NEXT_PUBLIC_CESIUM_BASE_URL: process.env.NEXT_PUBLIC_CESIUM_BASE_URL,
});
