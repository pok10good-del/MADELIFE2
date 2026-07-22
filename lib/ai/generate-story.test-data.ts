import type { StoryGenerationInput } from "@/lib/ai/story-generation.types";

export const VALID_STORY_INPUT: StoryGenerationInput = {
  userId: "user-mock-001",
  storyId: "story-mock-001",
  currentAge: 29,
  targetAge: 31,
  selectedThemes: ["도전", "성장"],
  lifeSummary:
    "스물아홉 살까지 그는 안정적인 회사원으로 살아왔다. 매일 같은 시간에 출근하고 같은 자리에 앉아 반복되는 업무를 처리하며 하루하루를 보냈다. " +
    "겉으로는 무난한 삶이었지만 마음 한구석에는 늘 채워지지 않는 갈증이 있었다. 학창 시절 좋아했던 그림과 글쓰기는 어느새 취미로도 남지 않았고, " +
    "그는 자신이 원했던 삶과 지금의 삶 사이의 거리를 실감하고 있었다. 서른을 앞두고 그는 처음으로 스스로에게 솔직한 질문을 던지기 시작했다. " +
    "지금 이대로 나이 들어가는 것이 정말 괜찮은가. 그는 오랜 고민 끝에 작은 변화를 시도하기로 결심했다. 매일 저녁 한 시간씩 그림을 다시 그리기 시작했고, " +
    "주말에는 짧은 글을 써서 사람들과 나누었다. 처음에는 서툴렀지만 점차 자신만의 속도로 실력이 붙었고, 무엇보다 오랜만에 느끼는 성취감이 그를 다시 움직이게 만들었다.",
  regretPoint: "좋아하던 그림과 글쓰기를 회사 생활을 이유로 너무 오래 미뤄둔 것",
};

export const INVALID_STORY_INPUT: StoryGenerationInput = {
  userId: "user-mock-002",
  storyId: "story-mock-002",
  currentAge: 31,
  targetAge: 29,
  selectedThemes: [],
  lifeSummary: "너무 짧은 인생 요약이라 검증에 실패해야 한다.",
  regretPoint: "",
};
