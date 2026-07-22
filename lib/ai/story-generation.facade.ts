import type { StoryGenerationInput, StoryGenerationResult } from "@/lib/ai/story-generation.types";
import { createStoryGenerationService } from "@/lib/ai/story-generation-service.factory";

export interface StoryGenerationFacade {
  generate(input: StoryGenerationInput): Promise<StoryGenerationResult>;
}

export class DefaultStoryGenerationFacade implements StoryGenerationFacade {
  async generate(input: StoryGenerationInput): Promise<StoryGenerationResult> {
    const service = createStoryGenerationService();
    return service.generate(input);
  }
}
