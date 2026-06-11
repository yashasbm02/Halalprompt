/**
 * build-skill.ts — single-source-of-truth codegen for the Claude Code plugin.
 *
 * Imports the canonical questionnaire (`PERFECT_PROMPT_TEMPLATE`) and serializes it
 * to `template.json` next to the skill, so the `/perfect-prompt` skill always asks
 * the exact same questions the web form does. The questionnaire is NEVER hand-copied
 * into the skill — re-run `npm run build:skill` whenever `src/schema/template.ts` changes.
 *
 * Run-only (executed via tsx); intentionally not part of the tsc build graph.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PERFECT_PROMPT_TEMPLATE } from '../src/schema/template'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = resolve(
  repoRoot,
  'plugins/perfect-prompt/skills/perfect-prompt/template.json',
)

const payload = {
  _generated:
    'DO NOT EDIT — generated from src/schema/template.ts by scripts/build-skill.ts. Run `npm run build:skill`.',
  ...PERFECT_PROMPT_TEMPLATE,
}

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(payload, null, 2) + '\n', 'utf8')

console.log(`build-skill: wrote ${outFile}`)
