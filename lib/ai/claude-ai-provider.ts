import type { GenerateOptions } from "@/lib/ai/ai-provider";
import { BaseAIProvider } from "@/lib/ai/base-ai-provider";

export class ClaudeAIProvider extends BaseAIProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  protected async executeGenerate(prompt: string, options?: GenerateOptions): Promise<string> {
    void this.apiKey;
    void prompt;
    void options;

    throw new Error("Claude provider is not implemented.");
  }
}
