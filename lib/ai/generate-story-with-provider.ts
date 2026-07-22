import type { AIProvider, GenerateOptions } from "@/lib/ai/ai-provider";
import type { StoryGenerationInput, StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { validateStoryGenerationInput } from "@/lib/ai/validate-story-generation-input";
import { buildStoryGenerationPrompt } from "@/lib/ai/build-story-generation-prompt";
import { parseStoryGenerationResponse } from "@/lib/ai/parse-story-generation-response";
import { validateStoryGenerationResult } from "@/lib/ai/validate-story-generation-result";

export async function generateStoryWithProvider(
  provider: AIProvider,
  input: StoryGenerationInput,
  options?: GenerateOptions
): Promise<StoryGenerationResult> {
  const validation = validateStoryGenerationInput(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join(", "));
  }

  const prompt = buildStoryGenerationPrompt(input);

  const response = await provider.generate(prompt, options);

  const result = parseStoryGenerationResponse(response);

  const resultValidation = validateStoryGenerationResult(result);
  if (!resultValidation.valid) {
    throw new Error(resultValidation.errors.join(", "));
  }

  return result;
}
