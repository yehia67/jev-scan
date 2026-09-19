import type { Hunk } from "./types.ts";

export function parseUnifiedDiff(text: string): Hunk[] {
  const hunks: Hunk[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let path = "unknown";
  let n = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (line.startsWith("diff --git ")) {
      const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
      path = match ? (match[2] === "/dev/null" ? match[1] : match[2]) : "unknown";
      n = 0;
      continue;
    }
    if (line.startsWith("+++ ")) {
      const plus = line.slice(4).trim();
      if (plus !== "/dev/null") path = plus.replace(/^b\//, "");
      continue;
    }
    if (!line.startsWith("@@ ")) continue;

    const close = line.indexOf("@@", 3);
    const enclosing = close >= 0 ? line.slice(close + 2).trim() : "";
    const body = [line];
    i += 1;
    while (i < lines.length) {
      const next = lines[i] ?? "";
      if (next.startsWith("@@ ") || next.startsWith("diff --git ")) {
        i -= 1;
        break;
      }
      body.push(next);
      i += 1;
    }
    n += 1;
    hunks.push({
      id: `${path}#${n}`,
      path,
      enclosing_function: enclosing || "(file)",
      diff: body.join("\n").trimEnd(),
    });
  }

  return hunks;
}
