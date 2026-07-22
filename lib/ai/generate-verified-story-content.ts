import type { AIProvider } from "@/lib/ai/ai-provider";
import type {
  FusionPlan,
  ParsedStoryContent,
  StoryGenerationInput,
  StructureVerification,
} from "@/lib/ai/story-generation.types";
import { buildStoryContentPrompt } from "@/lib/ai/build-story-content-prompt";
import { parseStoryContentResponse } from "@/lib/ai/parse-story-content-response";
import { buildStructureVerificationPrompt } from "@/lib/ai/build-structure-verification-prompt";
import { parseStructureVerificationResponse } from "@/lib/ai/parse-structure-verification-response";
import { recomputeStructureVerification } from "@/lib/ai/validate-structure-verification-result";

export const MAX_CONTENT_ATTEMPTS = 3;

export interface VerifiedStoryContentResult {
  content: ParsedStoryContent;
  verification: StructureVerification;
  attempts: number;
  contentCallCount: number;
  verificationCallCount: number;
}

export async function generateVerifiedStoryContent(
  provider: AIProvider,
  input: StoryGenerationInput,
  plan: FusionPlan
): Promise<VerifiedStoryContentResult> {
  let previousContent: ParsedStoryContent | undefined;
  let previousVerification: StructureVerification | undefined;
  let contentCallCount = 0;
  let verificationCallCount = 0;

  for (let attempt = 1; attempt <= MAX_CONTENT_ATTEMPTS; attempt++) {
    const contentPrompt = buildStoryContentPrompt(
      input,
      plan,
      previousContent !== undefined && previousVerification !== undefined
        ? { previousContent, failureReasons: previousVerification.failure_reasons }
        : undefined
    );

    const rawContent = await provider.generateWithSystem(contentPrompt.system, contentPrompt.user, {
      temperature: 0.8,
      maxTokens: 4096,
    });
    contentCallCount += 1;
    const parsedContent = parseStoryContentResponse(rawContent);

    const verificationPrompt = buildStructureVerificationPrompt(plan, parsedContent);
    const rawVerification = await provider.generateWithSystem(
      verificationPrompt.system,
      verificationPrompt.user,
      { temperature: 0, responseFormat: "json_object" }
    );
    verificationCallCount += 1;
    const verification = recomputeStructureVerification(
      parseStructureVerificationResponse(rawVerification)
    );

    if (verification.passed) {
      return {
        content: parsedContent,
        verification,
        attempts: attempt,
        contentCallCount,
        verificationCallCount,
      };
    }

    previousContent = parsedContent;
    previousVerification = verification;
  }

  throw new Error(
    `Story content failed structure verification after ${MAX_CONTENT_ATTEMPTS} attempts: ${
      previousVerification?.failure_reasons.join("; ") ?? "unknown"
    }`
  );
}
