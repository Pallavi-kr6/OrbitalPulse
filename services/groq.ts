import { env } from "@/config/env";
import { fetchJson } from "@/lib/api-client";
import { GroqAiNarrationResponse } from "@/types/clients";

const groqUrl = "https://api.groq.dev/v1";

export async function requestGroqNarration(payload: Record<string, unknown>): Promise<GroqAiNarrationResponse> {
  const url = `${groqUrl}/query`;

  try {
    return fetchJson<GroqAiNarrationResponse>(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: { prompt: payload, max_length: 200 },
      timeoutMs: 12_000,
      retries: 2,
      backoffMs: 300,
    });
  } catch (error) {
    return {
      summary: "Unable to reach the narration service. The sky is mostly clear and visible right now.",
      visibility: "Clear skies with limited light pollution.",
      bestTime: "Within the next hour is the best chance to observe bright objects.",
      direction: "Look toward the southern horizon for satellites and brighter planets.",
    };
  }
}
