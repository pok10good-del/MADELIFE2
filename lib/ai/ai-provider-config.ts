export type AIProviderType = "mock" | "claude" | "openai";

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  mockResponse?: string;
}

function isMissing(value: string | undefined): boolean {
  return value === undefined || value.trim().length === 0;
}

export function validateAIProviderConfig(config: AIProviderConfig): void {
  if (config.type === "claude" || config.type === "openai") {
    if (isMissing(config.apiKey)) {
      throw new Error(`apiKey is required for provider type "${config.type}"`);
    }
  }

  if (config.type === "mock") {
    if (isMissing(config.mockResponse)) {
      throw new Error('mockResponse is required for provider type "mock"');
    }
  }
}
