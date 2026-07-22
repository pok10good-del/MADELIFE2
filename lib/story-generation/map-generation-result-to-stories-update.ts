import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";
import type { StoriesUpdate } from "@/lib/supabase/stories.types";

export function mapStoryGenerationResultToStoriesUpdate(
  result: StoryGenerationResult
): StoriesUpdate {
  return {
    generated_title: result.title,
    generated_content: result.content,
    generated_start_age: result.startAge,
    generated_end_age: result.endAge,
    generated_themes: result.themes,
    status: "completed",
  };
}
