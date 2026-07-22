import type { StoryGenerationInput, StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { createAIProviderFromEnv } from "@/lib/ai/create-ai-provider-from-env";
import { generateStoryWithProvider } from "@/lib/ai/generate-story-with-provider";

export async function generateStoryFromEnv(
  input: StoryGenerationInput
): Promise<StoryGenerationResult> {
  const provider = createAIProviderFromEnv();
  return generateStoryWithProvider(provider, input);
}
