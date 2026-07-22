import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoriesInsert, StoriesRow, StoriesUpdate } from "@/lib/supabase/stories.types";

export async function saveStory(
  supabase: SupabaseClient,
  userId: string,
  story: StoriesInsert
): Promise<StoriesRow> {
  const { data, error } = await supabase
    .from("stories")
    .insert({ ...story, user_id: userId })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save story: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to save story: no row returned after insert");
  }

  return data as StoriesRow;
}

export async function updateStory(
  supabase: SupabaseClient,
  userId: string,
  storyId: string,
  update: StoriesUpdate
): Promise<StoriesRow> {
  const { data, error } = await supabase
    .from("stories")
    .update(update)
    .eq("id", storyId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update story: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to update story: no row returned after update");
  }

  return data as StoriesRow;
}

export async function getUserStories(
  supabase: SupabaseClient,
  userId: string
): Promise<StoriesRow[]> {
  const { data, error } = await supabase
    .from("stories")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch stories: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to fetch stories: no data returned");
  }

  return data as StoriesRow[];
}
