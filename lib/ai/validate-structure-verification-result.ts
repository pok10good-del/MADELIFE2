import type { StructureVerification } from "@/lib/ai/story-generation.types";

const MIN_EVIDENCE_LENGTH = 8;

function isTrivialEvidence(evidence: string): boolean {
  return evidence.replace(/\s+/g, "").length < MIN_EVIDENCE_LENGTH;
}

/**
 * The model's own "passed" field is never trusted directly — a verifier
 * can claim success carelessly. This recomputes passed from the individual
 * sub-checks so a single missing event or trivial evidence line always
 * fails the whole verification, regardless of what the model self-reported.
 */
export function recomputeStructureVerification(
  verification: StructureVerification
): StructureVerification {
  const reasons = [...verification.failure_reasons];

  const hardFailures: boolean[] = [];

  if (!verification.theme1_event_present || isTrivialEvidence(verification.theme1_evidence)) {
    hardFailures.push(true);
    reasons.push("theme1_event is not present or its evidence is trivial");
  }
  if (!verification.theme2_event_present || isTrivialEvidence(verification.theme2_evidence)) {
    hardFailures.push(true);
    reasons.push("theme2_event is not present or its evidence is trivial");
  }
  if (
    !verification.intersection_event_present ||
    isTrivialEvidence(verification.intersection_evidence)
  ) {
    hardFailures.push(true);
    reasons.push("intersection_event is not present or its evidence is trivial");
  }
  if (!verification.causal_connection_preserved) {
    hardFailures.push(true);
    reasons.push("causal_connection was not preserved in the generated content");
  }
  if (verification.mere_keyword_mention) {
    hardFailures.push(true);
    reasons.push("themes are only mentioned as keywords, not depicted as events");
  }
  if (verification.independent_story_split) {
    hardFailures.push(true);
    reasons.push("the two themes were written as independent, unconnected stories");
  }

  const passed = hardFailures.length === 0;

  return {
    ...verification,
    passed,
    failure_reasons: passed ? [] : Array.from(new Set(reasons)),
  };
}
