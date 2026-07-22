export type StoriesShareOption = "private" | "friends" | "public";

export type StoriesStatus = "pending" | "processing" | "active" | "completed";

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
  created_at?: string;
  updated_at?: string;
}
