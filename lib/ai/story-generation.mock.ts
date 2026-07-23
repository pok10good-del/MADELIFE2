export const VALID_STORY_RESPONSE = `TITLE:
스물아홉, 다시 시작된 길
CONTENT:
그해 봄, 그는 오랫동안 미뤄왔던 결정을 마침내 내렸다.
회사를 나와 작은 작업실을 얻고, 처음부터 다시 배우기 시작했다.
주변 사람들은 걱정했지만 그는 물러서지 않았다.
여름이 지나고 가을이 올 때쯤, 첫 결과물이 나왔다.
완벽하지는 않았지만, 그것은 온전히 그의 것이었다.
겨울이 되자 그는 처음으로 스스로의 선택에 확신을 가졌다.
THEMES:
도전, 성장`;

export const INVALID_STORY_RESPONSE = `TITLE:
스물아홉, 다시 시작된 길
CONTENT:
그해 봄, 그는 오랫동안 미뤄왔던 결정을 마침내 내렸다.
회사를 나와 작은 작업실을 얻고, 처음부터 다시 배우기 시작했다.
주변 사람들은 걱정했지만 그는 물러서지 않았다.
THEMES:
도전, 성장`;

/**
 * Mock responses for the three-stage pipeline (fusion plan -> content ->
 * structure verification), in call order, matching VALID_STORY_INPUT's
 * selectedThemes ["도전", "성장"]. Consumed in sequence by MockAIProvider.
 */
export const VALID_FUSION_PLAN_RESPONSE = JSON.stringify({
  theme1: "도전",
  theme2: "성장",
  theme1_role: "주인공이 안정된 회사원의 삶을 벗어나게 만드는 계기이자 원인",
  theme2_role: "도전의 결과로 주인공이 얻게 되는 변화이자 결실",
  causal_connection:
    "그는 안정된 회사를 그만두는 도전을 감행했기 때문에 매일 실패에 대한 두려움을 견뎌야 했고, 그 과정에서 실력과 확신이 조금씩 자라났다.",
  theme1_event: "회사를 그만두고 작은 작업실을 얻어 처음부터 그림을 다시 배우기 시작한 사건",
  theme2_event: "밤새 작업한 결과물을 완성해 스스로의 선택에 대한 확신을 갖게 된 사건",
  intersection_event:
    "전시 마감을 앞둔 밤, 실패할지도 모른다는 두려움과 마주한 순간 그는 도전을 포기하는 대신 밤을 새워 작업을 완성시켰고 그 안에서 성장을 확인했다",
  ending_effect: "그는 더 이상 안정만을 좇지 않고, 도전을 통해 성장하는 사람으로 스스로를 규정하게 되었다",
});

export const VALID_STORY_CONTENT_RESPONSE = `TITLE:
스물아홉, 다시 시작된 길
CONTENT:
그해 봄, 그는 오랫동안 미뤄왔던 결정을 마침내 내렸다.
회사를 나와 작은 작업실을 얻고, 처음부터 다시 배우기 시작했다.
주변 사람들은 걱정했지만 그는 물러서지 않았다.
전시 마감을 앞둔 밤, 그는 실패할지도 모른다는 두려움과 마주했다.
그는 도전을 포기하는 대신 밤을 새워 작업을 완성시켰다.
완성된 결과물을 마주한 순간, 그는 처음으로 스스로의 선택에 확신을 가졌다.`;

export const VALID_STRUCTURE_VERIFICATION_RESPONSE = JSON.stringify({
  theme1_event_present: true,
  theme1_evidence: "회사를 나와 작업실을 얻고 처음부터 다시 배우기 시작했다",
  theme2_event_present: true,
  theme2_evidence: "완성된 결과물을 마주한 순간 스스로의 선택에 확신을 가졌다",
  intersection_event_present: true,
  intersection_evidence: "마감을 앞둔 밤 두려움과 마주하고도 밤을 새워 작업을 완성시켰다",
  causal_connection_preserved: true,
  mere_keyword_mention: false,
  independent_story_split: false,
  ending_is_unresolved_trigger: true,
  ending_evidence: "완성된 결과물을 마주한 순간 스스로의 선택에 확신을 가졌다",
  coincidence_or_unearned_introduction: false,
  coincidence_evidence: "회사를 그만둔 자신의 선택으로 전시 기회를 얻었으며 우연이 개입하지 않았다",
  celebrity_pursues_protagonist: true,
  mutual_equal_footing_detected: false,
  mutual_equal_footing_evidence: "이번 화는 연예인과의 사랑 테마가 선택되지 않았다",
  dialogue_conflict_present: true,
  passed: true,
  failure_reasons: [],
});

export const VALID_STORY_GENERATION_SEQUENCE: string[] = [
  VALID_FUSION_PLAN_RESPONSE,
  VALID_STORY_CONTENT_RESPONSE,
  VALID_STRUCTURE_VERIFICATION_RESPONSE,
];
