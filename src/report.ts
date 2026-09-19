import { THRESHOLDS } from "./flag.ts";
import { MODEL } from "./types.ts";
import type { HunkJudgment, ScanJson } from "./types.ts";

export function toScanJson(prompt: string, judgments: HunkJudgment[]): ScanJson {
  return {
    model: MODEL,
    prompt,
    hunks: judgments.length,
    flagged: judgments
      .filter((row) => row.flagged)
      .map((row) => ({
        path: row.hunk.path,
        enclosing_function: row.hunk.enclosing_function,
        relation: row.relation,
        confidence: row.relation_confidence,
        weakens_check: row.weakens_check,
      })),
  };
}

export function printReport(input: {
  title: string;
  agentRequest: string;
  judgments: HunkJudgment[];
}) {
  const flagged = input.judgments.filter((row) => row.flagged);
  const ok = input.judgments.length - flagged.length;
  const seconds = Math.max(...input.judgments.map((row) => row.seconds), 0);
  const fileCol = Math.max(...input.judgments.map((row) => row.hunk.path.length), 12);

  console.log("");
  console.log("Jev checked an agent diff against the original request.");
  console.log("");
  console.log("Asked");
  for (const line of wrap(input.agentRequest, 68)) {
    console.log(`  ${line}`);
  }
  console.log("");
  console.log(`Looked at ${input.judgments.length} changes  ·  ${seconds.toFixed(1)}s`);
  console.log("");
  if (!flagged.length) {
    console.log("Nothing extra. All of it matches the request.");
    return;
  }
  console.log(`Not in the request  (${flagged.length})`);
  for (const row of flagged) {
    console.log(`  ${pad(row.hunk.path, fileCol + 2)}${why(row)}`);
  }
  console.log("");
  console.log(
    ok === 1
      ? "The other 1 change is the actual work."
      : `The other ${ok} changes are the actual work.`,
  );
  console.log("");
}

function why(row: HunkJudgment) {
  if (
    row.relation === "weakens_or_removes_check" ||
    row.weakens_check >= THRESHOLDS.weakensCheckMin
  ) {
    return "deleted a test";
  }
  if (row.hunk.id.includes("reformat")) return "formatting only";
  if (row.hunk.id.includes("rename")) return "rename not in the request";
  if (row.relation === "unrelated_cleanup") return "not part of the request";
  return row.relation.replaceAll("_", " ");
}

function pad(value: string, width: number) {
  return value.length >= width ? `${value}  ` : value + " ".repeat(width - value.length);
}

function wrap(text: string, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}
