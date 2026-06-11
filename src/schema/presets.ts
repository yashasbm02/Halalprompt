import type { Answers, AnswerValue } from './types'

/**
 * Presets = Requirement × Role. They pre-fill the questionnaire with opinionated
 * defaults. A preset is *composed* from a base layer + the role layer + the
 * requirement layer (so adding a role/requirement is one entry, not N combos).
 * Pre-fills are soft — every value stays editable in the form.
 */

export type RequirementId = 'scratch' | 'feature' | 'bugfix'
export type RoleId =
  | 'frontend'
  | 'backend'
  | 'architect'
  | 'cloud'
  | 'dba'
  | 'data'
  | 'devops'
  | 'mobile'
  | 'mlai'

export interface RequirementMeta {
  id: RequirementId
  label: string
  blurb: string
}

export interface RoleMeta {
  id: RoleId
  label: string
  blurb: string
}

export const REQUIREMENTS: RequirementMeta[] = [
  {
    id: 'scratch',
    label: 'From scratch',
    blurb: 'A brand-new build. Emphasis on background, stack, and scope.',
  },
  {
    id: 'feature',
    label: 'Feature',
    blurb: 'Add to an existing app. Asks for affected pages and behaviors.',
  },
  {
    id: 'bugfix',
    label: 'Bug fix',
    blurb: 'Diagnose and fix. Asks for the error, location, and expected vs. actual.',
  },
]

export const ROLES: RoleMeta[] = [
  { id: 'frontend', label: 'Senior Frontend Dev', blurb: 'React · TypeScript · Tailwind UI' },
  { id: 'backend', label: 'Senior Backend Dev', blurb: 'Node · TypeScript · PostgreSQL APIs' },
  { id: 'architect', label: 'Solution Architect', blurb: 'Full-stack system design & trade-offs' },
  { id: 'cloud', label: 'Cloud Engineer', blurb: 'Infra, scalability, networking, resilience' },
  { id: 'dba', label: 'DB Admin', blurb: 'Schema design, indexing, query performance' },
  { id: 'data', label: 'Data Engineer', blurb: 'Pipelines, ETL, warehousing (Python/SQL)' },
  { id: 'devops', label: 'DevOps Engineer', blurb: 'CI/CD, IaC, containers, observability' },
  { id: 'mobile', label: 'Mobile Developer', blurb: 'Cross-platform mobile (React Native/TS)' },
  { id: 'mlai', label: 'ML/AI Engineer', blurb: 'Applied ML & LLM apps (Python)' },
]

// Common scalars shared by every preset; role/requirement layers override.
const BASE: Answers = {
  tone_style: 'technical',
  tone_audience: 'senior',
  depth_format: 'mixed',
}

const ROLE_DEFAULTS: Record<RoleId, Answers> = {
  frontend: {
    role_title: 'Senior Frontend Engineer',
    role_specialisation:
      'Specialising in React, TypeScript, and Tailwind — component architecture, accessibility, and performant, responsive UI.',
    context_tech_stack: ['react', 'typescript', 'tailwind'],
    depth_lenses: ['dx', 'performance'],
  },
  backend: {
    role_title: 'Senior Backend Engineer',
    role_specialisation:
      'Specialising in Node.js/TypeScript services and PostgreSQL — API design, data modelling, and reliability.',
    context_tech_stack: ['nodejs', 'typescript', 'postgres'],
    depth_lenses: ['security', 'performance'],
  },
  architect: {
    role_title: 'Solution Architect (Full-Stack)',
    role_specialisation:
      'End-to-end system design across frontend, backend, and data — weighing trade-offs, boundaries, and long-term maintainability.',
    context_tech_stack: ['react', 'typescript', 'nodejs', 'postgres'],
    depth_level: 'thorough',
    depth_lenses: ['architecture', 'tradeoffs', 'second_order'],
  },
  cloud: {
    role_title: 'Cloud Engineer',
    role_specialisation:
      'Cloud infrastructure and deployment — scalability, cost, networking, and resilient, observable systems.',
    context_tech_stack: ['go', 'nodejs', 'typescript'],
    depth_lenses: ['architecture', 'performance', 'security'],
  },
  dba: {
    role_title: 'Senior Database Administrator',
    role_specialisation:
      'PostgreSQL administration and data modelling — schema design, indexing, query performance, migrations, and data integrity.',
    context_tech_stack: ['postgres'],
    depth_lenses: ['performance', 'risks', 'security'],
  },
  data: {
    role_title: 'Senior Data Engineer',
    role_specialisation:
      'Data pipelines and warehousing — ETL/ELT, batch and streaming, with Python and SQL over PostgreSQL.',
    context_tech_stack: ['python', 'postgres'],
    depth_lenses: ['performance', 'tradeoffs', 'risks'],
  },
  devops: {
    role_title: 'DevOps Engineer',
    role_specialisation:
      'CI/CD, infrastructure-as-code, containers, and observability — automating reliable, repeatable delivery.',
    context_tech_stack: ['go', 'nodejs', 'typescript'],
    depth_lenses: ['risks', 'security', 'dx'],
  },
  mobile: {
    role_title: 'Senior Mobile Engineer',
    role_specialisation:
      'Cross-platform mobile with React Native and TypeScript — native UX, performance, and platform constraints.',
    context_tech_stack: ['react', 'typescript'],
    depth_lenses: ['performance', 'dx'],
  },
  mlai: {
    role_title: 'ML/AI Engineer',
    role_specialisation:
      'Applied ML and LLM application engineering with Python — model integration, data pipelines, evaluation, and inference.',
    context_tech_stack: ['python'],
    depth_lenses: ['tradeoffs', 'risks', 'testing'],
  },
}

const REQUIREMENT_DEFAULTS: Record<RequirementId, Answers> = {
  scratch: {
    requirement_type: 'scratch',
    objective_deliverable: 'code',
    depth_level: 'balanced',
    depth_lenses: ['architecture', 'tradeoffs'],
  },
  feature: {
    requirement_type: 'feature',
    objective_deliverable: 'code',
    depth_level: 'balanced',
    depth_lenses: ['tradeoffs', 'testing'],
  },
  bugfix: {
    requirement_type: 'bugfix',
    objective_deliverable: 'code',
    depth_level: 'thorough',
    depth_lenses: ['risks'],
  },
}

/** Merge two answer layers: union array (multiselect) values, override scalars. */
function mergeAnswers(a: Answers, b: Answers): Answers {
  const out: Answers = { ...a }
  for (const [k, v] of Object.entries(b)) {
    const prev = out[k]
    if (Array.isArray(v) && Array.isArray(prev)) {
      out[k] = Array.from(new Set([...prev, ...v])) as AnswerValue
    } else {
      out[k] = v
    }
  }
  return out
}

/** Compose the pre-fill for a preset. Requirement layer wins on scalar conflicts. */
export function buildPreset(req: RequirementId, role: RoleId): Answers {
  return mergeAnswers(
    mergeAnswers(BASE, ROLE_DEFAULTS[role]),
    REQUIREMENT_DEFAULTS[req],
  )
}

export function presetLabel(req: RequirementId, role: RoleId): string {
  const r = REQUIREMENTS.find((x) => x.id === req)?.label ?? req
  const ro = ROLES.find((x) => x.id === role)?.label ?? role
  return `${r} · ${ro}`
}
