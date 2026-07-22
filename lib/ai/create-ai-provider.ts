import type { AIProvider } from "@/lib/ai/ai-provider";
import type { AIProviderConfig } from "@/lib/ai/ai-provider-config";
import { validateAIProviderConfig } from "@/lib/ai/ai-provider-config";
import { MockAIProvider } from "@/lib/ai/mock-ai-provider";
import { ClaudeAIProvider } from "@/lib/ai/claude-ai-provider";
import { OpenAIProvider } from "@/lib/ai/openai-ai-provider";

export function createAIProvider(config: AIProviderConfig): AIProvider {
  validateAIProviderConfig(config);

  switch (config.type) {
    case "mock": {
      if (config.mockResponse === undefined) {
        throw new Error('mockResponse is required for provider type "mock"');
      }
      return new MockAIProvider(config.mockResponse);
    }
    case "claude": {
      if (config.apiKey === undefined) {
        throw new Error('apiKey is required for provider type "claude"');
      }
      return new ClaudeAIProvider(config.apiKey);
    }
    case "openai": {
      if (config.apiKey === undefined) {
        throw new Error('apiKey is required for provider type "openai"');
      }
      return new OpenAIProvider(config.apiKey);
    }
    default: {
      const exhaustiveCheck: never = config.type;
      throw new Error(`Unsupported provider type: ${String(exhaustiveCheck)}`);
    }
  }
}
