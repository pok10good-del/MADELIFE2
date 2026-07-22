import type { GenerateOptions } from "@/lib/ai/ai-provider";
import { BaseAIProvider } from "@/lib/ai/base-ai-provider";

export class MockAIProvider extends BaseAIProvider {
  private readonly response: string;

  constructor(response: string) {
    super();
    this.response = response;
  }

  protected async executeGenerate(prompt: string, options?: GenerateOptions): Promise<string> {
    void prompt;
    void options;

    return this.response;
  }
}
