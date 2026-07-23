import type { StoryGenerationInput } from "@/lib/ai/story-generation.types";
import type { ChatPrompt } from "@/lib/ai/chat-prompt";
import {
  CELEBRITY_PURSUIT_REMINDER,
  COINCIDENCE_GUARD_REMINDER,
  CONTINUITY_REPEAT_GUARD_REMINDER,
  STORY_ENGINE_CORE_RULES,
} from "@/lib/ai/prompts/story-engine-rules";
import { CHOICE_DICTIONARY } from "@/lib/ai/prompts/choice-dictionary";

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
  '  "intersection_event": "두 조각이 직접 충돌하거나 결합되는 핵심 사건이면서, 동시에 다음 화로 이어질 새로운 사건의 조짐을 암시하는 사건",',
  '  "ending_effect": "암시된 사건의 트리거(계기)가 실제로 발생하며 이야기가 고조된 채로 끝나는 지점 — 이번 화 안에서 해결되거나 완결되지 않아야 하며, 다음 화가 곧바로 이어받을 수 있는 클리프행어여야 한다"',
  "}",
].join("\n");

function buildSystemPrompt(selectedThemes: string[]): string {
  const hasCelebrityTheme = selectedThemes.includes("연예인과의 사랑");

  return [
    STORY_ENGINE_CORE_RULES,
    "",
    CHOICE_DICTIONARY,
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
    "인생 요약에 이미 등장한 사건(첫 만남, 첫 고백, 능력을 처음 얻는 순간, 첫 성취 등)을 이번 계획에서 또다시 처음 벌어지는 사건으로 설계하지 않는다. 이번 계획의 네 사건은 인생 요약 이후, 현재 나이부터 목표 나이 사이에 새롭게 벌어지는 사건이어야 한다.",
    "ending_effect를 이번 화를 깔끔하게 마무리짓는 결말로 설계하지 않는다. 반드시 다음 화로 이어질 새로운 사건이 막 시작되거나 위기가 고조된 채로 끝나는 클리프행어로 설계한다. 좋은 사건이든 나쁜 사건이든 상관없다.",
    "만약 인생 요약 자체가 클리프행어(어떤 사건이 막 시작되거나 고조된 채 끝난 상태)로 끝났다면, 이번 계획의 theme1_event는 그 사건이 실제로 전개되는 것에서 시작해야 한다.",
    "theme1_event, theme2_event, intersection_event는 서로 다른 장소와 상황에서 벌어지는 별개의 사건으로 설계한다. intersection_event를 theme2_event와 같은 성격의 상황(예: 둘 다 공개 행사, 둘 다 우연한 만남)을 반복하는 방식으로 설계하지 않는다.",
    "",
    ...(hasCelebrityTheme ? [CELEBRITY_PURSUIT_REMINDER, ""] : []),
    COINCIDENCE_GUARD_REMINDER,
    "",
    CONTINUITY_REPEAT_GUARD_REMINDER,
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
    `인생 요약 (이미 실제로 벌어진 과거의 사건 — 이번 계획에서 반복하지 말고 그 이후를 설계할 것): ${input.lifeSummary}`,
  ];
  if (input.regretPoint.trim().length > 0) {
    userLines.push(`가장 후회되는 지점: ${input.regretPoint}`);
  }
  userLines.push(
    "",
    "위 인생 요약의 마지막 상태(이미 사귀는 중인지, 결혼했는지, 능력을 이미 얻었는지, 이미 어떤 성취를 이루었는지)를 먼저 파악한 뒤, 그 상태를 그대로 이어받아 그 다음에 벌어질 새로운 사건으로만 이번 화의 계획을 세워라.",
    "위 두 조각을 결합한 계획을 JSON으로 생성하라."
  );

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
    system: buildSystemPrompt(input.selectedThemes),
    user: userLines.join("\n"),
  };
}
