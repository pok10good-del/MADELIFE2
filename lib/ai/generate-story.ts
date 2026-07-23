import type { StoryGenerationInput, StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { validateStoryGenerationInput } from "@/lib/ai/validate-story-generation-input";
import { buildStoryGenerationPrompt } from "@/lib/ai/build-story-generation-prompt";
import { parseStoryGenerationResponse } from "@/lib/ai/parse-story-generation-response";
import { validateStoryGenerationResult } from "@/lib/ai/validate-story-generation-result";

export function generateStory(
  input: StoryGenerationInput,
  aiResponse: string
): StoryGenerationResult {
  const validation = validateStoryGenerationInput(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join(", "));
  }

  const prompt = buildStoryGenerationPrompt(input);
  if (prompt.trim().length === 0) {
    throw new Error("Failed to build story generation prompt");
  }

  const parsed = parseStoryGenerationResponse(aiResponse);
  const result: StoryGenerationResult = {
    ...parsed,
    startAge: input.currentAge,
    endAge: input.targetAge,
  };

  const resultValidation = validateStoryGenerationResult(result);
  if (!resultValidation.valid) {
    throw new Error(resultValidation.errors.join(", "));
  }

  return result;
}
