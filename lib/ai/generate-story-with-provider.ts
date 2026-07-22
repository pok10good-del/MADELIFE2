import type { AIProvider } from "@/lib/ai/ai-provider";
import type { StoryGenerationInput, StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { validateStoryGenerationInput } from "@/lib/ai/validate-story-generation-input";
import { generateFusionPlan } from "@/lib/ai/generate-fusion-plan";
import { generateVerifiedStoryContent } from "@/lib/ai/generate-verified-story-content";
import { validateStoryGenerationResult } from "@/lib/ai/validate-story-generation-result";

export async function generateStoryWithProvider(
  provider: AIProvider,
  input: StoryGenerationInput
): Promise<StoryGenerationResult> {
  const validation = validateStoryGenerationInput(input);
  if (!validation.valid) {
    throw new Error(validation.errors.join(", "));
  }

  const { plan } = await generateFusionPlan(provider, input);
  const { content } = await generateVerifiedStoryContent(provider, input, plan);

  // generated_themes always stores the user's original selection, never a
  // value produced or rephrased by the model.
  const result: StoryGenerationResult = {
    title: content.title,
    content: content.content,
    startAge: input.currentAge,
    endAge: input.targetAge,
    themes: [...input.selectedThemes],
  };

  const resultValidation = validateStoryGenerationResult(result);
  if (!resultValidation.valid) {
    throw new Error(resultValidation.errors.join(", "));
  }

  return result;
}
