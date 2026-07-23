import type { StoriesInsert, StoriesRow } from "@/lib/supabase/stories.types";
import type { StoryGenerationInput } from "@/lib/ai/story-generation.types";
import { mapSelectedPathsToThemes } from "@/lib/story-generation/fate-path-themes";
import { dateOnlyForAge } from "@/lib/story-generation/compute-age";

interface ContinuationAgeRange {
  currentAge: number;
  targetAge: number;
}

function computeContinuationAgeRange(
  firstEpisode: StoriesRow,
  previousEpisode: StoriesRow
): ContinuationAgeRange {
  if (firstEpisode.generated_start_age === null || firstEpisode.generated_end_age === null) {
    throw new Error("firstEpisode is missing generated age range");
  }
  if (previousEpisode.generated_end_age === null) {
    throw new Error("previousEpisode is missing generated age range");
  }

  const episodeSpan = firstEpisode.generated_end_age - firstEpisode.generated_start_age;
  const currentAge = previousEpisode.generated_end_age;
  const targetAge = currentAge + episodeSpan;
  return { currentAge, targetAge };
}

/**
 * Builds the next episode's generation input from the previous episode's row.
 * Ages continue from where the previous episode ended, using the same
 * age span as the series' first episode, and lifeSummary becomes the
 * previous episode's actual generated content instead of the original
 * onboarding text.
 */
export function buildContinuationStoryGenerationInput(
  firstEpisode: StoriesRow,
  previousEpisode: StoriesRow
): StoryGenerationInput {
  if (previousEpisode.generated_content === null) {
    throw new Error("previousEpisode is missing generated content");
  }
  const { currentAge, targetAge } = computeContinuationAgeRange(firstEpisode, previousEpisode);

  return {
    userId: previousEpisode.user_id,
    storyId: previousEpisode.id,
    currentAge,
    targetAge,
    selectedThemes: mapSelectedPathsToThemes(previousEpisode.selected_paths),
    lifeSummary: previousEpisode.generated_content,
    regretPoint: previousEpisode.regret_point,
  };
}

/**
 * Builds the DB row to insert for the next episode, carrying forward the
 * series' fixed choices (themes, sport/celebrity picks, share option) from
 * the previous episode.
 */
export function buildContinuationStoriesInsert(
  firstEpisode: StoriesRow,
  previousEpisode: StoriesRow,
  episodeNumber: number
): Omit<StoriesInsert, "user_id"> {
  if (previousEpisode.generated_content === null) {
    throw new Error("previousEpisode is missing generated content");
  }
  const { targetAge } = computeContinuationAgeRange(firstEpisode, previousEpisode);

  return {
    story_text: previousEpisode.generated_content,
    birth_date: previousEpisode.birth_date,
    story_start_date: dateOnlyForAge(previousEpisode.birth_date, targetAge),
    selected_paths: previousEpisode.selected_paths,
    sport_choice: previousEpisode.sport_choice,
    celebrity_name: previousEpisode.celebrity_name,
    share_option: previousEpisode.share_option,
    regret_point: previousEpisode.regret_point,
    episode_number: episodeNumber,
  };
}
