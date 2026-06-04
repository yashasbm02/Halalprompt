# halalprompt

Schema-driven LLM prompt-builder. A guided form compiles structured answers into a markdown spec, then streams it to Claude via a server-side API route.

## Dev setup

```bash
cp .env.example .env.local   # add ANTHROPIC_API_KEY
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

**Adding a question = editing only `template.ts`.** The form render, validation rules, and markdown output all update automatically.

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
| `server/index.ts` | Hono on :3001 — receives compiled markdown, calls `streamText`, returns SSE |

## Trust boundary

The `ANTHROPIC_API_KEY` is **server-only**. All model calls go through `POST /api/generate`. Vite dev server proxies `/api/*` → `http://localhost:3001`. Never add model calls to client code.

## Field kinds

`text` · `textarea` · `select` · `multiselect` — all handled by `FormField.tsx`. To add a new kind, add the type in `types.ts`, add a Zod branch in `validation.ts`, and add a render branch in `FormField.tsx`.

## State flow

```
RHF (field values, validation)
  └── form.watch() → compileMarkdown() → live markdown (useMemo)
        └── form.handleSubmit() → complete(markdown)   ← AI SDK useCompletion
              └── /api/generate → streamText() → SSE → completion string
```

Generate button is disabled while `isLoading` (double-submit guard) and while `!form.formState.isValid`.

## Draft persistence

`useFormPersistence` debounces localStorage writes (400 ms). Draft key: `prompt-draft-<templateId>`. Loaded on mount in `PromptBuilder`. "Clear draft" button appears when a saved draft is detected.

## Changing the model

One line in `server/index.ts`:

```ts
model: anthropic('claude-sonnet-4-6'),  // swap model id here
```

## Stack

- Vite 6 + React 19 + TypeScript (strict)
- Tailwind CSS v4 via `@tailwindcss/vite`
- React Hook Form + Zod
- Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) — `useCompletion` client hook, `streamText` server
- Hono + `@hono/node-server` for the API layer
- `react-markdown` + `remark-gfm` for rendered preview
