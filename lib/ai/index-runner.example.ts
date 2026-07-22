import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { runPublicApiExample } from "@/lib/ai/index.example";
import { runPublicApiInvalidExample } from "@/lib/ai/index.invalid.example";

export interface PublicApiRunnerResult {
  success: StoryGenerationResult;
  invalid: Error;
}

export async function runPublicApiExamples(): Promise<PublicApiRunnerResult> {
  const success = await runPublicApiExample();
  const invalid = await runPublicApiInvalidExample();

  return { success, invalid };
}
