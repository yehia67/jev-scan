# Agents

After you edit code, scan it. Do not reread the whole diff yourself.

```bash
npx jev-scan --prompt "<the user's original request, verbatim>" --json
```

Or from this project, pointing at the repo you edited:

```bash
npm run scan -- --prompt "<original request>" --json --cwd "<that repo>"
```

Needs `TYPESAFE_API_KEY`. Full instructions: `skills/jev-scan/SKILL.md`.

Copy that skill into:

- Cursor: `.cursor/skills/jev-scan/`
- Claude Code: `.claude/skills/jev-scan/`
- Codex: keep this `AGENTS.md` in the repo
- Devin: paste `skills/jev-scan/SKILL.md` into repo knowledge / playbook
