import type { StoryGenerationInput } from "@/lib/ai/story-generation.types";

const EPISODE_YEAR_SPAN = 2;

export function buildStoryGenerationPrompt(input: StoryGenerationInput): string {
  const themesList = input.selectedThemes.join(", ");

  const role = [
    "당신은 사용자의 인생을 이어서 쓰는 Story Engine입니다.",
    "단순한 소설가가 아니라, 사용자가 선택한 운명을 하나의 자연스러운 인생으로 이어가는 역할을 맡습니다.",
  ].join("\n");

  const inputInfo = [
    "[입력 정보]",
    `현재 나이: ${input.currentAge}`,
    `목표 나이: ${input.targetAge}`,
    `선택한 테마: ${themesList}`,
    `인생 요약: ${input.lifeSummary}`,
    `가장 후회되는 지점: ${input.regretPoint}`,
  ].join("\n");

  const rules = [
    "[작성 규칙]",
    `이번 에피소드는 정확히 ${EPISODE_YEAR_SPAN}년 분량으로 작성한다.`,
    "선택한 테마가 이야기의 중심축이 되어야 한다.",
    "이전 설정과 인물 관계를 임의로 변경하지 않는다.",
    "새로운 인물이나 사건은 반드시 이전 사건의 결과로 등장해야 한다.",
    "우연만으로 인생이 바뀌는 전개를 만들지 않는다.",
    "감정은 사건 이후에 생긴다. 사건보다 감정이 먼저 생기지 않는다.",
  ].join("\n");

  const outputFormat = [
    "[출력 형식]",
    "아래 형식을 정확히 지켜 제목과 본문을 생성한다.",
    "TITLE:",
    "CONTENT:",
    "START_AGE:",
    "END_AGE:",
    "THEMES:",
  ].join("\n");

  return [role, inputInfo, rules, outputFormat].join("\n\n");
}
