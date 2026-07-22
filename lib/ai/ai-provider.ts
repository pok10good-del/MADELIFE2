export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json_object";
}

export interface AIProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
  generateWithSystem(systemPrompt: string, prompt: string, options?: GenerateOptions): Promise<string>;
}
