import type { StoryGenerationInput } from "@/lib/ai/story-generation.types";

export type StoryGenerationValidationResult =
  | { valid: true; errors: [] }
  | { valid: false; errors: string[] };

const MIN_SELECTED_THEMES = 1;
const MAX_SELECTED_THEMES = 2;
const MIN_LIFE_SUMMARY_LENGTH = 300;

function isNonEmptyTrimmed(value: string): boolean {
  return value.trim().length > 0;
}

export function validateStoryGenerationInput(
  input: StoryGenerationInput
): StoryGenerationValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyTrimmed(input.userId)) {
    errors.push("userId is required");
  }

  if (!isNonEmptyTrimmed(input.storyId)) {
    errors.push("storyId is required");
  }

  if (!Number.isInteger(input.currentAge) || input.currentAge <= 0) {
    errors.push("currentAge must be an integer greater than 0");
  }

  if (
    !Number.isInteger(input.targetAge) ||
    !Number.isInteger(input.currentAge) ||
    input.targetAge <= input.currentAge
  ) {
    errors.push("targetAge must be an integer greater than currentAge");
  }

  if (
    input.selectedThemes.length < MIN_SELECTED_THEMES ||
    input.selectedThemes.length > MAX_SELECTED_THEMES
  ) {
    errors.push(
      `selectedThemes must contain between ${MIN_SELECTED_THEMES} and ${MAX_SELECTED_THEMES} entries`
    );
  }

  if (input.lifeSummary.trim().length < MIN_LIFE_SUMMARY_LENGTH) {
    errors.push(`lifeSummary must be at least ${MIN_LIFE_SUMMARY_LENGTH} characters`);
  }

  if (!isNonEmptyTrimmed(input.regretPoint)) {
    errors.push("regretPoint is required");
  }

  if (errors.length === 0) {
    return { valid: true, errors: [] };
  }

  return { valid: false, errors };
}
