import type { GenerateOptions } from "@/lib/ai/ai-provider";
import { BaseAIProvider } from "@/lib/ai/base-ai-provider";

export class MockAIProvider extends BaseAIProvider {
  private readonly responses: string[];
  private readonly fixedResponse: string | undefined;
  private callIndex = 0;

  constructor(response: string | string[]) {
    super();
    if (Array.isArray(response)) {
      this.responses = response;
      this.fixedResponse = undefined;
    } else {
      this.responses = [];
      this.fixedResponse = response;
    }
  }

  protected async executeGenerate(
    prompt: string,
    options?: GenerateOptions,
    systemPrompt?: string
  ): Promise<string> {
    void prompt;
    void options;
    void systemPrompt;

    if (this.fixedResponse !== undefined) {
      return this.fixedResponse;
    }

    if (this.callIndex >= this.responses.length) {
      throw new Error(
        `MockAIProvider has no queued response for call #${this.callIndex + 1}; only ${this.responses.length} were provided`
      );
    }

    const next = this.responses[this.callIndex];
    this.callIndex += 1;
    return next;
  }
}
