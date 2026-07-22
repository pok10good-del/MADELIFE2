import { generateStoryFromEnv } from "@/lib/ai/generate-story-from-env";
import { VALID_STORY_INPUT, INVALID_STORY_INPUT } from "@/lib/ai/generate-story.test-data";

export async function runGenerateStoryFromInvalidEnvExample(): Promise<Error> {
  const originalAIProvider = process.env.AI_PROVIDER;
  const originalClaudeApiKey = process.env.CLAUDE_API_KEY;
  const originalOpenAIApiKey = process.env.OPENAI_API_KEY;

  try {
    process.env.AI_PROVIDER = "claude";
    delete process.env.CLAUDE_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      await generateStoryFromEnv(VALID_STORY_INPUT);
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
    throw new Error("Expected generateStoryFromEnv to throw for missing CLAUDE_API_KEY, but it did not");
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

export async function runGenerateStoryFromMockInvalidInputExample(): Promise<Error> {
  const originalAIProvider = process.env.AI_PROVIDER;
  const originalClaudeApiKey = process.env.CLAUDE_API_KEY;
  const originalOpenAIApiKey = process.env.OPENAI_API_KEY;

  try {
    process.env.AI_PROVIDER = "mock";
    delete process.env.CLAUDE_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      await generateStoryFromEnv(INVALID_STORY_INPUT);
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
    throw new Error("Expected generateStoryFromEnv to throw for INVALID_STORY_INPUT, but it did not");
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
