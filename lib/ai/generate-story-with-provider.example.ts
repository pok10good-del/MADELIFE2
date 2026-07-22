import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { MockAIProvider } from "@/lib/ai/mock-ai-provider";
import { generateStoryWithProvider } from "@/lib/ai/generate-story-with-provider";
import { VALID_STORY_RESPONSE } from "@/lib/ai/story-generation.mock";
import { VALID_STORY_INPUT, INVALID_STORY_INPUT } from "@/lib/ai/generate-story.test-data";

export async function runProviderExample(): Promise<StoryGenerationResult> {
  const provider = new MockAIProvider(VALID_STORY_RESPONSE);
  return generateStoryWithProvider(provider, VALID_STORY_INPUT);
}

export async function runProviderInvalidExample(): Promise<Error> {
  const provider = new MockAIProvider(VALID_STORY_RESPONSE);
  try {
    await generateStoryWithProvider(provider, INVALID_STORY_INPUT);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  throw new Error("Expected generateStoryWithProvider to throw for INVALID_STORY_INPUT, but it did not");
}
