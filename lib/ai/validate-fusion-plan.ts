import type { FusionPlan } from "@/lib/ai/story-generation.types";

export type FusionPlanValidationResult =
  | { valid: true; errors: [] }
  | { valid: false; errors: string[] };

const MIN_ROLE_LENGTH = 8;
const MIN_EVENT_LENGTH = 12;
const MIN_CAUSAL_LENGTH = 20;

/**
 * Known vague plans that name both themes without ever connecting them.
 * Matched loosely (whitespace-insensitive substring) since the model may
 * reproduce these almost verbatim when it defaults to a generic summary.
 */
const BANNED_VAGUE_PHRASES = [
  "가족과성공이함께중요해진다",
  "불행을극복하여성공한다",
  "스포츠와가족사이에서성장한다",
];

function normalize(value: string): string {
  return value.replace(/\s+/g, "");
}

function isVague(value: string): boolean {
  const normalized = normalize(value);
  return BANNED_VAGUE_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function validateFusionPlan(plan: FusionPlan): FusionPlanValidationResult {
  const errors: string[] = [];

  if (normalize(plan.theme1_role).length < MIN_ROLE_LENGTH) {
    errors.push("theme1_role is too short to describe a concrete role");
  }
  if (normalize(plan.theme2_role).length < MIN_ROLE_LENGTH) {
    errors.push("theme2_role is too short to describe a concrete role");
  }
  if (normalize(plan.theme1_event).length < MIN_EVENT_LENGTH) {
    errors.push("theme1_event is too short to describe a concrete scene");
  }
  if (normalize(plan.theme2_event).length < MIN_EVENT_LENGTH) {
    errors.push("theme2_event is too short to describe a concrete scene");
  }
  if (normalize(plan.intersection_event).length < MIN_EVENT_LENGTH) {
    errors.push("intersection_event is too short to describe a concrete scene");
  }
  if (normalize(plan.ending_effect).length < MIN_ROLE_LENGTH) {
    errors.push("ending_effect is too short to describe a concrete change");
  }
  if (normalize(plan.causal_connection).length < MIN_CAUSAL_LENGTH) {
    errors.push("causal_connection is too short or too abstract");
  }
  if (isVague(plan.causal_connection) || isVague(plan.intersection_event)) {
    errors.push(
      "causal_connection or intersection_event matches a known vague/generic plan pattern"
    );
  }

  if (errors.length === 0) {
    return { valid: true, errors: [] };
  }
  return { valid: false, errors };
}
