import { isFieldVisible } from './types'
import type { Template, Answers } from './types'

export function compileMarkdown(template: Template, answers: Answers): string {
  const lines: string[] = [`# ${template.name}\n`]

  for (const section of template.sections) {
    const sectionLines: string[] = []

    for (const field of section.fields) {
      if (!isFieldVisible(field, answers)) continue
      const value = answers[field.id]
      if (!value || (Array.isArray(value) && value.length === 0)) continue

      sectionLines.push(`**${field.label}:**`)

      if (field.kind === 'multiselect' && Array.isArray(value)) {
        const labels = value.map((v) => {
          const opt = field.options.find((o) => o.value === v)
          return opt ? opt.label : v
        })
        sectionLines.push(labels.map((l) => `- ${l}`).join('\n'))
      } else if (field.kind === 'select' && typeof value === 'string') {
        const opt = field.options.find((o) => o.value === value)
        sectionLines.push(opt ? opt.label : value)
      } else if (typeof value === 'string' && value.trim()) {
        sectionLines.push(value.trim())
      }

      sectionLines.push('')
    }

    if (sectionLines.length > 0) {
      lines.push(`## ${section.title}\n`)
      if (section.description) lines.push(`*${section.description}*\n`)
      lines.push(...sectionLines)
    }
  }

  return lines.join('\n')
}
