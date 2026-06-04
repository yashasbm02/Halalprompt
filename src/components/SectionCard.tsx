import type { UseFormReturn } from 'react-hook-form'
import type { Section } from '../schema/types'
import type { Answers } from '../schema/types'
import { FormField } from './FormField'

interface SectionCardProps {
  section: Section
  form: UseFormReturn<Answers>
}

export function SectionCard({ section, form }: SectionCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
        {section.description && (
          <p className="mt-0.5 text-xs text-gray-500">{section.description}</p>
        )}
      </div>
      <div className="space-y-5 px-6 py-5">
        {section.fields.map((field) => (
          <FormField key={field.id} field={field} form={form} />
        ))}
      </div>
    </div>
  )
}
