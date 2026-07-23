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
  '  "ending_is_unresolved_trigger": boolean,',
  '  "ending_evidence": "마지막 부분에서 실제로 발생한 트리거 사건 요약",',
  '  "coincidence_or_unearned_introduction": boolean,',
  '  "coincidence_evidence": "새 인물/사건이 어떻게 등장했는지, 또는 왜 특별한 호감·대우를 받았는지 요약",',
  '  "celebrity_pursues_protagonist": boolean,',
  '  "mutual_equal_footing_detected": boolean,',
  '  "mutual_equal_footing_evidence": "관계가 대등한 동반자 관계로 그려졌는지, 혹은 연예인 쪽이 더 원하는 기울어진 관계로 그려졌는지 요약",',
  '  "dialogue_conflict_present": boolean,',
  '  "passed": boolean,',
  '  "failure_reasons": ["실패 이유 문자열 배열, 없으면 빈 배열"]',
  "}",
].join("\n");

function buildSystemPrompt(hasCelebrityTheme: boolean): string {
  return [
    "당신은 Story Engine의 구조 검증관이다. 소설을 평가하지 않고, 결합 계획과 본문을 대조하여 사실 여부만 판정한다.",
    "",
    "[검증 규칙]",
    "단어가 등장했다는 이유만으로 통과시키지 않는다.",
    "evidence에는 반드시 본문에서 실제로 일어난 행동, 선택, 갈등 또는 결과를 인용하듯 요약해야 한다. 비어 있거나 추상적인 evidence는 허용하지 않는다.",
    "본문이 테마 이름만 언급하고 실제 사건으로 다루지 않았다면 mere_keyword_mention을 true로 표시한다.",
    "본문이 두 조각을 각각 독립된 이야기로 분리했다면 independent_story_split을 true로 표시한다.",
    "",
    "[엔딩 검증]",
    "본문의 마지막 부분을 확인하라. ending_is_unresolved_trigger는, 결합 계획의 intersection_event에서 암시된 사건의 트리거(계기)가 마지막 부분에서 실제로 구체적인 사건으로 발생했고, 동시에 그 사건이 이번 화 안에서 해결되거나 완결되지 않은 채로 끝났을 때만 true로 표시한다.",
    "마지막 부분이 트리거 없이 그냥 인물의 감정이나 다짐, 걱정만으로 끝나거나, 반대로 사건이 이번 화 안에서 깔끔하게 해결/완결되어 버렸다면 ending_is_unresolved_trigger를 false로 표시하고 ending_evidence에 실제로 마지막에 무슨 일이 벌어졌는지(또는 왜 트리거가 없는지) 요약한다.",
    "",
    "[대사 검증]",
    "본문 전체에서 인물의 거절, 미련, 오해, 망설임, 갈등 중 하나 이상이 드러나는 구체적인 대사 장면이 최소 한 곳 이상 있는지 확인한다. 있다면 dialogue_conflict_present를 true로, 모든 대화가 우호적이고 매끄럽기만 하다면 false로 표시한다.",
    "",
    "[우연 도입 및 특혜 검증]",
    '본문에서 두 조각이 교차하는 사건이나 새로운 핵심 인물이 "우연히", "공교롭게도", "때마침", "뜻밖에"처럼 인과관계 없는 우연으로 등장했다면 coincidence_or_unearned_introduction을 true로 표시한다.',
    "주인공이 특별한 이유 제시 없이 상대로부터 과도한 호감이나 특별 대우를 즉시 받는다면(예: 처음 만난 자리에서 아무 근거 없이 곧바로 저녁 식사에 초대되거나 깊은 호감을 표현받는 경우) 이 역시 true로 표시한다.",
    "반대로 이전 사건(주인공의 성과, 평판, 소개, 요청 등)이 본문 안에서 구체적으로 먼저 제시되고 그 결과로 만남과 호감이 자연스럽게 이어졌다면 false로 표시한다.",
    "",
    hasCelebrityTheme
      ? [
          "[연예인과의 사랑 검증 — 이번 화는 해당 테마가 선택됨]",
          "본문에서 연예인 역할 인물이 주인공보다 먼저 다가가거나, 먼저 연락하거나, 거리를 두는 주인공에게 계속 다가가는 등 더 적극적으로 구애하는 모습이 화 전체에 걸쳐 반복적으로 드러나는지 확인한다. 도입부에 한 번 등장하고 이후로는 대등해진다면 부족한 것이다.",
          "두 사람이 대등하게 서로 동시에 호감을 느끼는 것으로만 그려졌다면(연예인 쪽의 더 적극적인 행동이 반복적으로 없다면) celebrity_pursues_protagonist를 false로 표시한다.",
          '본문이 두 사람의 관계를 "서로 신뢰하고 대등한 입장에서 함께 결정하는" 균형 잡힌 동반자 관계로 그렸다면(예: 위기나 스캔들에 함께 침착하게 대응하며 서로 똑같이 안심시키는 장면, 어느 한쪽이 더 원하거나 더 절박해하는 기색 없이 서로 동등하게 상황을 주도하는 장면) mutual_equal_footing_detected를 true로 표시한다.',
          '특히 "우리가 함께라면 어떤 어려움/문제도 이겨낼/해결할 수 있을 거예요", "서로 믿으니까 괜찮아요", "우리 같이 힘내요"처럼 두 사람이 동등한 위치에서 서로를 담담하게 다독이거나 안심시키는 대사가 한 번이라도 등장하면 mutual_equal_footing_detected를 true로 표시한다 — 이런 대사는 실제로 반려된 전례가 있는 패턴이다.',
          "반대로 본문 전체에서 연예인 쪽이 지속적으로 더 원하고, 더 그리워하고, 집착에 가깝게 곁에 머무르려 하며(예: 불안, 절박함, 매달림이 드러나는 대사), 주인공은 상대적으로 신중하거나 한발 물러서 있는 기울어진 구도가 유지되었다면 mutual_equal_footing_detected를 false로 표시한다.",
        ].join("\n")
      : "[연예인과의 사랑 검증] 이번 화는 해당 테마가 선택되지 않았으므로 celebrity_pursues_protagonist는 항상 true로, mutual_equal_footing_detected는 항상 false로 표시한다.",
    "",
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

const CELEBRITY_THEME_LABEL = "연예인과의 사랑";

export function buildStructureVerificationPrompt(
  plan: FusionPlan,
  content: ParsedStoryContent
): ChatPrompt {
  const hasCelebrityTheme = plan.theme1 === CELEBRITY_THEME_LABEL || plan.theme2 === CELEBRITY_THEME_LABEL;

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
    system: buildSystemPrompt(hasCelebrityTheme),
    user: userLines.join("\n"),
  };
}
