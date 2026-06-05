import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_PROVIDER, type ProviderId } from '../llm/providers'

export type KeyStatus = 'empty' | 'checking' | 'valid' | 'invalid'

interface ApiKeyState {
  providerId: ProviderId
  /** The committed key. Lives in memory only — never persisted. */
  apiKey: string
  hasKey: boolean
  status: KeyStatus
  /** Commit a provider + key and verify it against /api/validate. */
  save: (providerId: ProviderId, apiKey: string) => Promise<boolean>
  /** Drop the key from memory. */
  forget: () => void
}

const ApiKeyContext = createContext<ApiKeyState | null>(null)

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [providerId, setProviderId] = useState<ProviderId>(DEFAULT_PROVIDER)
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<KeyStatus>('empty')

  // Validates with the values passed in (not React state) to avoid a stale read
  // when save() sets state and validates in the same tick.
  const save = useCallback(async (pid: ProviderId, key: string) => {
    setProviderId(pid)
    setApiKey(key)
    if (!key) {
      setStatus('empty')
      return false
    }
    setStatus('checking')
    try {
      const res = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'x-llm-provider': pid,
        },
      })
      const ok = res.ok && ((await res.json()) as { ok?: boolean }).ok === true
      setStatus(ok ? 'valid' : 'invalid')
      return ok
    } catch {
      setStatus('invalid')
      return false
    }
  }, [])

  const forget = useCallback(() => {
    setApiKey('')
    setStatus('empty')
  }, [])

  const value = useMemo<ApiKeyState>(
    () => ({
      providerId,
      apiKey,
      hasKey: apiKey.length > 0,
      status,
      save,
      forget,
    }),
    [providerId, apiKey, status, save, forget],
  )

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
}

export function useApiKey(): ApiKeyState {
  const ctx = useContext(ApiKeyContext)
  if (!ctx) throw new Error('useApiKey must be used within an ApiKeyProvider')
  return ctx
}
