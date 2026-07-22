const FATE_PATH_LABELS: Record<string, string> = {
  success: "성공",
  love: "사랑",
  family: "가족",
  happiness: "행복",
  honor: "명예",
  knowledge: "지식",
  misfortune: "불행",
  "path-greatness": "경제적으로 높은 위치의 성공",
  "path-growth": "인플루언서/연예인으로써의 성공",
  "path-shine": "운명을 초월한 존재",
  "path-politics": "정치인으로서의 성공",
  "path-sports": "스포츠 선수로서의 성공",
  "path-celebrity": "연예인과의 사랑",
};

export function mapSelectedPathsToThemes(selectedPaths: string[]): string[] {
  return selectedPaths.map((path) => FATE_PATH_LABELS[path] ?? path);
}
