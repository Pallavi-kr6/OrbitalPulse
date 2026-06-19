import { env } from "@/config/env";
import { fetchJson } from "@/lib/api-client";
import { GroqAiNarrationResponse } from "@/types/clients";
import { logger } from "@/lib/logger";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function requestGroqNarration(payload: Record<string, unknown>, systemPrompt: string): Promise<GroqAiNarrationResponse> {
  try {
    const response = await fetchJson<any>(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Here is the current telemetry data: ${JSON.stringify(payload)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
        response_format: { type: "json_object" }
      },
      timeoutMs: 15_000,
      retries: 3,
      backoffMs: 1_000,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from Groq");
    }

    // Try to parse it since we asked for json_object
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || "The sky is calm and visible.",
      visibility: parsed.visibility || "Clear",
      bestTime: parsed.bestTime || "Now",
      direction: parsed.direction || "Up",
    };
  } catch (error) {
    logger.warn("Groq narration failed, returning fallback", { error: String(error) });
    return {
      summary: "The sky is currently calm with moderate visibility conditions.",
      visibility: "Clear skies with limited light pollution.",
      bestTime: "Within the next hour is the best chance to observe bright objects.",
      direction: "Look toward the southern horizon for satellites and brighter planets.",
    };
  }
}
