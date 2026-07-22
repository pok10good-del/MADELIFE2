import { createAIProvider } from "@/lib/ai/create-ai-provider";

export function createInvalidMockProviderExample(): Error {
  try {
    createAIProvider({
      type: "mock",
    });
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  throw new Error("Expected createAIProvider to throw for missing mockResponse, but it did not");
}

export function createInvalidClaudeProviderExample(): Error {
  try {
    createAIProvider({
      type: "claude",
    });
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  throw new Error("Expected createAIProvider to throw for missing apiKey, but it did not");
}

export function createInvalidOpenAIProviderExample(): Error {
  try {
    createAIProvider({
      type: "openai",
    });
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  throw new Error("Expected createAIProvider to throw for missing apiKey, but it did not");
}
