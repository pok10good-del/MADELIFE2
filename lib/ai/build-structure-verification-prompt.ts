import type { FusionPlan, ParsedStoryContent } from "@/lib/ai/story-generation.types";
import type { ChatPrompt } from "@/lib/ai/chat-prompt";

const VERIFICATION_JSON_SHAPE = [
  "{",
  '  "theme1_event_present": boolean,',
  '  "theme1_evidence": "본문 속 실제 사건 요약",',
  '  "theme2_event_present": boolean,',
  '  "theme2_evidence": "본문 속 실제 사건 요약",',
  '  "intersection_event_present": boolean,',
  '  "intersection_evidence": "두 조각이 결합된 실제 장면 요약",',
  '  "causal_connection_preserved": boolean,',
  '  "mere_keyword_mention": boolean,',
  '  "independent_story_split": boolean,',
  '  "passed": boolean,',
  '  "failure_reasons": ["실패 이유 문자열 배열, 없으면 빈 배열"]',
  "}",
].join("\n");

function buildSystemPrompt(): string {
  return [
    "당신은 Story Engine의 구조 검증관이다. 소설을 평가하지 않고, 결합 계획과 본문을 대조하여 사실 여부만 판정한다.",
    "",
    "[검증 규칙]",
    "단어가 등장했다는 이유만으로 통과시키지 않는다.",
    "evidence에는 반드시 본문에서 실제로 일어난 행동, 선택, 갈등 또는 결과를 인용하듯 요약해야 한다. 비어 있거나 추상적인 evidence는 허용하지 않는다.",
    "본문이 테마 이름만 언급하고 실제 사건으로 다루지 않았다면 mere_keyword_mention을 true로 표시한다.",
    "본문이 두 조각을 각각 독립된 이야기로 분리했다면 independent_story_split을 true로 표시한다.",
    "결과는 순수 JSON 객체 하나로만 출력한다. 다른 설명이나 코드펜스를 포함하지 않는다.",
    "출력 JSON은 반드시 다음 키를 모두 포함해야 한다:",
    VERIFICATION_JSON_SHAPE,
  ].join("\n");
}

function formatPlan(plan: FusionPlan): string {
  return [
    `theme1: ${plan.theme1}`,
    `theme2: ${plan.theme2}`,
    `causal_connection: ${plan.causal_connection}`,
    `theme1_event (계획): ${plan.theme1_event}`,
    `theme2_event (계획): ${plan.theme2_event}`,
    `intersection_event (계획): ${plan.intersection_event}`,
  ].join("\n");
}

export function buildStructureVerificationPrompt(
  plan: FusionPlan,
  content: ParsedStoryContent
): ChatPrompt {
  const userLines = [
    "[결합 계획]",
    formatPlan(plan),
    "",
    "[생성된 본문]",
    `TITLE: ${content.title}`,
    `CONTENT: ${content.content}`,
    "",
    "위 본문이 결합 계획을 실제로 충족하는지 JSON으로 검증하라.",
  ];

  return {
    system: buildSystemPrompt(),
    user: userLines.join("\n"),
  };
}
