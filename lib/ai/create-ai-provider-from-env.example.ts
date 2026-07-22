import type { AIProvider } from "@/lib/ai/ai-provider";
import { createAIProviderFromEnv } from "@/lib/ai/create-ai-provider-from-env";

export function createProviderFromMockEnvExample(): AIProvider {
  const originalAIProvider = process.env.AI_PROVIDER;
  const originalClaudeApiKey = process.env.CLAUDE_API_KEY;
  const originalOpenAIApiKey = process.env.OPENAI_API_KEY;

  try {
    process.env.AI_PROVIDER = "mock";
    delete process.env.CLAUDE_API_KEY;
    delete process.env.OPENAI_API_KEY;

    return createAIProviderFromEnv();
  } finally {
    if (originalAIProvider === undefined) {
      delete process.env.AI_PROVIDER;
    } else {
      process.env.AI_PROVIDER = originalAIProvider;
    }

    if (originalClaudeApiKey === undefined) {
      delete process.env.CLAUDE_API_KEY;
    } else {
      process.env.CLAUDE_API_KEY = originalClaudeApiKey;
    }

    if (originalOpenAIApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAIApiKey;
    }
  }
}

export function createProviderFromOpenAIEnvExample(): AIProvider {
  const originalAIProvider = process.env.AI_PROVIDER;
  const originalClaudeApiKey = process.env.CLAUDE_API_KEY;
  const originalOpenAIApiKey = process.env.OPENAI_API_KEY;

  try {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "test-api-key";
    delete process.env.CLAUDE_API_KEY;

    return createAIProviderFromEnv();
  } finally {
    if (originalAIProvider === undefined) {
      delete process.env.AI_PROVIDER;
    } else {
      process.env.AI_PROVIDER = originalAIProvider;
    }

    if (originalClaudeApiKey === undefined) {
      delete process.env.CLAUDE_API_KEY;
    } else {
      process.env.CLAUDE_API_KEY = originalClaudeApiKey;
    }

    if (originalOpenAIApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAIApiKey;
    }
  }
}

export function createProviderFromClaudeEnvExample(): AIProvider {
  const originalAIProvider = process.env.AI_PROVIDER;
  const originalClaudeApiKey = process.env.CLAUDE_API_KEY;
  const originalOpenAIApiKey = process.env.OPENAI_API_KEY;

  try {
    process.env.AI_PROVIDER = "claude";
    process.env.CLAUDE_API_KEY = "test-api-key";
    delete process.env.OPENAI_API_KEY;

    return createAIProviderFromEnv();
  } finally {
    if (originalAIProvider === undefined) {
      delete process.env.AI_PROVIDER;
    } else {
      process.env.AI_PROVIDER = originalAIProvider;
    }

    if (originalClaudeApiKey === undefined) {
      delete process.env.CLAUDE_API_KEY;
    } else {
      process.env.CLAUDE_API_KEY = originalClaudeApiKey;
    }

    if (originalOpenAIApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAIApiKey;
    }
  }
}
