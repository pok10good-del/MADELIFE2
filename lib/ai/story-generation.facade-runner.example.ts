import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { runStoryGenerationFacadeExample } from "@/lib/ai/story-generation.facade.example";
import { runStoryGenerationFacadeInvalidExample } from "@/lib/ai/story-generation.facade.invalid.example";

export interface StoryGenerationFacadeRunnerResult {
  success: StoryGenerationResult;
  invalid: Error;
}

export async function runStoryGenerationFacadeExamples(): Promise<StoryGenerationFacadeRunnerResult> {
  const success = await runStoryGenerationFacadeExample();
  const invalid = await runStoryGenerationFacadeInvalidExample();

  return { success, invalid };
}
