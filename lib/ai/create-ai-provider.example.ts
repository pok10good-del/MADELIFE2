import type { AIProvider } from "@/lib/ai/ai-provider";
import { createAIProvider } from "@/lib/ai/create-ai-provider";
import { VALID_STORY_RESPONSE } from "@/lib/ai/story-generation.mock";

export function createMockProviderExample(): AIProvider {
  return createAIProvider({
    type: "mock",
    mockResponse: VALID_STORY_RESPONSE,
  });
}

export function createClaudeProviderExample(): AIProvider {
  return createAIProvider({
    type: "claude",
    apiKey: "test-api-key",
  });
}

export function createOpenAIProviderExample(): AIProvider {
  return createAIProvider({
    type: "openai",
    apiKey: "test-api-key",
  });
}
