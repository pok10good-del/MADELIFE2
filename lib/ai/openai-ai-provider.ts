import type { GenerateOptions } from "@/lib/ai/ai-provider";
import { BaseAIProvider } from "@/lib/ai/base-ai-provider";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "gpt-4o";
const DEFAULT_MAX_TOKENS = 4096;

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

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options?.temperature,
        response_format:
          options?.responseFormat === "json_object" ? { type: "json_object" } : undefined,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as OpenAIChatCompletionResponse;
    const text = data.choices[0]?.message?.content ?? "";

    if (text.length === 0) {
      throw new Error("OpenAI API returned an empty response");
    }

    return text;
  }
}
