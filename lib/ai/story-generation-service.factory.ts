import type { StoryGenerationService } from "@/lib/ai/story-generation-service";
import { DefaultStoryGenerationService } from "@/lib/ai/story-generation-service";

export function createStoryGenerationService(): StoryGenerationService {
  return new DefaultStoryGenerationService();
}
