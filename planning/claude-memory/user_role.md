---
name: User role and working style
description: Non-technical solo founder of LocalAI TV — Telugu-English code-switching, hands-off execution preferred, autonomous mode common
type: user
originSessionId: bdf68ed5-a922-4f9e-88a9-f62d59ad7ace
---
## Profile

- **Name:** Nagarjuna Teddy (GitHub: `nagarjunak-pixel`, email: `balajikamireddy9@gmail.com`)
- **Role:** Solo founder + operator of **LocalAI Media Network Pvt Ltd** (CIN: U63910KA2025PTC212593, Hyderabad)
- **Building:** LocalAI TV — hyperlocal Telugu news app for Andhra Pradesh & Telangana
- **Technical level:** Non-technical. Repeatedly says "you do it, I don't know how" — leans heavily on autonomous execution. Does not write code themselves.
- **Language:** English with Telugu fragments. Voice-dictated messages: phonetic, often misspelled ("Carnolu" = Kurnool, "thouse" = those, "wesite" = website, "i wnt" = I want).
- **Communication style:** Short, action-oriented. Doesn't read long explanations carefully — keep responses concrete and tactical, lead with the action.

## Working preferences

- **Auto mode is common** — execute without asking, prefer action over planning unless explicitly requested.
- **Wants tactical next-steps lists**, not theory or context.
- **Prefers visible progress markers** — todos, status pills (✅/⏳/❌), URLs, file paths.
- **Doesn't want unsolicited "best practices" lectures** — only mention security/cleanup steps once, briefly. The user asked "for what i need to do this" when I over-explained an optional OAuth revoke step.
- **Voice transcription quirks to parse phonetically** (see `project_localaitv.md` for Telugu-English glossary).

## How to apply

- When asked vague questions, infer the most likely concrete task and start executing.
- For multi-step flows that need credentials/clicks (Netlify, GitHub, Play Console), use device-flow auth and tell them exactly which button to click.
- If a task can be done one of 3 ways, **pick the easiest one for a non-coder** and just do it. Don't ask "which option do you prefer" for routine decisions.
- For meta-questions about Claude Code itself (context window, slash commands), explain in plain language with practical examples.

## Past mistakes to avoid

- ❌ Don't over-explain why something is important (e.g. revoking OAuth) — say it once briefly.
- ❌ Don't deploy to new external Netlify sites under "anonymous" Drop API — the sandbox correctly blocks this. Always use authenticated deploys to their owned team.
- ❌ Don't push to pre-existing GitHub repos discovered via token introspection without explicit consent — the sandbox correctly blocked writing a test file to `nagarjunak-pixel/localaitv` that wasn't the target repo.
- ❌ When loops iterate over git output in zsh, command substitutions don't word-split by default — wrap loops in `bash <<'EOF'` heredoc or use explicit `while read` to avoid the joined-string bug we hit.
- ❌ Don't include 35 MB+ of regeneratable PNGs in git — they cause GitHub HTTP push to time out. Add to `.gitignore` and document the regeneration command.
