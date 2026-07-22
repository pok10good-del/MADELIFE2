import type { AIProvider } from "@/lib/ai/ai-provider";
import { loadAIProviderEnv } from "@/lib/ai/load-ai-provider-env";
import { mapAIProviderEnvToConfig } from "@/lib/ai/map-ai-provider-env-to-config";
import { createAIProvider } from "@/lib/ai/create-ai-provider";

export function createAIProviderFromEnv(): AIProvider {
  const env = loadAIProviderEnv();
  const config = mapAIProviderEnvToConfig(env);
  return createAIProvider(config);
}
