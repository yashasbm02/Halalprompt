import { useMemo } from 'react'
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
      <header className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              {template.name}
            </h1>
            <p className="text-xs text-gray-500">{template.description}</p>
          </div>
          <div className="flex items-center gap-4">
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
              <span>
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
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-2xl space-y-4">
            {template.sections.map((section) => (
              <SectionCard key={section.id} section={section} form={form} />
            ))}
            <div className="h-6" />
          </div>
        </main>

        {/* Preview / response panel */}
        <aside className="w-[400px] shrink-0 border-l border-gray-200">
          <PreviewPanel
            markdown={markdown}
            completion={completion}
            isLoading={isLoading}
            error={error ?? undefined}
            canGenerate={form.formState.isValid}
            hasKey={hasKey}
            onGenerate={handleGenerate}
            onRetry={handleGenerate}
          />
        </aside>
      </div>
    </div>
  )
}
