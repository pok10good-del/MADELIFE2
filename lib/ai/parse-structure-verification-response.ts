import type { StructureVerification } from "@/lib/ai/story-generation.types";

const REQUIRED_BOOLEAN_KEYS: (keyof StructureVerification)[] = [
  "theme1_event_present",
  "theme2_event_present",
  "intersection_event_present",
  "causal_connection_preserved",
  "mere_keyword_mention",
  "independent_story_split",
  "ending_is_unresolved_trigger",
  "coincidence_or_unearned_introduction",
  "celebrity_pursues_protagonist",
  "mutual_equal_footing_detected",
  "dialogue_conflict_present",
  "passed",
];

const REQUIRED_STRING_KEYS: (keyof StructureVerification)[] = [
  "theme1_evidence",
  "theme2_evidence",
  "intersection_evidence",
  "ending_evidence",
  "coincidence_evidence",
  "mutual_equal_footing_evidence",
];

function extractJsonObject(response: string): string {
  const fenced = response.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in structure verification response");
  }
  return response.slice(start, end + 1);
}

export function parseStructureVerificationResponse(response: string): StructureVerification {
  const jsonText = extractJsonObject(response);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      `Failed to parse structure verification JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Structure verification response is not a JSON object");
  }

  const record = parsed as Record<string, unknown>;

  for (const key of REQUIRED_BOOLEAN_KEYS) {
    if (typeof record[key] !== "boolean") {
      throw new Error(`Structure verification is missing required boolean field "${key}"`);
    }
  }
  for (const key of REQUIRED_STRING_KEYS) {
    if (typeof record[key] !== "string") {
      throw new Error(`Structure verification is missing required string field "${key}"`);
    }
  }
  if (
    !Array.isArray(record.failure_reasons) ||
    !record.failure_reasons.every((reason) => typeof reason === "string")
  ) {
    throw new Error('Structure verification "failure_reasons" must be a string array');
  }

  return {
    theme1_event_present: record.theme1_event_present as boolean,
    theme1_evidence: record.theme1_evidence as string,
    theme2_event_present: record.theme2_event_present as boolean,
    theme2_evidence: record.theme2_evidence as string,
    intersection_event_present: record.intersection_event_present as boolean,
    intersection_evidence: record.intersection_evidence as string,
    causal_connection_preserved: record.causal_connection_preserved as boolean,
    mere_keyword_mention: record.mere_keyword_mention as boolean,
    independent_story_split: record.independent_story_split as boolean,
    ending_is_unresolved_trigger: record.ending_is_unresolved_trigger as boolean,
    ending_evidence: record.ending_evidence as string,
    coincidence_or_unearned_introduction: record.coincidence_or_unearned_introduction as boolean,
    coincidence_evidence: record.coincidence_evidence as string,
    celebrity_pursues_protagonist: record.celebrity_pursues_protagonist as boolean,
    mutual_equal_footing_detected: record.mutual_equal_footing_detected as boolean,
    mutual_equal_footing_evidence: record.mutual_equal_footing_evidence as string,
    dialogue_conflict_present: record.dialogue_conflict_present as boolean,
    passed: record.passed as boolean,
    failure_reasons: record.failure_reasons as string[],
  };
}
