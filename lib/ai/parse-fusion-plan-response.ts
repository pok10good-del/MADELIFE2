import type { FusionPlan } from "@/lib/ai/story-generation.types";

const REQUIRED_KEYS: (keyof FusionPlan)[] = [
  "theme1",
  "theme2",
  "theme1_role",
  "theme2_role",
  "causal_connection",
  "theme1_event",
  "theme2_event",
  "intersection_event",
  "ending_effect",
];

function extractJsonObject(response: string): string {
  const fenced = response.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }
  const start = response.indexOf("{");
  const end = response.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in fusion plan response");
  }
  return response.slice(start, end + 1);
}

export function parseFusionPlanResponse(response: string): FusionPlan {
  const jsonText = extractJsonObject(response);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    throw new Error(
      `Failed to parse fusion plan JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Fusion plan response is not a JSON object");
  }

  const record = parsed as Record<string, unknown>;
  for (const key of REQUIRED_KEYS) {
    if (typeof record[key] !== "string") {
      throw new Error(`Fusion plan is missing required string field "${key}"`);
    }
  }

  return {
    theme1: record.theme1 as string,
    theme2: record.theme2 as string,
    theme1_role: record.theme1_role as string,
    theme2_role: record.theme2_role as string,
    causal_connection: record.causal_connection as string,
    theme1_event: record.theme1_event as string,
    theme2_event: record.theme2_event as string,
    intersection_event: record.intersection_event as string,
    ending_effect: record.ending_effect as string,
  };
}
