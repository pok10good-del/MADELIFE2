import type { StoryGenerationResult } from "@/lib/ai/story-generation.types";

const RESPONSE_LABELS = ["TITLE", "CONTENT", "START_AGE", "END_AGE", "THEMES"] as const;
type ResponseLabel = (typeof RESPONSE_LABELS)[number];

function extractSections(response: string): Partial<Record<ResponseLabel, string>> {
  const labelPattern = RESPONSE_LABELS.join("|");
  const headerRegex = new RegExp(`^(${labelPattern}):`, "gm");
  const matches = [...response.matchAll(headerRegex)];

  const sections: Partial<Record<ResponseLabel, string>> = {};
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const label = match[1] as ResponseLabel;
    const valueStart = (match.index ?? 0) + match[0].length;
    const valueEnd = i + 1 < matches.length ? matches[i + 1].index ?? response.length : response.length;
    sections[label] = response.slice(valueStart, valueEnd).trim();
  }
  return sections;
}

export function parseStoryGenerationResponse(response: string): StoryGenerationResult {
  const sections = extractSections(response);

  const title = sections.TITLE;
  if (!title || title.length === 0) {
    throw new Error("TITLE is missing from the AI response");
  }

  const content = sections.CONTENT;
  if (!content || content.length === 0) {
    throw new Error("CONTENT is missing from the AI response");
  }

  const startAgeRaw = sections.START_AGE;
  if (!startAgeRaw || startAgeRaw.length === 0) {
    throw new Error("START_AGE is missing from the AI response");
  }
  const startAge = Number(startAgeRaw);
  if (!Number.isFinite(startAge)) {
    throw new Error("START_AGE could not be converted to a number");
  }

  const endAgeRaw = sections.END_AGE;
  if (!endAgeRaw || endAgeRaw.length === 0) {
    throw new Error("END_AGE is missing from the AI response");
  }
  const endAge = Number(endAgeRaw);
  if (!Number.isFinite(endAge)) {
    throw new Error("END_AGE could not be converted to a number");
  }

  const themesRaw = sections.THEMES;
  if (!themesRaw || themesRaw.length === 0) {
    throw new Error("THEMES is missing from the AI response");
  }
  const themes = themesRaw.split(",").map((theme) => theme.trim());

  return { title, content, startAge, endAge, themes };
}
