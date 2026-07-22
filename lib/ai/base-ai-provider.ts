import type { AIProvider, GenerateOptions } from "@/lib/ai/ai-provider";

export abstract class BaseAIProvider implements AIProvider {
  protected validatePrompt(prompt: string): void {
    if (prompt.trim().length === 0) {
      throw new Error("prompt must not be empty");
    }
  }

  protected abstract executeGenerate(
    prompt: string,
    options?: GenerateOptions,
    systemPrompt?: string
  ): Promise<string>;

  async generate(prompt: string, options?: GenerateOptions): Promise<string> {
    this.validatePrompt(prompt);
    return this.executeGenerate(prompt, options);
  }

  async generateWithSystem(
    systemPrompt: string,
    prompt: string,
    options?: GenerateOptions
  ): Promise<string> {
    if (systemPrompt.trim().length === 0) {
      throw new Error("systemPrompt must not be empty");
    }
    this.validatePrompt(prompt);
    return this.executeGenerate(prompt, options, systemPrompt);
  }
}
