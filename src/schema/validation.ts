import { z } from 'zod'
import { isFieldVisible } from './types'
import type { Field, Template, Answers } from './types'

function fieldToZod(field: Field): z.ZodTypeAny {
  // Conditional fields are optional in the static shape — a hidden required
  // field would make the form permanently invalid. Required-when-visible is
  // enforced by the superRefine below.
  const required = field.required && !field.visibleWhen
  switch (field.kind) {
    case 'text':
    case 'textarea': {
      let s = z.string()
      if (required) s = s.min(1, `${field.label} is required`)
      if (field.maxLength)
        s = s.max(field.maxLength, `Max ${field.maxLength} characters`)
      return s
    }
    case 'select': {
      if (required) {
        const vals = field.options.map((o) => o.value) as [string, ...string[]]
        return z.enum(vals, {
          errorMap: () => ({ message: `${field.label} is required` }),
        })
      }
      return z.string()
    }
    case 'multiselect': {
      const s = z.array(z.string())
      return required ? s.min(1, `Select at least one ${field.label}`) : s
    }
  }
}

export function deriveSchema(template: Template): z.ZodTypeAny {
  const shape: z.ZodRawShape = {}
  const conditionalRequired: Field[] = []
  for (const section of template.sections) {
    for (const field of section.fields) {
      shape[field.id] = fieldToZod(field)
      if (field.required && field.visibleWhen) conditionalRequired.push(field)
    }
  }

  return z.object(shape).superRefine((answers, ctx) => {
    // Enforce required-ness only while the conditional field is visible.
    for (const field of conditionalRequired) {
      if (!isFieldVisible(field, answers as Answers)) continue
      const v = (answers as Answers)[field.id]
      const empty = Array.isArray(v) ? v.length === 0 : !v
      if (empty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field.id],
          message: `${field.label} is required`,
        })
      }
    }
  })
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
