export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  generate(prompt: string, options?: GenerateOptions): Promise<string>;
}
