# perfect-prompt — Claude Code Plugin

Turn a vague task into a structured, high-quality LLM prompt — in one turn, inside Claude Code.
No API key. No server. No extra setup beyond the install.

---

## What it does

`/perfect-prompt` walks you through a six-section questionnaire (role, objective, context,
scope, depth, tone), compiles your answers into a clean markdown spec, then **Claude answers
that spec in the same session**.

It is the Claude Code edition of the [halalprompt](https://github.com/yashas073/halalprompt)
web app — the same questionnaire, the same compiled output, zero network calls.

---

## Install (one-time)

You must have [Claude Code](https://claude.ai/code) installed.

```bash
# 1. Clone or open the repo in Claude Code
#    (skip if you already have it open)

# 2. Inside Claude Code, register the local marketplace:
/plugin marketplace add D:\yashas\halalprompt

# 3. Install the plugin:
/plugin install perfect-prompt@halalprompt
```

> **Tip:** Step 2 needs the **absolute path** to the repo root on your machine.
> Replace `D:\yashas\halalprompt` with wherever you cloned it.

---

## Usage

### Option A — One-shot form (default, fewest tokens)

Just run with no arguments:

```
/perfect-prompt
```

Claude prints the entire questionnaire as a fill-in template in one turn:

```
Fill in the form below and paste it back. Leave optional lines blank to skip.
For choice fields, type the value keyword or its number. Multiselect: comma-separate.

# 1. Role & Perspective
Role / Persona*:
Specialisation:

# 2. Core Objective & Deliverable
Primary Goal*:
Deliverable Format* (code|plan|analysis|draft|review|explanation|other):

# 3. Context & Constraints
Background*:
Technology Stack (react|nextjs|vue|svelte|typescript|nodejs|python|postgres|tailwind|graphql|rust|go):
Hard Constraints:

# 4. Scope & Boundaries
Include*:
Exclude:

# 5. Depth & Structure
Response Depth* (concise|balanced|thorough|exhaustive):
Analysis Lenses (architecture|tradeoffs|risks|second_order|testing|performance|security|dx):
Output Format (prose|bullets|headers|code_first|mixed):

# 6. Tone & Audience Alignment
Tone* (technical|collaborative|formal|casual|didactic):
Audience Level* (beginner|intermediate|senior|expert):
Additional Guidance:
```

Fill it in and paste it back in one reply. Claude parses, compiles the spec, shows it, then answers.

**Example filled form:**

```
# 1. Role & Perspective
Role / Persona*: Senior React engineer at a fintech startup
Specialisation: React 19, TypeScript strict, performance profiling

# 2. Core Objective & Deliverable
Primary Goal*: Find and fix a re-render bug causing the prompt preview to lag on every keystroke
Deliverable Format*: code

# 3. Context & Constraints
Background*: Vite + React 19 app; PreviewPanel re-renders on every form.watch() change
Technology Stack: react, typescript
Hard Constraints: No new dependencies

# 4. Scope & Boundaries
Include*: Root-cause analysis + the minimal diff
Exclude: Rewriting the form library

# 5. Depth & Structure
Response Depth*: thorough
Analysis Lenses: performance, dx
Output Format: code_first

# 6. Tone & Audience Alignment
Tone*: technical
Audience Level*: senior
Additional Guidance:
```

---

### Option B — Brief smart-fill (fastest when you know the ask)

Pass your task as text after the command:

```
/perfect-prompt build a prod-ready rate limiter for our Hono API in TypeScript
```

Claude infers as many fields as it can from your brief, shows you what it inferred, then
asks **only for the missing required fields** — all in one turn. Confirm and it compiles.

---

### Option C — Guided mode (most interactive)

If you want to be walked through it section by section:

```
/perfect-prompt
```

Then reply: **"walk me through it"**

Claude will ask one section per turn (all fields in that section together), never one field at a time.

---

## Required vs optional fields

Fields marked `*` are required and cannot be skipped. If you leave one blank, Claude will
re-ask all missing required fields together in one turn.

| Required | Optional |
|---|---|
| Role / Persona | Specialisation |
| Primary Goal | Technology Stack |
| Deliverable Format | Hard Constraints |
| Background | Exclude |
| Include | Analysis Lenses |
| Response Depth | Output Format |
| Tone | Additional Guidance |
| Audience Level | |

---

## What you get

After you fill in the form, Claude:

1. **Compiles a markdown spec** — the same format the halalprompt web app produces. Example:

```markdown
# The Perfect Prompt

## 1. Role & Perspective
*Define the identity and expert lens the model should adopt.*

**Role / Persona:**
Senior React engineer at a fintech startup

**Specialisation & Approach:**
React 19, TypeScript strict, performance profiling

## 2. Core Objective & Deliverable
*State exactly what must be produced.*

**Primary Goal:**
Find and fix a re-render bug causing the prompt preview to lag on every keystroke

**Deliverable Format:**
Working code / implementation
...
```

2. **Shows the spec** — in a fenced block you can copy, save, or reuse in any chat.
3. **Answers the spec immediately** — Claude generates the actual response (code, plan, review, etc.) right in the same session.

---

## Practice sets

Three ready-made answer sets live in `examples/` — use them to replay a session or compare
the compiled spec against the web app's output for the same answers:

| File | Scenario |
|---|---|
| `set-a-react-bugfix.json` | Fix a re-render performance bug (code, senior, thorough) |
| `set-b-architecture-doc.json` | Design a Claude Code plugin (plan, intermediate, exhaustive) |
| `set-c-code-review.json` | Security review of BYOK key handling (review, expert, concise) |

---

## Token cost

| Mode | Collection turns | Notes |
|---|---|---|
| One-shot form | ~1 | Default. Paste the form back once. |
| Brief smart-fill | ~1–2 | Fastest if you have a clear brief. |
| Guided | ~6 | One section per turn. More interactive. |

The old section-by-section approach (deprecated default) was ~14 turns. The new default
cuts collection cost by ~10×.

---

## Updating

If the questionnaire changes (a new field in `src/schema/template.ts`), regenerate the skill's
template data from the repo root:

```bash
npm run build:skill
```

Then reinstall the plugin in Claude Code:

```
/plugin install perfect-prompt@halalprompt
```

The compiled spec format stays byte-identical to the web app automatically.

---

## Security

- Claude Code **never asks for an API key** on this path — the Claude Code host is the model.
- Answers stay in the local session. Nothing is sent to any server or `/api/*` endpoint.
- The plugin contains only markdown and JSON — no executable code runs during the questionnaire.
