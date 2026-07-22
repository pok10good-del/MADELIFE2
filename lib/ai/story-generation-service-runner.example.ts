import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { runStoryGenerationServiceExample } from "@/lib/ai/story-generation-service.example";
import { runStoryGenerationServiceInvalidExample } from "@/lib/ai/story-generation-service.invalid.example";

export interface StoryGenerationServiceRunnerResult {
  success: StoryGenerationResult;
  invalid: Error;
}

export async function runStoryGenerationServiceExamples(): Promise<StoryGenerationServiceRunnerResult> {
  const success = await runStoryGenerationServiceExample();
  const invalid = await runStoryGenerationServiceInvalidExample();

  return { success, invalid };
}
