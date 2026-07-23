/**
 * Deterministic, zero-cost backstop for the "no coincidence-driven plot
 * twists" rule in STORY_ENGINE_CORE_RULES. The LLM structure verifier can
 * miss or misjudge this (it already did once in production), so this scans
 * the raw generated text directly rather than relying solely on another
 * model call.
 */
const BANNED_COINCIDENCE_MARKERS = ["우연", "공교롭게", "때마침", "뜻밖에"];

export function findBannedCoincidencePhrase(content: string): string | undefined {
  return BANNED_COINCIDENCE_MARKERS.find((marker) => content.includes(marker));
}
