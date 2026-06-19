import { z, type ZodType } from "zod";

export class ApiError extends Error {
  public readonly status: number;
  public readonly url: string;
  public readonly details: unknown;

  constructor(message: string, status: number, url: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.details = details;
  }
}

export type FetchOptions<T> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: HeadersInit;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number;
  maxBackoffMs?: number;
  schema?: ZodType<T>;
};

const defaultOptions = {
  timeoutMs: 10_000,
  retries: 2,
  backoffMs: 250,
  maxBackoffMs: 2_500,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T>(input: RequestInfo, options: FetchOptions<T> = {}): Promise<T> {
  const { method = "GET", headers = {}, body, timeoutMs, retries, backoffMs, maxBackoffMs, schema } = {
    ...defaultOptions,
    ...options,
  };

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...headers,
        },
        body: body != null ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const text = await response.text();
      const contentType = response.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json") && text ? JSON.parse(text) : text;

      if (!response.ok) {
        throw new ApiError(response.statusText || "API request failed", response.status, String(input), data);
      }

      if (schema) {
        const parsed = schema.safeParse(data);
        if (!parsed.success) {
          throw new ApiError("Response validation failed", response.status, String(input), parsed.error.format());
        }
        return parsed.data;
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error instanceof Error ? error : new Error(String(error));

      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = new ApiError("Request timed out", 408, String(input));
      }

      attempt += 1;
      if (attempt > retries) {
        throw lastError;
      }

      const backoff = Math.min(backoffMs * 2 ** (attempt - 1), maxBackoffMs);
      await sleep(backoff);
    }
  }

  throw lastError ?? new Error("Unexpected fetchJson failure");
}

export const jsonResponse = <T>(body: T, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
