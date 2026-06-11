import { useEffect, useState } from 'react'
import { PERFECT_PROMPT_TEMPLATE } from '../schema/template'
import {
  REQUIREMENTS,
  ROLES,
  buildPreset,
  type RequirementId,
  type RoleId,
} from '../schema/presets'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'

interface PresetWizardProps {
  open: boolean
  onApply: (req: RequirementId, role: RoleId) => void
  onClose: () => void
}

// id → label, to summarise what a preset will fill.
const FIELD_LABELS = new Map<string, string>()
for (const section of PERFECT_PROMPT_TEMPLATE.sections) {
  for (const field of section.fields) FIELD_LABELS.set(field.id, field.label)
}

export function PresetWizard({ open, onApply, onClose }: PresetWizardProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [requirement, setRequirement] = useState<RequirementId | null>(null)
  const [role, setRole] = useState<RoleId | null>(null)

  // Reset each time the wizard opens.
  useEffect(() => {
    if (open) {
      setStep(1)
      setRequirement(null)
      setRole(null)
    }
  }, [open])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const filledLabels =
    requirement && role
      ? Object.keys(buildPreset(requirement, role)).map(
          (id) => FIELD_LABELS.get(id) ?? id,
        )
      : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Use a preset</h2>
            <p className="text-xs text-gray-500">
              Step {step} of 2 · {step === 1 ? 'Requirement' : 'Role'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="px-2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {step === 1 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {REQUIREMENTS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRequirement(r.id)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-colors',
                    requirement === r.id
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:bg-gray-50',
                  )}
                >
                  <div className="text-sm font-medium text-gray-900">{r.label}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{r.blurb}</div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-colors',
                      role === r.id
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-gray-200 hover:bg-gray-50',
                    )}
                  >
                    <div className="text-sm font-medium text-gray-900">{r.label}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{r.blurb}</div>
                  </button>
                ))}
              </div>

              {role && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                  <span className="font-medium text-gray-700">This preset fills:</span>{' '}
                  {filledLabels.join(', ')}.{' '}
                  <span className="text-gray-400">All values stay editable.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-gray-200 px-5 py-3">
          {step === 1 ? (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
              ← Back
            </Button>
          )}

          {step === 1 ? (
            <Button size="sm" onClick={() => setStep(2)} disabled={!requirement}>
              Next →
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => requirement && role && onApply(requirement, role)}
              disabled={!role}
            >
              Apply preset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
