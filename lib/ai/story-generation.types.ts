export interface StoryGenerationInput {
  userId: string;
  storyId: string;
  currentAge: number;
  targetAge: number;
  selectedThemes: string[];
  lifeSummary: string;
  regretPoint: string;
}

export interface StoryGenerationResult {
  title: string;
  content: string;
  startAge: number;
  endAge: number;
  themes: string[];
}
