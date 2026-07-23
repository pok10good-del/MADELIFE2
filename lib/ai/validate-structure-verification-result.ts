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
  if (!verification.ending_is_unresolved_trigger || isTrivialEvidence(verification.ending_evidence)) {
    hardFailures.push(true);
    reasons.push(
      "the ending did not depict a concrete, unresolved cliffhanger trigger (either no trigger occurred, or it was fully resolved within the episode)"
    );
  }
  if (verification.coincidence_or_unearned_introduction) {
    hardFailures.push(true);
    reasons.push(
      `a new character or the intersection event was introduced through unexplained coincidence, or the protagonist received special treatment/interest without an established reason: ${verification.coincidence_evidence}`
    );
  }
  if (!verification.celebrity_pursues_protagonist) {
    hardFailures.push(true);
    reasons.push(
      "the celebrity-romance theme was present but the celebrity was not depicted pursuing the protagonist more actively than a mutual, symmetric attraction"
    );
  }
  if (verification.mutual_equal_footing_detected) {
    hardFailures.push(true);
    reasons.push(
      `the relationship was written as a mutual, trusting, equal-footing partnership instead of a lopsided one where the celebrity wants/longs for the protagonist more: ${verification.mutual_equal_footing_evidence}`
    );
  }
  if (!verification.dialogue_conflict_present) {
    hardFailures.push(true);
    reasons.push(
      "no scene contained concrete dialogue depicting rejection, lingering feelings, misunderstanding, hesitation, or conflict"
    );
  }

  const passed = hardFailures.length === 0;

  return {
    ...verification,
    passed,
    failure_reasons: passed ? [] : Array.from(new Set(reasons)),
  };
}
