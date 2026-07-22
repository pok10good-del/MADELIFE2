export interface AIProviderEnv {
  AI_PROVIDER: "mock" | "claude" | "openai";
  CLAUDE_API_KEY?: string;
  OPENAI_API_KEY?: string;
}

function isMissing(value: string | undefined): boolean {
  return value === undefined || value.trim().length === 0;
}

export function readAIProviderEnv(env: Partial<AIProviderEnv>): AIProviderEnv {
  if (env.AI_PROVIDER === undefined || env.AI_PROVIDER.trim().length === 0) {
    throw new Error("AI_PROVIDER is required");
  }

  switch (env.AI_PROVIDER) {
    case "mock": {
      return { AI_PROVIDER: "mock" };
    }
    case "claude": {
      if (isMissing(env.CLAUDE_API_KEY)) {
        throw new Error("CLAUDE_API_KEY is required for provider type \"claude\"");
      }
      return { AI_PROVIDER: "claude", CLAUDE_API_KEY: env.CLAUDE_API_KEY };
    }
    case "openai": {
      if (isMissing(env.OPENAI_API_KEY)) {
        throw new Error("OPENAI_API_KEY is required for provider type \"openai\"");
      }
      return { AI_PROVIDER: "openai", OPENAI_API_KEY: env.OPENAI_API_KEY };
    }
  }
}
