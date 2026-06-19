import { z, type ZodType } from "zod";
import { logger } from "./logger";

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

export class TimeoutError extends Error {
  public readonly url: string;

  constructor(message: string, url: string) {
    super(message);
    this.name = "TimeoutError";
    this.url = url;
  }
}

export class NetworkError extends Error {
  public readonly url: string;

  constructor(message: string, url: string) {
    super(message);
    this.name = "NetworkError";
    this.url = url;
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
  timeoutMs: 30_000,
  retries: 3,
  backoffMs: 500,
  maxBackoffMs: 8_000,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T>(input: RequestInfo, options: FetchOptions<T> = {}): Promise<T> {
  const urlString = typeof input === "string" ? input : input.url;
  const { method = "GET", headers = {}, body, timeoutMs, retries, backoffMs, maxBackoffMs, schema } = {
    ...defaultOptions,
    ...options,
  };

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startTime = Date.now();

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

      const latency = Date.now() - startTime;
      
      const text = await response.text();
      const contentType = response.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json") && text ? JSON.parse(text) : text;

      if (!response.ok) {
        throw new ApiError(response.statusText || "API request failed", response.status, urlString, data);
      }

      if (schema) {
        const parsed = schema.safeParse(data);
        if (!parsed.success) {
          throw new ApiError("Response validation failed", response.status, urlString, parsed.error.format());
        }
        logger.debug("API Success", { url: urlString, attempt, latency });
        return parsed.data;
      }

      logger.debug("API Success", { url: urlString, attempt, latency });
      return data as T;
    } catch (error) {
      clearTimeout(timeout);
      
      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = new TimeoutError(`Request timed out after ${timeoutMs}ms`, urlString);
      } else if (error instanceof TypeError && error.message === "fetch failed") {
        lastError = new NetworkError("Network request failed", urlString);
      } else {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      logger.warn("API Request Failed", { 
        url: urlString, 
        attempt, 
        error: lastError.message,
        name: lastError.name
      });

      attempt += 1;
      if (attempt > retries) {
        logger.error("API Max Retries Reached", { url: urlString, retries, finalError: lastError.message });
        throw lastError;
      }

      const backoff = Math.min(backoffMs * 2 ** (attempt - 1), maxBackoffMs);
      await sleep(backoff);
    }
  }

  throw lastError ?? new Error("Unexpected fetchJson failure");
}

export const jsonResponse = <T>(body: T, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const fallbackResponse = <T>(message: string, data: T | null = null, source = "system", status = 200) => {
  return new Response(JSON.stringify({ success: false, source, fallback: true, message, data, error: message }), { status, headers: { "Content-Type": "application/json" } });
};

export const successResponse = <T>(data: T, source = "system", status = 200) => {
  return new Response(JSON.stringify({ success: true, source, fallback: false, message: "OK", data }), { status, headers: { "Content-Type": "application/json" } });
};
