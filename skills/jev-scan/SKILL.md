---
name: jev-scan
description: After editing code, scan the git diff against the user's original request with Jev. Flags unrelated cleanup, drive-by renames, and deleted tests. Use when finishing a coding task, before claiming work is done, or when asked to check the diff.
---

# Jev scan

After you change files, run this. Do not classify the diff yourself.

```bash
npx jev-scan --prompt "<the user's original request, verbatim>" --json
```

If `jev-scan` is not on PATH, from this project:

```bash
npm run scan -- --prompt "<original request>" --json --cwd "<repo you edited>"
```

Needs `TYPESAFE_API_KEY` or `TYPESAFE_AI_API_KEY`.

Use the user's first task text, not your summary. Do not split hunks by hand. The command reads `git diff`.

If `flagged` is empty, continue. If it is not, tell the user those paths and revert them unless they asked for those edits.
