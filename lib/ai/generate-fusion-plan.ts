import type { AIProvider } from "@/lib/ai/ai-provider";
import type { FusionPlan, StoryGenerationInput } from "@/lib/ai/story-generation.types";
import { buildFusionPlanPrompt } from "@/lib/ai/build-fusion-plan-prompt";
import { parseFusionPlanResponse } from "@/lib/ai/parse-fusion-plan-response";
import { validateFusionPlan } from "@/lib/ai/validate-fusion-plan";

export const MAX_FUSION_PLAN_ATTEMPTS = 3;

export interface FusionPlanGenerationResult {
  plan: FusionPlan;
  attempts: number;
  rawResponse: string;
}

/**
 * Locks theme1/theme2 to the user's original selection regardless of what
 * the model echoed back, so the AI can never rename, merge, or drop one of
 * the two selected fragments.
 */
function lockPlanThemes(plan: FusionPlan, input: StoryGenerationInput): FusionPlan {
  return {
    ...plan,
    theme1: input.selectedThemes[0],
    theme2: input.selectedThemes[1] ?? input.selectedThemes[0],
  };
}

export async function generateFusionPlan(
  provider: AIProvider,
  input: StoryGenerationInput
): Promise<FusionPlanGenerationResult> {
  let previousPlanJson: string | undefined;
  let failureReasons: string[] = [];

  for (let attempt = 1; attempt <= MAX_FUSION_PLAN_ATTEMPTS; attempt++) {
    const prompt = buildFusionPlanPrompt(
      input,
      previousPlanJson !== undefined ? { previousPlanJson, failureReasons } : undefined
    );

    const rawResponse = await provider.generateWithSystem(prompt.system, prompt.user, {
      temperature: 0.7,
      responseFormat: "json_object",
    });

    let plan: FusionPlan;
    try {
      plan = lockPlanThemes(parseFusionPlanResponse(rawResponse), input);
    } catch (error) {
      previousPlanJson = rawResponse;
      failureReasons = [error instanceof Error ? error.message : String(error)];
      continue;
    }

    const validation = validateFusionPlan(plan);
    if (validation.valid) {
      return { plan, attempts: attempt, rawResponse };
    }

    previousPlanJson = JSON.stringify(plan);
    failureReasons = validation.errors;
  }

  throw new Error(
    `Fusion plan failed validation after ${MAX_FUSION_PLAN_ATTEMPTS} attempts: ${failureReasons.join("; ")}`
  );
}
