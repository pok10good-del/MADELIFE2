import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { runGenerateStoryFromMockEnvExample } from "@/lib/ai/generate-story-from-env.example";
import {
  runGenerateStoryFromInvalidEnvExample,
  runGenerateStoryFromMockInvalidInputExample,
} from "@/lib/ai/generate-story-from-env.invalid.example";

export interface StoryGenerationRunnerResult {
  success: StoryGenerationResult;
  invalidEnv: Error;
  invalidInput: Error;
}

export async function runStoryGenerationExamples(): Promise<StoryGenerationRunnerResult> {
  const success = await runGenerateStoryFromMockEnvExample();
  const invalidEnv = await runGenerateStoryFromInvalidEnvExample();
  const invalidInput = await runGenerateStoryFromMockInvalidInputExample();

  return { success, invalidEnv, invalidInput };
}
