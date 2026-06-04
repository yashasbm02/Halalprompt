import { z } from 'zod'
import type { Field, Template, Answers } from './types'

function fieldToZod(field: Field): z.ZodTypeAny {
  switch (field.kind) {
    case 'text':
    case 'textarea': {
      let s = z.string()
      if (field.required) s = s.min(1, `${field.label} is required`)
      if (field.maxLength)
        s = s.max(field.maxLength, `Max ${field.maxLength} characters`)
      return s
    }
    case 'select': {
      if (field.required) {
        const vals = field.options.map((o) => o.value) as [string, ...string[]]
        return z.enum(vals, {
          errorMap: () => ({ message: `${field.label} is required` }),
        })
      }
      return z.string()
    }
    case 'multiselect': {
      const s = z.array(z.string())
      return field.required
        ? s.min(1, `Select at least one ${field.label}`)
        : s
    }
  }
}

export function deriveSchema(template: Template): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = {}
  for (const section of template.sections) {
    for (const field of section.fields) {
      shape[field.id] = fieldToZod(field)
    }
  }
  return z.object(shape)
}

export function getDefaultValues(template: Template): Answers {
  const defaults: Answers = {}
  for (const section of template.sections) {
    for (const field of section.fields) {
      defaults[field.id] = field.kind === 'multiselect' ? [] : ''
    }
  }
  return defaults
}
