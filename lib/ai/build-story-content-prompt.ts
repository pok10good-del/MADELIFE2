import type { FusionPlan, ParsedStoryContent, StoryGenerationInput } from "@/lib/ai/story-generation.types";
import type { ChatPrompt } from "@/lib/ai/chat-prompt";
import { STORY_ENGINE_CORE_RULES } from "@/lib/ai/prompts/story-engine-rules";

export interface StoryContentRetryContext {
  previousContent: ParsedStoryContent;
  failureReasons: string[];
}

function buildSystemPrompt(): string {
  return [
    STORY_ENGINE_CORE_RULES,
    "",
    "[이번 단계의 역할: 본문 생성]",
    "결합 계획에 없는 새로운 주인공 인생을 임의로 만들지 않는다.",
    "theme1_event를 실제 장면으로 작성한다.",
    "theme2_event를 실제 장면으로 작성한다.",
    "intersection_event를 두 조각이 만나는 핵심 장면으로 작성한다.",
    "두 개의 독립된 단편처럼 분리하지 않는다.",
    "테마 이름을 단순히 언급하는 것으로 반영을 대신하지 않는다.",
    "어느 한 조각을 분위기나 배경으로만 소비하지 않는다.",
    "두 조각의 관계는 계획의 causal_connection과 일치해야 한다.",
    "",
    "[출력 형식]",
    "아래 형식을 정확히 지켜 제목과 본문을 생성한다.",
    "각 라벨은 마크다운 강조(별표, 굵게 등) 없이 줄 맨 앞에 그대로 작성한다.",
    "TITLE:",
    "CONTENT:",
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

export function buildStoryContentPrompt(
  input: StoryGenerationInput,
  plan: FusionPlan,
  retry?: StoryContentRetryContext
): ChatPrompt {
  const episodeYearSpan = input.targetAge - input.currentAge;

  const userLines = [
    "[입력 정보]",
    `현재 나이: ${input.currentAge}`,
    `목표 나이: ${input.targetAge}`,
    `이번 화 시간 범위: ${episodeYearSpan}년`,
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
    `이번 에피소드는 현재 나이(${input.currentAge}세)부터 목표 나이(${input.targetAge}세)까지, 정확히 ${episodeYearSpan}년 분량으로 작성한다.`
  );

  if (retry !== undefined) {
    userLines.push(
      "",
      "[이전 시도 보완 요청]",
      "직전 본문은 구조 검증에서 다음 이유로 통과하지 못했다. 전체를 새로 쓰지 말고, 아래에서 지적된 누락 부분만 보완하여 다시 작성하라. 이미 통과한 부분은 그대로 유지한다.",
      `실패 이유: ${retry.failureReasons.join("; ")}`,
      "",
      "직전 본문:",
      `TITLE: ${retry.previousContent.title}`,
      `CONTENT: ${retry.previousContent.content}`
    );
  }

  return {
    system: buildSystemPrompt(),
    user: userLines.join("\n"),
  };
}
