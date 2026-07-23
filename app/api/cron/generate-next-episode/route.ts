import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStoryGenerationFacade } from "@/lib/ai/story-generation.facade.factory";
import { mapStoryGenerationResultToStoriesUpdate } from "@/lib/story-generation/map-generation-result-to-stories-update";
import { buildContinuationStoriesInsert, buildContinuationStoryGenerationInput } from "@/lib/story-generation/build-continuation-story-generation-input";
import type { StoriesRow } from "@/lib/supabase/stories.types";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function latestEpisodePerUser(rows: StoriesRow[]): Map<string, StoriesRow> {
  const latest = new Map<string, StoriesRow>();
  for (const row of rows) {
    const current = latest.get(row.user_id);
    if (!current || row.episode_number > current.episode_number) {
      latest.set(row.user_id, row);
    }
  }
  return latest;
}

// Vercel Cron sends a GET request with the Authorization header auto-attached
// from CRON_SECRET; POST is kept for manual/local testing via curl.
export async function GET(request: NextRequest) {
  return handleGenerateNextEpisode(request);
}

export async function POST(request: NextRequest) {
  return handleGenerateNextEpisode(request);
}

async function handleGenerateNextEpisode(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: rows, error } = await supabase.from("stories").select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allRows = (rows ?? []) as StoriesRow[];
  const latestByUser = latestEpisodePerUser(allRows);
  const firstEpisodeByUser = new Map<string, StoriesRow>();
  for (const row of allRows) {
    if (row.episode_number === 1) firstEpisodeByUser.set(row.user_id, row);
  }
  const nextEpisodeExists = new Set(
    allRows
      .filter((row) => {
        const latest = latestByUser.get(row.user_id);
        return latest !== undefined && row.episode_number === latest.episode_number + 1;
      })
      .map((row) => row.user_id)
  );

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const [userId, latest] of latestByUser) {
    const firstEpisode = firstEpisodeByUser.get(userId);

    if (
      latest.status !== "completed" ||
      latest.read_at === null ||
      nextEpisodeExists.has(userId) ||
      firstEpisode === undefined
    ) {
      skipped += 1;
      continue;
    }

    try {
      const nextEpisodeNumber = latest.episode_number + 1;
      const insert = buildContinuationStoriesInsert(firstEpisode, latest, nextEpisodeNumber);
      const { data: inserted, error: insertError } = await supabase
        .from("stories")
        .insert({ ...insert, user_id: userId })
        .select()
        .single();

      if (insertError || !inserted) {
        throw new Error(insertError?.message ?? "failed to insert next episode row");
      }

      const generationInput = buildContinuationStoryGenerationInput(firstEpisode, latest);
      const result = await createStoryGenerationFacade().generate(generationInput);

      const { error: updateError } = await supabase
        .from("stories")
        .update(mapStoryGenerationResultToStoriesUpdate(result))
        .eq("id", (inserted as StoriesRow).id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      generated += 1;
    } catch {
      failed += 1;
      await supabase.from("stories").update({ status: "failed" }).eq("user_id", userId).eq(
        "episode_number",
        latest.episode_number + 1
      );
    }
  }

  return NextResponse.json({ generated, skipped, failed, totalUsers: latestByUser.size });
}
