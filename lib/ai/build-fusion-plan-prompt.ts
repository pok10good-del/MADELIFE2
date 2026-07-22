import type { StoryGenerationInput } from "@/lib/ai/story-generation.types";
import type { ChatPrompt } from "@/lib/ai/chat-prompt";
import { STORY_ENGINE_CORE_RULES } from "@/lib/ai/prompts/story-engine-rules";

export interface FusionPlanRetryContext {
  previousPlanJson: string;
  failureReasons: string[];
}

const PLAN_JSON_SHAPE = [
  "{",
  '  "theme1": "사용자가 선택한 첫 번째 조각 원문",',
  '  "theme2": "사용자가 선택한 두 번째 조각 원문",',
  '  "theme1_role": "첫 번째 조각이 주인공 인생에서 담당하는 역할",',
  '  "theme2_role": "두 번째 조각이 주인공 인생에서 담당하는 역할",',
  '  "causal_connection": "두 조각이 원인과 결과로 이어지는 구체적인 관계",',
  '  "theme1_event": "본문에 반드시 등장할 첫 번째 조각의 구체적인 사건",',
  '  "theme2_event": "본문에 반드시 등장할 두 번째 조각의 구체적인 사건",',
  '  "intersection_event": "두 조각이 직접 충돌하거나 결합되는 핵심 사건",',
  '  "ending_effect": "두 조각의 결합이 이번 화의 마지막에 남기는 변화"',
  "}",
].join("\n");

function buildSystemPrompt(): string {
  return [
    STORY_ENGINE_CORE_RULES,
    "",
    "[이번 단계의 역할: 결합 계획 수립]",
    "지금은 소설 문장을 작성하는 단계가 아니다. 두 조각을 하나의 인생으로 결합하는 계획을 JSON으로만 출력한다.",
    "다른 설명, 마크다운 코드펜스, 서두 인사말 없이 순수 JSON 객체 하나만 출력한다.",
    "출력 JSON은 반드시 다음 키를 모두 포함해야 한다:",
    PLAN_JSON_SHAPE,
    "",
    "[금지]",
    '"가족과 성공이 함께 중요해진다", "불행을 극복하여 성공한다", "스포츠와 가족 사이에서 성장한다" 와 같이 두 조각을 그냥 나열하기만 하는 모호한 계획은 금지한다.',
    "causal_connection과 intersection_event에는 누가, 무엇을, 왜 선택하고, 그 결과 무엇을 잃거나 얻는지가 구체적으로 드러나야 한다.",
  ].join("\n");
}

export function buildFusionPlanPrompt(
  input: StoryGenerationInput,
  retry?: FusionPlanRetryContext
): ChatPrompt {
  const [theme1, theme2] = input.selectedThemes;

  const userLines = [
    "[사용자 입력]",
    `theme1 (첫 번째 선택 조각): ${theme1}`,
    `theme2 (두 번째 선택 조각): ${theme2 ?? ""}`,
    `현재 나이: ${input.currentAge}`,
    `목표 나이: ${input.targetAge}`,
    `인생 요약: ${input.lifeSummary}`,
  ];
  if (input.regretPoint.trim().length > 0) {
    userLines.push(`가장 후회되는 지점: ${input.regretPoint}`);
  }
  userLines.push("", "위 두 조각을 결합한 계획을 JSON으로 생성하라.");

  if (retry !== undefined) {
    userLines.push(
      "",
      "[이전 시도 실패]",
      "직전에 생성한 계획은 다음과 같은 이유로 반려되었다. 같은 문제가 반복되지 않도록 계획 전체를 다시 구체적으로 작성하라.",
      `이전 계획: ${retry.previousPlanJson}`,
      `실패 이유: ${retry.failureReasons.join("; ")}`
    );
  }

  return {
    system: buildSystemPrompt(),
    user: userLines.join("\n"),
  };
}
