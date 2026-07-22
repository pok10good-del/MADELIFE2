import { createStoryGenerationFacade } from "@/lib/ai/story-generation.facade.factory";
import { VALID_STORY_INPUT } from "@/lib/ai/generate-story.test-data";

export async function runStoryGenerationFacadeFactoryInvalidExample(): Promise<Error> {
  const facade = createStoryGenerationFacade();

  const originalAIProvider = process.env.AI_PROVIDER;
  const originalClaudeApiKey = process.env.CLAUDE_API_KEY;
  const originalOpenAIApiKey = process.env.OPENAI_API_KEY;

  try {
    process.env.AI_PROVIDER = "invalid-provider";
    delete process.env.CLAUDE_API_KEY;
    delete process.env.OPENAI_API_KEY;

    try {
      await facade.generate(VALID_STORY_INPUT);
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
    throw new Error("Expected facade.generate to throw for invalid AI_PROVIDER, but it did not");
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
