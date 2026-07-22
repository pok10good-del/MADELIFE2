import type { StoryGenerationInput, StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { generateStoryFromEnv } from "@/lib/ai/generate-story-from-env";

export interface StoryGenerationService {
  generate(input: StoryGenerationInput): Promise<StoryGenerationResult>;
}

export class DefaultStoryGenerationService implements StoryGenerationService {
  async generate(input: StoryGenerationInput): Promise<StoryGenerationResult> {
    return generateStoryFromEnv(input);
  }
}
