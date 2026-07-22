import type { StoriesRow } from "@/lib/supabase/stories.types";
import type { StoryGenerationInput } from "@/lib/ai/story-generation.types";
import { computeAge, parseDateOnly } from "@/lib/story-generation/compute-age";
import { mapSelectedPathsToThemes } from "@/lib/story-generation/fate-path-themes";

export function buildStoryGenerationInput(
  story: StoriesRow,
  today: Date = new Date()
): StoryGenerationInput {
  return {
    userId: story.user_id,
    storyId: story.id,
    currentAge: computeAge(story.birth_date, today),
    targetAge: computeAge(story.birth_date, parseDateOnly(story.story_start_date)),
    selectedThemes: mapSelectedPathsToThemes(story.selected_paths),
    lifeSummary: story.story_text,
    regretPoint: story.regret_point,
  };
}
