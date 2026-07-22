import { NextRequest, NextResponse } from "next/server";
import { createStoryGenerationFacade } from "@/lib/ai/story-generation.facade.factory";
import type { StoryGenerationInput } from "@/lib/ai/story-generation.types";

export async function POST(request: NextRequest) {
  const input = (await request.json()) as StoryGenerationInput;

  const facade = createStoryGenerationFacade();
  const result = await facade.generate(input);

  return NextResponse.json(result);
}
