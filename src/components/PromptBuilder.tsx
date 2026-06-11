import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCompletion } from 'ai/react'
import { PERFECT_PROMPT_TEMPLATE } from '../schema/template'
import { deriveSchema, getDefaultValues } from '../schema/validation'
import { compileMarkdown } from '../schema/compiler'
import { useFormPersistence, loadDraft, clearDraft } from '../hooks/useFormPersistence'
import { SectionCard } from './SectionCard'
import { PreviewPanel } from './PreviewPanel'
import { Button } from './ui/Button'
import { ApiKeyPopover } from './ApiKeyPopover'
import { useApiKey } from '../context/ApiKeyContext'
import { cn } from '../lib/utils'
import type { Answers } from '../schema/types'

const template = PERFECT_PROMPT_TEMPLATE
const schema = deriveSchema(template)

function filledSectionCount(answers: Answers): number {
  return template.sections.filter((section) =>
    section.fields.some((f) => {
      const v = answers[f.id]
      return Array.isArray(v) ? v.length > 0 : !!v
    }),
  ).length
}

export function PromptBuilder() {
  const savedDraft = useMemo(() => loadDraft(template.id), [])
  const defaultValues = useMemo(
    () => savedDraft ?? getDefaultValues(template),
    [savedDraft],
  )

  const form = useForm<Answers>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  })

  const values = form.watch()
  const markdown = useMemo(() => compileMarkdown(template, values), [values])
  useFormPersistence(template.id, values)

  const { providerId, apiKey, hasKey } = useApiKey()

  const { completion, complete, isLoading, error, setCompletion, stop } =
    useCompletion({ api: '/api/generate' })

  // Mobile only: the preview/AI pane is a slide-up sheet. Inert at md+ (the pane
  // is the static side rail there and ignores this state).
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleGenerate = form.handleSubmit(async (data) => {
    if (!apiKey) return
    const spec = compileMarkdown(template, data)
    await complete(spec, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'x-llm-provider': providerId,
      },
    })
  })

  const handleReset = () => {
    if (!window.confirm('Clear all answers and start over? Your API key is kept.'))
      return
    stop()
    clearDraft(template.id)
    form.reset(getDefaultValues(template))
    setCompletion('')
  }

  const filled = filledSectionCount(values)
  const total = template.sections.length

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              {template.name}
            </h1>
            <p className="text-xs text-gray-500">{template.description}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="flex gap-0.5">
                {template.sections.map((s) => {
                  const hasFill = s.fields.some((f) => {
                    const v = values[f.id]
                    return Array.isArray(v) ? v.length > 0 : !!v
                  })
                  return (
                    <div
                      key={s.id}
                      title={s.title}
                      className={`h-1.5 w-5 rounded-full transition-colors ${
                        hasFill ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  )
                })}
              </div>
              <span className="hidden sm:inline">
                {filled}/{total} sections
              </span>
            </div>
            <ApiKeyPopover />
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Form panel */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto max-w-2xl space-y-4">
            {template.sections.map((section) => (
              <SectionCard key={section.id} section={section} form={form} />
            ))}
            <div className="h-6" />
          </div>
        </main>

        {/* Mobile scrim — dims the full background; taps close the sheet */}
        {sheetOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setSheetOpen(false)}
            aria-hidden
          />
        )}

        {/*
          Preview / response panel. One element, two personalities:
          - <md: a fixed bottom sheet that slides up via translate-y (sheetOpen).
          - md+: md:static cancels the fixed/inset/translate utilities, restoring
            the original 400px side rail byte-for-byte.
        */}
        <aside
          className={cn(
            'flex flex-col border-gray-200 bg-white',
            'fixed inset-x-0 bottom-0 top-16 z-40 rounded-t-2xl border-t shadow-2xl',
            'transition-transform duration-300 ease-out',
            sheetOpen ? 'translate-y-0' : 'translate-y-full',
            'md:static md:z-auto md:w-[400px] md:shrink-0 md:translate-y-0 md:rounded-none md:border-l md:border-t-0 md:shadow-none md:transition-none',
          )}
        >
          <PreviewPanel
            markdown={markdown}
            completion={completion}
            isLoading={isLoading}
            error={error ?? undefined}
            canGenerate={form.formState.isValid}
            hasKey={hasKey}
            onGenerate={handleGenerate}
            onRetry={handleGenerate}
            onClose={() => setSheetOpen(false)}
          />
        </aside>
      </div>

      {/* Mobile FAB — opens the preview/Generate sheet */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className={cn(
          'fixed bottom-5 right-5 z-20 flex h-14 items-center gap-2 rounded-full bg-blue-600 px-5',
          'text-sm font-medium text-white shadow-lg active:bg-blue-700 md:hidden',
          sheetOpen && 'hidden',
        )}
      >
        Preview &amp; Generate
        {(completion || isLoading) && (
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              isLoading ? 'animate-pulse bg-white/80' : 'bg-green-300',
            )}
          />
        )}
      </button>
    </div>
  )
}
