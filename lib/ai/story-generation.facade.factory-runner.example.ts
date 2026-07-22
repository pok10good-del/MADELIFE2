import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { runStoryGenerationFacadeFactoryExample } from "@/lib/ai/story-generation.facade.factory.example";
import { runStoryGenerationFacadeFactoryInvalidExample } from "@/lib/ai/story-generation.facade.factory.invalid.example";

export interface StoryGenerationFacadeFactoryRunnerResult {
  success: StoryGenerationResult;
  invalid: Error;
}

export async function runStoryGenerationFacadeFactoryExamples(): Promise<StoryGenerationFacadeFactoryRunnerResult> {
  const success = await runStoryGenerationFacadeFactoryExample();
  const invalid = await runStoryGenerationFacadeFactoryInvalidExample();

  return { success, invalid };
}
