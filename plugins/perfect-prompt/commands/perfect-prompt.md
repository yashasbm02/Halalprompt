---
description: Build a structured "Perfect Prompt" spec via a guided six-section questionnaire, then answer it.
---

Invoke the **perfect-prompt** skill to build a structured prompt spec, then answer it.

Follow the skill's workflow exactly. Collect my answers in **one turn** — do not ask one
field at a time:

- If I passed text after the command (see `$ARGUMENTS` below), treat it as a **brief**:
  infer as many fields as you can, then ask only for the missing required ones, all together.
- If I passed nothing, show the **one-shot fill-in form** (the whole questionnaire at once)
  and let me paste it back filled in.
- If I ask to be "walked through it", switch to the guided, one-section-per-turn mode.

Then enforce the required fields, compile the markdown spec, show it to me, and generate the
response to that spec in this session.

Do not ask me for an API key and do not call any `/api/*` endpoint — you are the model.

$ARGUMENTS
