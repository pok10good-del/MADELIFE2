import type { StoriesInsert, StoriesShareOption } from "@/lib/supabase/stories.types";
import { computeAge } from "@/lib/story-generation/compute-age";

export interface StoryFormInput {
  storyText: string;
  birthDate: Date | null;
  storyStartDate: Date | null;
  selectedPaths: string[];
  sportChoice: string | null;
  celebrityName: string;
  shareOption: StoriesShareOption;
  regretPoint: string;
}

const STORY_TEXT_MIN_LENGTH = 300;
const MAX_SELECTED_PATHS = 2;
const SPORT_PATH_ID = "path-sports";
const CELEBRITY_PATH_ID = "path-celebrity";

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function mapStoryInputToStoriesInsert(
  input: StoryFormInput
): Omit<StoriesInsert, "user_id"> {
  const storyText = input.storyText.trim();
  if (storyText.length < STORY_TEXT_MIN_LENGTH) {
    throw new Error(`story_text must be at least ${STORY_TEXT_MIN_LENGTH} characters`);
  }

  if (!input.birthDate) {
    throw new Error("birth_date is required");
  }

  if (!input.storyStartDate) {
    throw new Error("story_start_date is required");
  }

  const birthDateString = toDateString(input.birthDate);
  const currentAge = computeAge(birthDateString, new Date());
  const targetAge = computeAge(birthDateString, input.storyStartDate);
  if (targetAge <= currentAge) {
    throw new Error("이야기가 시작되는 해는 현재보다 나이가 더 많아지는 미래 날짜로 선택해주세요.");
  }

  const selectedPaths = input.selectedPaths.filter((path) => path.trim().length > 0);
  if (selectedPaths.length < 1 || selectedPaths.length > MAX_SELECTED_PATHS) {
    throw new Error(`selected_paths must contain between 1 and ${MAX_SELECTED_PATHS} entries`);
  }

  const sportChoice = input.sportChoice?.trim() || null;
  if (selectedPaths.includes(SPORT_PATH_ID) && !sportChoice) {
    throw new Error("sport_choice is required when path-sports is selected");
  }

  const celebrityName = input.celebrityName.trim() || null;
  if (selectedPaths.includes(CELEBRITY_PATH_ID) && !celebrityName) {
    throw new Error("celebrity_name is required when path-celebrity is selected");
  }

  const regretPoint = input.regretPoint.trim();

  return {
    story_text: storyText,
    birth_date: birthDateString,
    story_start_date: toDateString(input.storyStartDate),
    selected_paths: selectedPaths,
    sport_choice: sportChoice,
    celebrity_name: celebrityName,
    share_option: input.shareOption,
    regret_point: regretPoint,
  };
}
