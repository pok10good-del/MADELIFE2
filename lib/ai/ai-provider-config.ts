export type AIProviderType = "mock" | "claude" | "openai";

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  mockResponse?: string | string[];
}

function isMissing(value: string | undefined): boolean {
  return value === undefined || value.trim().length === 0;
}

function isMissingMockResponse(value: string | string[] | undefined): boolean {
  if (value === undefined) {
    return true;
  }
  return Array.isArray(value) ? value.length === 0 : value.trim().length === 0;
}

export function validateAIProviderConfig(config: AIProviderConfig): void {
  if (config.type === "claude" || config.type === "openai") {
    if (isMissing(config.apiKey)) {
      throw new Error(`apiKey is required for provider type "${config.type}"`);
    }
  }

  if (config.type === "mock") {
    if (isMissingMockResponse(config.mockResponse)) {
      throw new Error('mockResponse is required for provider type "mock"');
    }
  }
}
