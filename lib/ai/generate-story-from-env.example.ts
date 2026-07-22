import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { generateStoryFromEnv } from "@/lib/ai/generate-story-from-env";
import { VALID_STORY_INPUT } from "@/lib/ai/generate-story.test-data";

export async function runGenerateStoryFromMockEnvExample(): Promise<StoryGenerationResult> {
  const originalAIProvider = process.env.AI_PROVIDER;
  const originalClaudeApiKey = process.env.CLAUDE_API_KEY;
  const originalOpenAIApiKey = process.env.OPENAI_API_KEY;

  try {
    process.env.AI_PROVIDER = "mock";
    delete process.env.CLAUDE_API_KEY;
    delete process.env.OPENAI_API_KEY;

    return await generateStoryFromEnv(VALID_STORY_INPUT);
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
