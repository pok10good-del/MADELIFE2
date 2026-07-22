import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";

export type StoryGenerationResultValidation =
  | { valid: true; errors: [] }
  | { valid: false; errors: string[] };

const EXPECTED_EPISODE_YEAR_SPAN = 2;
const MIN_THEMES = 1;
const MAX_THEMES = 2;

function isNonEmptyTrimmed(value: string): boolean {
  return value.trim().length > 0;
}

export function validateStoryGenerationResult(
  result: StoryGenerationResult
): StoryGenerationResultValidation {
  const errors: string[] = [];

  if (!isNonEmptyTrimmed(result.title)) {
    errors.push("title is required");
  }

  if (!isNonEmptyTrimmed(result.content)) {
    errors.push("content is required");
  }

  if (!Number.isInteger(result.startAge) || result.startAge <= 0) {
    errors.push("startAge must be an integer greater than 0");
  }

  if (
    !Number.isInteger(result.endAge) ||
    !Number.isInteger(result.startAge) ||
    result.endAge <= result.startAge
  ) {
    errors.push("endAge must be an integer greater than startAge");
  }

  if (
    Number.isInteger(result.startAge) &&
    Number.isInteger(result.endAge) &&
    result.endAge - result.startAge !== EXPECTED_EPISODE_YEAR_SPAN
  ) {
    errors.push(`endAge - startAge must be exactly ${EXPECTED_EPISODE_YEAR_SPAN}`);
  }

  if (result.themes.length < MIN_THEMES || result.themes.length > MAX_THEMES) {
    errors.push(`themes must contain between ${MIN_THEMES} and ${MAX_THEMES} entries`);
  }

  if (result.themes.some((theme) => !isNonEmptyTrimmed(theme))) {
    errors.push("themes must not contain empty values");
  }

  if (errors.length === 0) {
    return { valid: true, errors: [] };
  }

  return { valid: false, errors };
}
