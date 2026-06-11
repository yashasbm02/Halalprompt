export type FieldKind = 'text' | 'textarea' | 'select' | 'multiselect'

interface BaseField {
  id: string
  label: string
  placeholder?: string
  required: boolean
  hint?: string
  /**
   * When set, the field is only rendered, validated, and compiled while the
   * answer to `field` is one of `in`. Used by the requirement-driven sections.
   */
  visibleWhen?: { field: string; in: string[] }
}

export interface TextField extends BaseField {
  kind: 'text'
  maxLength?: number
}

export interface TextareaField extends BaseField {
  kind: 'textarea'
  maxLength?: number
  rows?: number
}

export interface SelectField extends BaseField {
  kind: 'select'
  options: { value: string; label: string }[]
}

export interface MultiselectField extends BaseField {
  kind: 'multiselect'
  options: { value: string; label: string }[]
}

export type Field = TextField | TextareaField | SelectField | MultiselectField

export interface Section {
  id: string
  title: string
  description?: string
  fields: Field[]
}

export interface Template {
  id: string
  name: string
  description: string
  sections: Section[]
}

export type AnswerValue = string | string[]
export type Answers = Record<string, AnswerValue>

/**
 * A field is visible unless it declares `visibleWhen` and the driving answer
 * is not in the allowed set. Single source of truth for render, validation,
 * and markdown compilation.
 */
export function isFieldVisible(field: Field, answers: Answers): boolean {
  if (!field.visibleWhen) return true
  const driver = answers[field.visibleWhen.field]
  return typeof driver === 'string' && field.visibleWhen.in.includes(driver)
}
