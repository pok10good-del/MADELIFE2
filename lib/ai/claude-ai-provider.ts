import type { GenerateOptions } from "@/lib/ai/ai-provider";
import { BaseAIProvider } from "@/lib/ai/base-ai-provider";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_VERSION = "2023-06-01";
const CLAUDE_MODEL = "claude-sonnet-5";
const DEFAULT_MAX_TOKENS = 4096;

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeMessagesResponse {
  content: ClaudeContentBlock[];
}

export class ClaudeAIProvider extends BaseAIProvider {
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
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": CLAUDE_API_VERSION,
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options?.temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = (await response.json()) as ClaudeMessagesResponse;
    const text = data.content
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text)
      .join("");

    if (text.length === 0) {
      throw new Error("Claude API returned an empty response");
    }

    return text;
  }
}
