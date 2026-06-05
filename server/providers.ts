import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'

// Server-side provider factories. Kept separate from `src/llm/providers.ts` so
// the browser bundle never imports the provider SDKs. The provider ids and
// default models below must stay in sync with that client registry.
export type ProviderId = 'anthropic' | 'openai'

const DEFAULT_MODEL: Record<ProviderId, string> = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4o',
}

export function isProviderId(value: string | undefined): value is ProviderId {
  return value === 'anthropic' || value === 'openai'
}

/**
 * Build a LanguageModel from a client-supplied key. The key is used only to
 * construct the provider for this one call — it is never stored or logged.
 */
export function buildModel(
  providerId: ProviderId,
  apiKey: string,
  modelId?: string,
) {
  const model = modelId ?? DEFAULT_MODEL[providerId]
  switch (providerId) {
    case 'anthropic':
      return createAnthropic({ apiKey })(model)
    case 'openai':
      return createOpenAI({ apiKey })(model)
    default:
      throw new Error(`Unsupported provider: ${providerId satisfies never}`)
  }
}
