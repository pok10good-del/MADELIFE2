import { NextRequest, NextResponse } from "next/server";
import type { StoryGenerationInput } from "@/lib/ai/story-generation.types";

const CREWAI_SERVICE_URL = process.env.CREWAI_SERVICE_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as StoryGenerationInput;
    const internalApiKey = process.env.CREWAI_INTERNAL_API_KEY;

    if (!internalApiKey) {
      return NextResponse.json({ error: "CREWAI_INTERNAL_API_KEY is not configured" }, { status: 500 });
    }

    const response = await fetch(`${CREWAI_SERVICE_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Api-Key": internalApiKey,
      },
      body: JSON.stringify({ story_id: input.storyId, user_id: input.userId }),
    });

    if (response.status === 409) {
      const body = await response.json().catch(() => ({}));
      const message = body.detail ?? "Story generation is already in progress";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body.detail ?? "Failed to enqueue story generation job";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const job = await response.json();
    return NextResponse.json(job, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
