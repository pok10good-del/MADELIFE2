export interface StoryGenerationInput {
  userId: string;
  storyId: string;
  currentAge: number;
  targetAge: number;
  selectedThemes: string[];
  lifeSummary: string;
  regretPoint: string;
}

export interface StoryGenerationResult {
  title: string;
  content: string;
  startAge: number;
  endAge: number;
  themes: string[];
}

/**
 * Fusion plan produced by the planning stage before any prose is written.
 * Field names mirror the exact JSON contract sent to/from the OpenAI request
 * so the wire format and the internal type never drift apart.
 */
export interface FusionPlan {
  theme1: string;
  theme2: string;
  theme1_role: string;
  theme2_role: string;
  causal_connection: string;
  theme1_event: string;
  theme2_event: string;
  intersection_event: string;
  ending_effect: string;
}

export interface ParsedStoryContent {
  title: string;
  content: string;
}

/**
 * Structured self-check comparing generated prose against the fusion plan.
 * Field names mirror the exact JSON contract requested from the model.
 */
export interface StructureVerification {
  theme1_event_present: boolean;
  theme1_evidence: string;
  theme2_event_present: boolean;
  theme2_evidence: string;
  intersection_event_present: boolean;
  intersection_evidence: string;
  causal_connection_preserved: boolean;
  mere_keyword_mention: boolean;
  independent_story_split: boolean;
  passed: boolean;
  failure_reasons: string[];
}
