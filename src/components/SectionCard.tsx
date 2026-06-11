import type { UseFormReturn } from 'react-hook-form'
import { isFieldVisible } from '../schema/types'
import type { Answers, Section } from '../schema/types'
import { FormField } from './FormField'

interface SectionCardProps {
  section: Section
  form: UseFormReturn<Answers>
  values: Answers
  presetFields?: string[]
}

export function SectionCard({ section, form, values, presetFields }: SectionCardProps) {
  const visibleFields = section.fields.filter((field) => isFieldVisible(field, values))
  // Conditional sections (e.g. Bug Report Details) render nothing until their
  // requirement is selected.
  if (visibleFields.length === 0) return null

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
        {section.description && (
          <p className="mt-0.5 text-xs text-gray-500">{section.description}</p>
        )}
      </div>
      <div className="space-y-5 px-4 py-5 sm:px-6">
        {visibleFields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            form={form}
            fromPreset={presetFields?.includes(field.id)}
          />
        ))}
      </div>
    </div>
  )
}
