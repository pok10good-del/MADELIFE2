import type { AIProviderEnv } from "@/lib/ai/ai-provider-env";
import type { AIProviderConfig } from "@/lib/ai/ai-provider-config";
import { VALID_STORY_GENERATION_SEQUENCE } from "@/lib/ai/story-generation.mock";

export function mapAIProviderEnvToConfig(env: AIProviderEnv): AIProviderConfig {
  switch (env.AI_PROVIDER) {
    case "mock": {
      return {
        type: "mock",
        mockResponse: VALID_STORY_GENERATION_SEQUENCE,
      };
    }
    case "claude": {
      return {
        type: "claude",
        apiKey: env.CLAUDE_API_KEY,
      };
    }
    case "openai": {
      return {
        type: "openai",
        apiKey: env.OPENAI_API_KEY,
      };
    }
    default: {
      const exhaustiveCheck: never = env.AI_PROVIDER;
      throw new Error(`Unsupported AI_PROVIDER: ${String(exhaustiveCheck)}`);
    }
  }
}
