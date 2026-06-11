# halalprompt

Schema-driven LLM prompt-builder. A guided form compiles structured answers into a markdown spec, then streams it to Claude via a server-side API route.

## Dev setup

```bash
cp .env.example .env.local   # optional server settings; LLM keys are entered in-app (BYOK)
npm install
npm run dev                  # Vite :5173 + Hono :3001 via concurrently
```

`npm run build` — type-checks with `tsc -b` then bundles with Vite.

## Architecture: single source of truth

Everything derives from **`src/schema/template.ts`** — one `Template` object.

```
Template object
  ├── deriveSchema()     → Zod schema  (React Hook Form resolver)
  ├── compileMarkdown()  → markdown string  (live preview + LLM payload)
  └── FormEngine render  → FormField switches on field.kind
```

**Adding a question = editing only `template.ts`.** The form render, validation rules, and markdown output all update automatically. The Claude Code plugin also derives from it — re-run `npm run build:skill` after editing (see below).

## Key files

| File | Role |
|---|---|
| `src/schema/types.ts` | `Field \| Section \| Template`, `Answers` types |
| `src/schema/template.ts` | The six-section seed template — **edit here to add/change questions** |
| `src/schema/validation.ts` | `deriveSchema(template)` → Zod; `getDefaultValues(template)` |
| `src/schema/compiler.ts` | Pure `compileMarkdown(template, answers) → string` |
| `src/components/PromptBuilder.tsx` | Root: RHF form + `useCompletion` + draft persistence |
| `src/components/FormField.tsx` | Switches on `field.kind` → Input / Textarea / NativeSelect / MultiSelect |
| `src/components/PreviewPanel.tsx` | Three-tab pane: Raw · Preview · AI Response |
| `server/app.ts` | Hono routes: `POST /api/generate` (SSE) + `POST /api/validate`. Reads the client key from the `Authorization` header **per request** — never stored or logged |
| `server/providers.ts` | `buildModel(provider, key)` → per-request `createAnthropic` / `createOpenAI` |
| `src/llm/providers.ts` | Client provider registry (ids, labels, default models, key hints) |
| `src/context/ApiKeyContext.tsx` | In-memory BYOK key state (`save` / `forget` / `validate`) — never persisted |
| `src/components/ApiKeyPopover.tsx` | Header popover: provider + masked key + connection status |

## Trust boundary

Clients bring their own provider key (**BYOK**). The key travels per-request in an HTTP header (`Authorization: Bearer …` + `x-llm-provider`) over HTTPS to `POST /api/generate`, is used once via `buildModel()` (`server/providers.ts`) to construct the provider, and is **never stored, logged, or written to disk**. On the client it lives in memory only (`src/context/ApiKeyContext.tsx`) — never in `localStorage`, never compiled into the markdown spec. All model calls still go through the server route; never add model calls to client code. Vite dev server proxies `/api/*` → `http://localhost:3001`.

## Claude Code plugin (`/perfect-prompt`)

A second consumer of the same questionnaire that runs **inside Claude Code** — keyless (the host
*is* the LLM, so there's no BYOK, no server, no `/api/*`). It asks the six sections conversationally
(native picker via `AskUserQuestion` for choice fields with ≤4 options; plain text otherwise),
compiles the **identical** markdown spec, shows it, then answers it in-session.

| Path | Role |
|---|---|
| `scripts/build-skill.ts` | Codegen: imports `PERFECT_PROMPT_TEMPLATE` → writes the skill's `template.json`. Run via `npm run build:skill` (chained into `npm run build`) |
| `plugins/perfect-prompt/skills/perfect-prompt/SKILL.md` | The workflow + compiler rules (ported from `compiler.ts`) the skill follows |
| `plugins/perfect-prompt/skills/perfect-prompt/template.json` | **Generated — do not hand-edit.** The questionnaire data the skill reads |
| `plugins/perfect-prompt/skills/perfect-prompt/examples/` | Practice answer sets (replay + diff vs the web app) |
| `plugins/perfect-prompt/commands/perfect-prompt.md` | `/perfect-prompt` slash-command entry |
| `plugins/perfect-prompt/.claude-plugin/plugin.json` · `.claude-plugin/marketplace.json` | Plugin + marketplace manifests |

`template.json` is the **single source of truth made portable**: edit `template.ts`, run
`npm run build:skill`, and the skill stays in sync (CI can enforce with `git diff --exit-code
plugins/`). Install locally with `/plugin marketplace add .` then `/plugin install
perfect-prompt@halalprompt`.

## Field kinds

`text` · `textarea` · `select` · `multiselect` — all handled by `FormField.tsx`. To add a new kind, add the type in `types.ts`, add a Zod branch in `validation.ts`, and add a render branch in `FormField.tsx`.

## State flow

```
RHF (field values, validation)
  └── form.watch() → compileMarkdown() → live markdown (useMemo)
        └── form.handleSubmit() → complete(markdown)   ← AI SDK useCompletion
              └── /api/generate → streamText() → SSE → completion string
```

Generate is disabled while `isLoading` (double-submit guard), while `!form.formState.isValid`, and until an API key is set.

## Draft persistence

`useFormPersistence` debounces localStorage writes (400 ms). Draft key: `prompt-draft-<templateId>`. Loaded on mount in `PromptBuilder`. An always-available **Reset** button clears the answers, draft, and AI response (the API key is kept). The key is never written to the draft.

## Changing the model / providers

Edit the registry in `src/llm/providers.ts` (labels + default model per provider) and the
matching `DEFAULT_MODEL` map in `server/providers.ts`. Add a provider by extending the
`ProviderId` union + factory `switch` in `server/providers.ts` and adding an entry to
`PROVIDERS` in `src/llm/providers.ts`.

## Stack

- Vite 6 + React 19 + TypeScript (strict)
- Tailwind CSS v4 via `@tailwindcss/vite`
- React Hook Form + Zod
- Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai`) — `useCompletion` client hook, `streamText` / `generateText` server, per-request `createAnthropic` / `createOpenAI`
- Hono + `@hono/node-server` for the API layer
- `react-markdown` + `remark-gfm` for rendered preview
