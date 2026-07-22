import type { AIProviderEnv } from "@/lib/ai/ai-provider-env";
import { readAIProviderEnv } from "@/lib/ai/ai-provider-env";

export function loadAIProviderEnv(): AIProviderEnv {
  return readAIProviderEnv({
    AI_PROVIDER: process.env.AI_PROVIDER as AIProviderEnv["AI_PROVIDER"] | undefined,
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  });
}
