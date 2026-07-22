import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { runStoryGenerationServiceFactoryExample } from "@/lib/ai/story-generation-service.factory.example";
import { runStoryGenerationServiceFactoryInvalidExample } from "@/lib/ai/story-generation-service.factory.invalid.example";

export interface StoryGenerationServiceFactoryRunnerResult {
  success: StoryGenerationResult;
  invalid: Error;
}

export async function runStoryGenerationServiceFactoryExamples(): Promise<StoryGenerationServiceFactoryRunnerResult> {
  const success = await runStoryGenerationServiceFactoryExample();
  const invalid = await runStoryGenerationServiceFactoryInvalidExample();

  return { success, invalid };
}
