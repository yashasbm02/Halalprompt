import { useEffect } from 'react'
import type { Answers } from '../schema/types'

const key = (templateId: string) => `prompt-draft-${templateId}`

export function useFormPersistence(templateId: string, values: Answers) {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key(templateId), JSON.stringify(values))
      } catch {
        // storage unavailable
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [templateId, values])
}

export function loadDraft(templateId: string): Answers | null {
  try {
    const raw = localStorage.getItem(key(templateId))
    return raw ? (JSON.parse(raw) as Answers) : null
  } catch {
    return null
  }
}

export function clearDraft(templateId: string) {
  try {
    localStorage.removeItem(key(templateId))
  } catch {
    // storage unavailable
  }
}
