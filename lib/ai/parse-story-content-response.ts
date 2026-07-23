import type { ParsedStoryContent } from "@/lib/ai/story-generation.types";

const RESPONSE_LABELS = ["TITLE", "CONTENT"] as const;
type ResponseLabel = (typeof RESPONSE_LABELS)[number];

function extractSections(response: string): Partial<Record<ResponseLabel, string>> {
  const labelPattern = RESPONSE_LABELS.join("|");
  const headerRegex = new RegExp(`^\\*{0,2}(${labelPattern})\\*{0,2}:`, "gm");
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

export function parseStoryContentResponse(response: string): ParsedStoryContent {
  const sections = extractSections(response);

  const title = sections.TITLE;
  if (!title || title.length === 0) {
    throw new Error("TITLE is missing from the AI response");
  }

  const content = sections.CONTENT;
  if (!content || content.length === 0) {
    throw new Error("CONTENT is missing from the AI response");
  }

  return { title, content };
}

export function parseStoryContentPartResponse(response: string): string {
  const sections = extractSections(response);

  const content = sections.CONTENT;
  if (!content || content.length === 0) {
    throw new Error("CONTENT is missing from the AI response");
  }

  return content;
}
