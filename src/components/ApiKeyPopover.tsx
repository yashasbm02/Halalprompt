import { useEffect, useRef, useState } from 'react'
import { useApiKey, type KeyStatus } from '../context/ApiKeyContext'
import { PROVIDERS, PROVIDER_IDS, type ProviderId } from '../llm/providers'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { NativeSelect } from './ui/NativeSelect'
import { cn } from '../lib/utils'

const STATUS_TEXT: Record<KeyStatus, { label: string; className: string } | null> = {
  empty: null,
  checking: { label: 'Checking…', className: 'text-amber-600' },
  valid: { label: '✓ Connected', className: 'text-green-600' },
  invalid: { label: "✗ Couldn't connect — check the key", className: 'text-red-600' },
}

export function ApiKeyPopover() {
  const { providerId, apiKey, hasKey, status, save, forget } = useApiKey()
  const [open, setOpen] = useState(false)
  const [draftProvider, setDraftProvider] = useState<ProviderId>(providerId)
  const [draftKey, setDraftKey] = useState(apiKey)
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Seed the drafts from committed state each time the popover opens.
  useEffect(() => {
    if (open) {
      setDraftProvider(providerId)
      setDraftKey(apiKey)
    }
  }, [open, providerId, apiKey])

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    await save(draftProvider, draftKey.trim())
    setSaving(false)
  }

  const handleForget = () => {
    forget()
    setDraftKey('')
  }

  const statusInfo = STATUS_TEXT[saving ? 'checking' : status]

  return (
    <div className="relative" ref={ref}>
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        <span aria-hidden>🔑</span>
        API Key
        <span
          aria-hidden
          className={cn(
            'ml-1 inline-block h-1.5 w-1.5 rounded-full',
            hasKey ? 'bg-green-500' : 'bg-gray-300',
          )}
        />
      </Button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 space-y-3 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-lg">
          <div className="space-y-1">
            <Label htmlFor="llm-provider">Provider</Label>
            <NativeSelect
              id="llm-provider"
              value={draftProvider}
              onChange={(v) => setDraftProvider(v as ProviderId)}
              options={PROVIDER_IDS.map((id) => ({
                value: id,
                label: PROVIDERS[id].label,
              }))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="llm-key">API key</Label>
            <Input
              id="llm-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={PROVIDERS[draftProvider].keyHint}
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
            />
          </div>

          {statusInfo && (
            <p className={cn('text-xs font-medium', statusInfo.className)}>
              {statusInfo.label}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleSave}
              disabled={saving || !draftKey.trim()}
            >
              {saving ? 'Checking…' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleForget}
              disabled={!hasKey && !draftKey}
            >
              Forget
            </Button>
          </div>

          <p className="text-[11px] leading-snug text-gray-400">
            Held in memory only — never saved to disk or to your draft. Sent over
            HTTPS in a request header, never inside the prompt.
          </p>
        </div>
      )}
    </div>
  )
}
