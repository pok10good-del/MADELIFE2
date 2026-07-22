import type { StoryGenerationFacade } from "@/lib/ai/story-generation.facade";
import { DefaultStoryGenerationFacade } from "@/lib/ai/story-generation.facade";

export function createStoryGenerationFacade(): StoryGenerationFacade {
  return new DefaultStoryGenerationFacade();
}
