import type { GenerateOptions } from "@/lib/ai/ai-provider";
import { BaseAIProvider } from "@/lib/ai/base-ai-provider";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "gpt-4o";
const DEFAULT_MAX_TOKENS = 4096;
const MAX_RATE_LIMIT_RETRIES = 5;
const DEFAULT_RATE_LIMIT_WAIT_MS = 15000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractRateLimitWaitMs(errorBody: string): number | null {
  const match = errorBody.match(/try again in ([\d.]+)s/i);
  if (!match) return null;
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) ? Math.ceil(seconds * 1000) + 1000 : null;
}

interface OpenAIChatCompletionResponse {
  choices: { message?: { content?: string | null } }[];
}

interface OpenAIChatMessage {
  role: "system" | "user";
  content: string;
}

export class OpenAIProvider extends BaseAIProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  protected async executeGenerate(
    prompt: string,
    options?: GenerateOptions,
    systemPrompt?: string
  ): Promise<string> {
    const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;

    const messages: OpenAIChatMessage[] = [];
    if (systemPrompt !== undefined) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const requestBody = JSON.stringify({
      model,
      max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: options?.temperature,
      response_format:
        options?.responseFormat === "json_object" ? { type: "json_object" } : undefined,
      messages,
    });

    for (let attempt = 1; attempt <= MAX_RATE_LIMIT_RETRIES; attempt++) {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: requestBody,
      });

      if (response.ok) {
        const data = (await response.json()) as OpenAIChatCompletionResponse;
        const text = data.choices[0]?.message?.content ?? "";

        if (text.length === 0) {
          throw new Error("OpenAI API returned an empty response");
        }

        return text;
      }

      const errorBody = await response.text();
      const isLastAttempt = attempt === MAX_RATE_LIMIT_RETRIES;

      if (response.status !== 429 || isLastAttempt) {
        throw new Error(`OpenAI API request failed with status ${response.status}: ${errorBody}`);
      }

      await sleep(extractRateLimitWaitMs(errorBody) ?? DEFAULT_RATE_LIMIT_WAIT_MS);
    }

    throw new Error("unreachable");
  }
}
