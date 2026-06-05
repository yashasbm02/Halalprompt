// Client-facing provider registry — the single source of truth for the API-key UI.
//
// This file is bundled into the browser, so it must stay free of secrets and of
// any server-only dependency (`@ai-sdk/*`, `process.env`). The server keeps its
// own factory map in `server/providers.ts`; keep the provider ids and default
// models here in sync with that file.

export type ProviderId = 'anthropic' | 'openai'

export interface ProviderInfo {
  id: ProviderId
  label: string
  /** Model used when the caller doesn't pick one (also the server default). */
  defaultModel: string
  /** Placeholder shown in the key field — a format hint, not validation. */
  keyHint: string
}

export const PROVIDERS: Record<ProviderId, ProviderInfo> = {
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic (Claude)',
    defaultModel: 'claude-sonnet-4-6', // claude-opus-4-8 also available (most capable)
    keyHint: 'sk-ant-…',
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    defaultModel: 'gpt-4o',
    keyHint: 'sk-…',
  },
}

export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[]

export const DEFAULT_PROVIDER: ProviderId = 'anthropic'

export function isProviderId(value: string): value is ProviderId {
  return value in PROVIDERS
}
