import type { FusionPlan, ParsedStoryContent, StoryGenerationInput } from "@/lib/ai/story-generation.types";
import type { ChatPrompt } from "@/lib/ai/chat-prompt";
import { STORY_ENGINE_CORE_RULES } from "@/lib/ai/prompts/story-engine-rules";
import { CHOICE_DICTIONARY } from "@/lib/ai/prompts/choice-dictionary";

export const STORY_PART_TARGET_CHARS = 1200;

interface StoryPartSpec {
  planField: "theme1_event" | "theme2_event" | "intersection_event" | "ending_effect";
  focusLabel: string;
}

const STORY_PART_SPECS: StoryPartSpec[] = [
  { planField: "theme1_event", focusLabel: "첫 번째 조각(theme1)이 실제 사건으로 시작되는 도입부" },
  { planField: "theme2_event", focusLabel: "두 번째 조각(theme2)이 실제 사건으로 전개되는 부분" },
  { planField: "intersection_event", focusLabel: "두 조각이 직접 만나거나 충돌하는 핵심 장면" },
  { planField: "ending_effect", focusLabel: "두 조각의 결합이 이번 화 마지막에 남기는 변화와 마무리" },
];

export const STORY_PART_COUNT = STORY_PART_SPECS.length;

export interface StoryContentRetryContext {
  previousContent: ParsedStoryContent;
  failureReasons: string[];
}

function buildSystemPrompt(partIndex: number): string {
  const spec = STORY_PART_SPECS[partIndex];
  const isFirstPart = partIndex === 0;
  const isLastPart = partIndex === STORY_PART_SPECS.length - 1;

  return [
    STORY_ENGINE_CORE_RULES,
    "",
    CHOICE_DICTIONARY,
    "",
    `[이번 단계의 역할: 본문 생성 - ${partIndex + 1}/${STORY_PART_SPECS.length}파트]`,
    "이번 화(에피소드)는 4개의 파트로 나뉘어 순서대로 작성되며, 네 파트가 이어져 하나의 화를 완성한다.",
    `이번에 작성할 파트는 "${spec.focusLabel}"에 해당한다.`,
    `이번 파트는 약 ${STORY_PART_TARGET_CHARS}자 내외 분량으로 작성한다.`,
    isFirstPart
      ? "이전 파트가 없으므로 이번 화의 도입부로 자연스럽게 시작한다."
      : "[이전 파트까지의 내용]에 곧바로 이어지는 장면이다. 인물과 설정을 처음부터 다시 설명하지 않고 자연스럽게 이어서 작성한다.",
    isLastPart
      ? "이번 파트는 화의 마지막 파트이므로 자연스럽게 여운을 남기며 마무리한다."
      : "이번 파트가 끝나도 이야기는 다음 파트로 계속되므로 화 전체를 마무리 짓지 않는다.",
    "결합 계획에 없는 새로운 주인공 인생을 임의로 만들지 않는다.",
    "네 파트를 합쳤을 때 두 개의 독립된 단편처럼 분리되어서는 안 된다.",
    "테마 이름을 단순히 언급하는 것으로 반영을 대신하지 않는다.",
    "어느 한 조각을 분위기나 배경으로만 소비하지 않는다.",
    "두 조각의 관계는 계획의 causal_connection과 일치해야 한다.",
    "",
    "[출력 형식]",
    "각 라벨은 마크다운 강조(별표, 굵게 등) 없이 줄 맨 앞에 그대로 작성한다.",
    ...(isFirstPart ? ["TITLE: (화 전체를 대표하는 제목, 1회만 작성)", "CONTENT:"] : ["CONTENT:"]),
  ].join("\n");
}

function formatPlan(plan: FusionPlan): string {
  return [
    `theme1: ${plan.theme1}`,
    `theme2: ${plan.theme2}`,
    `theme1_role: ${plan.theme1_role}`,
    `theme2_role: ${plan.theme2_role}`,
    `causal_connection: ${plan.causal_connection}`,
    `theme1_event: ${plan.theme1_event}`,
    `theme2_event: ${plan.theme2_event}`,
    `intersection_event: ${plan.intersection_event}`,
    `ending_effect: ${plan.ending_effect}`,
  ].join("\n");
}

export function buildStoryContentPartPrompt(
  input: StoryGenerationInput,
  plan: FusionPlan,
  partIndex: number,
  previousPartsContent: string[],
  retry?: StoryContentRetryContext
): ChatPrompt {
  const episodeYearSpan = input.targetAge - input.currentAge;
  const spec = STORY_PART_SPECS[partIndex];

  const userLines = [
    "[입력 정보]",
    `현재 나이: ${input.currentAge}`,
    `목표 나이: ${input.targetAge}`,
    `이번 화 전체 시간 범위: ${episodeYearSpan}년 (4개 파트로 나누어 표현)`,
    `선택한 테마: ${input.selectedThemes.join(", ")}`,
    `이전 화 상태(인생 요약): ${input.lifeSummary}`,
  ];
  if (input.regretPoint.trim().length > 0) {
    userLines.push(`가장 후회되는 지점: ${input.regretPoint}`);
  }
  userLines.push(
    "",
    "[이번 생성에 사용할 결합 계획]",
    formatPlan(plan),
    "",
    `이번 파트가 반드시 다루어야 할 사건 (${spec.focusLabel}): ${plan[spec.planField]}`
  );

  if (previousPartsContent.length > 0) {
    userLines.push("", "[이전 파트까지의 내용]", previousPartsContent.join("\n\n"));
  }

  if (retry !== undefined) {
    userLines.push(
      "",
      "[이전 시도 보완 요청]",
      "직전 화 전체는 구조 검증에서 다음 이유로 통과하지 못했다. 같은 문제가 이번 파트에서 반복되지 않도록 유의하여 작성한다.",
      `실패 이유: ${retry.failureReasons.join("; ")}`
    );
  }

  return {
    system: buildSystemPrompt(partIndex),
    user: userLines.join("\n"),
  };
}
