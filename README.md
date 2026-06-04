# halalprompt

A schema-driven prompt-builder that turns structured form answers into a polished markdown spec, then streams it live to Claude.

Fill in six sections → watch your prompt compile in real time → click Generate → get a streaming AI response.

---

## What it does

| Step                  | What happens                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------- |
| **Fill the form**     | Six guided sections covering Role, Objective, Context, Scope, Depth, and Tone                 |
| **Live preview**      | Every keystroke recompiles your answers into formatted markdown — Raw or rendered Preview tab |
| **Generate**          | The compiled spec is sent to Claude via a server-side API route; the response streams back    |
| **Draft persistence** | Your work is auto-saved to `localStorage` and restored on next visit                          |

---

## The six sections

1. **Role & Perspective** — what expert identity the model should adopt
2. **Core Objective & Deliverable** — exactly what must be produced and in what format
3. **Context & Constraints** — background, tech stack, and hard limits
4. **Scope & Boundaries** — what's explicitly in or out of scope
5. **Depth & Structure** — response thoroughness, analysis lenses, and output format
6. **Tone & Audience** — communication register and reader level

---

## Getting started

```bash
# 1. Copy env file and add your Anthropic API key
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Start both the Vite dev server (port 5173) and Hono API (port 3001)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> **Requires Node.js 18+**

### Environment

```
ANTHROPIC_API_KEY=sk-ant-...   # server-only — never sent to the browser
```

---

## Building for production

```bash
npm run build   # type-checks with tsc -b, then bundles with Vite
```

<!-- --- -->

<!-- ## Project structure

```
src/
  schema/
    types.ts          Field | Section | Template, Answers types
    template.ts       Six-section seed template  ← edit here to add questions
    validation.ts     deriveSchema() → Zod, getDefaultValues()
    compiler.ts       compileMarkdown(template, answers) → string
  components/
    PromptBuilder.tsx  Root: form + streaming + persistence
    FormField.tsx      Renders text / textarea / select / multiselect
    PreviewPanel.tsx   Three-tab pane: Raw · Preview · AI Response
  hooks/
    useFormPersistence.ts  Debounced localStorage draft (400 ms)
server/
  index.ts            Hono on :3001 — calls streamText, returns SSE
```

### Single source of truth

Everything derives from one `Template` object in `template.ts`:

```
Template
  ├── deriveSchema()    → Zod schema   (React Hook Form resolver)
  ├── compileMarkdown() → markdown     (live preview + LLM payload)
  └── FormField render  → switches on field.kind
```

**Adding a question means editing only `template.ts`.** Validation, form render, and markdown output all update automatically.

---

## Field kinds

| Kind | Component | Notes |
|---|---|---|
| `text` | `<Input>` | Single line, optional `maxLength` counter |
| `textarea` | `<Textarea>` | Multi-line, configurable `rows` |
| `select` | `<NativeSelect>` | Single choice, native `<select>` |
| `multiselect` | `<MultiSelect>` | Toggle chips, returns `string[]` | -->

<!-- --- -->

## Changing the model

One line in `server/index.ts`:

```ts
model: anthropic('claude-sonnet-4-6'),  // swap model id here
```

---

## Security

The `ANTHROPIC_API_KEY` lives **server-side only**. All model calls go through `POST /api/generate`. The Vite dev server proxies `/api/*` → `http://localhost:3001`. The key never touches the browser.

---

## Stack

- **Vite 6** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **React Hook Form** + **Zod** — schema-derived validation
- **Vercel AI SDK** — `useCompletion` (client) + `streamText` (server)
- **Hono** + `@hono/node-server` — lightweight API layer
- `react-markdown` + `remark-gfm` — rendered markdown preview
