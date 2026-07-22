export type StoriesShareOption = "private" | "friends" | "public";

export type StoriesStatus = "pending" | "processing" | "active" | "completed" | "failed";

export interface StoriesRow {
  id: string;
  user_id: string;
  story_text: string;
  birth_date: string;
  story_start_date: string;
  selected_paths: string[];
  sport_choice: string | null;
  celebrity_name: string | null;
  share_option: StoriesShareOption;
  status: StoriesStatus;
  regret_point: string;
  generated_title: string | null;
  generated_content: string | null;
  generated_start_age: number | null;
  generated_end_age: number | null;
  generated_themes: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface StoriesInsert {
  id?: string;
  user_id: string;
  story_text: string;
  birth_date: string;
  story_start_date: string;
  selected_paths: string[];
  sport_choice?: string | null;
  celebrity_name?: string | null;
  share_option?: StoriesShareOption;
  status?: StoriesStatus;
  regret_point: string;
  generated_title?: string | null;
  generated_content?: string | null;
  generated_start_age?: number | null;
  generated_end_age?: number | null;
  generated_themes?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface StoriesUpdate {
  id?: string;
  user_id?: string;
  story_text?: string;
  birth_date?: string;
  story_start_date?: string;
  selected_paths?: string[];
  sport_choice?: string | null;
  celebrity_name?: string | null;
  share_option?: StoriesShareOption;
  status?: StoriesStatus;
  regret_point?: string;
  generated_title?: string | null;
  generated_content?: string | null;
  generated_start_age?: number | null;
  generated_end_age?: number | null;
  generated_themes?: string[] | null;
  created_at?: string;
  updated_at?: string;
}
