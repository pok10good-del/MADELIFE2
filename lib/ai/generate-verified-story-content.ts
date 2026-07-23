import type { AIProvider } from "@/lib/ai/ai-provider";
import type {
  FusionPlan,
  ParsedStoryContent,
  StoryGenerationInput,
  StructureVerification,
} from "@/lib/ai/story-generation.types";
import { STORY_PART_COUNT, buildStoryContentPartPrompt } from "@/lib/ai/build-story-content-prompt";
import { parseStoryContentPartResponse, parseStoryContentResponse } from "@/lib/ai/parse-story-content-response";
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

async function generateEpisodeParts(
  provider: AIProvider,
  input: StoryGenerationInput,
  plan: FusionPlan,
  retry: { previousContent: ParsedStoryContent; failureReasons: string[] } | undefined
): Promise<{ assembled: ParsedStoryContent; contentCallCount: number }> {
  let title = "";
  const partContents: string[] = [];
  let contentCallCount = 0;

  for (let partIndex = 0; partIndex < STORY_PART_COUNT; partIndex++) {
    const partPrompt = buildStoryContentPartPrompt(input, plan, partIndex, partContents, retry);

    const rawPart = await provider.generateWithSystem(partPrompt.system, partPrompt.user, {
      temperature: 0.8,
      maxTokens: 4096,
    });
    contentCallCount += 1;

    if (partIndex === 0) {
      const parsed = parseStoryContentResponse(rawPart);
      title = parsed.title;
      partContents.push(parsed.content);
    } else {
      partContents.push(parseStoryContentPartResponse(rawPart));
    }
  }

  return {
    assembled: { title, content: partContents.join("\n\n") },
    contentCallCount,
  };
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
    const retry =
      previousContent !== undefined && previousVerification !== undefined
        ? { previousContent, failureReasons: previousVerification.failure_reasons }
        : undefined;

    const { assembled, contentCallCount: partCallCount } = await generateEpisodeParts(
      provider,
      input,
      plan,
      retry
    );
    contentCallCount += partCallCount;

    const verificationPrompt = buildStructureVerificationPrompt(plan, assembled);
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
        content: assembled,
        verification,
        attempts: attempt,
        contentCallCount,
        verificationCallCount,
      };
    }

    previousContent = assembled;
    previousVerification = verification;
  }

  throw new Error(
    `Story content failed structure verification after ${MAX_CONTENT_ATTEMPTS} attempts: ${
      previousVerification?.failure_reasons.join("; ") ?? "unknown"
    }`
  );
}
