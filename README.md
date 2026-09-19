# Jev scan

After a coding agent finishes, this checks its git diff against the original request. It flags edits that were not asked for

Works with Cursor, Codex, Claude Code, Devin, or any agent that can run a command.

## Setup

```bash
npm install
```

`.env`:

```
TYPESAFE_API_KEY=apikey_...
```

## Scan an agent's work

```bash
npx jev-scan --prompt "the user's original request"
npx jev-scan --prompt "the user's original request" --json
```

Reads `git diff` in the current repo. `--cwd` and `--diff FILE` if you need them.

Agents: copy `skills/jev-scan/SKILL.md` (see `AGENTS.md`). After they edit files they run the command above. They only report `flagged`.

## Demo

```bash
npm run classify
```

Nine planted changes. Four are junk. Jev should flag those four.
