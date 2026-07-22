import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { generateStory } from "@/lib/ai/generate-story";
import { VALID_STORY_RESPONSE } from "@/lib/ai/story-generation.mock";
import { VALID_STORY_INPUT, INVALID_STORY_INPUT } from "@/lib/ai/generate-story.test-data";

export function runGenerateStoryExample(): StoryGenerationResult {
  return generateStory(VALID_STORY_INPUT, VALID_STORY_RESPONSE);
}

export function runGenerateStoryInvalidExample(): Error {
  try {
    generateStory(INVALID_STORY_INPUT, VALID_STORY_RESPONSE);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  throw new Error("Expected generateStory to throw for INVALID_STORY_INPUT, but it did not");
}
