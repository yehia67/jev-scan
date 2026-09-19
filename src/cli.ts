import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { classifyHunks } from "./classify.ts";
import { collectWorkingTreeDiff } from "./git-diff.ts";
import { parseUnifiedDiff } from "./parse-diff.ts";
import { printReport, toScanJson } from "./report.ts";
import type { Hunk, Session } from "./types.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

type Args = {
  prompt?: string;
  promptFile?: string;
  diffFile?: string;
  cwd: string;
  json: boolean;
  fixture: boolean;
  vague: boolean;
  help: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {
    cwd: process.cwd(),
    json: false,
    fixture: false,
    vague: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") args.json = true;
    else if (a === "--fixture") args.fixture = true;
    else if (a === "--vague") args.vague = true;
    else if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--prompt") args.prompt = argv[++i];
    else if (a === "--prompt-file") args.promptFile = argv[++i];
    else if (a === "--diff") args.diffFile = argv[++i];
    else if (a === "--cwd") args.cwd = argv[++i] ?? args.cwd;
  }
  return args;
}

function help() {
  console.log(`jev-scan — check agent edits against the original request

  jev-scan --prompt "the user's original request"
  jev-scan --prompt "..." --json
  jev-scan --fixture

Reads git changes in the current repo (or --cwd). Pass --diff FILE to use a patch.
`);
}

async function loadPrompt(args: Args): Promise<string> {
  if (args.promptFile) {
    return (await readFile(args.promptFile, "utf8")).trim();
  }
  if (args.prompt?.trim()) return args.prompt.trim();
  throw new Error("Pass --prompt \"...\" (the user's original request).");
}

async function loadHunks(args: Args): Promise<{ prompt: string; hunks: Hunk[]; title: string }> {
  if (args.fixture) {
    const session = JSON.parse(
      await readFile(resolve(root, "fixtures/login-fix.session.json"), "utf8"),
    ) as Session;
    return {
      prompt: args.vague ? session.vague_request : session.agent_request,
      hunks: session.hunks,
      title: args.vague ? "Vague prompt" : "Demo fixture",
    };
  }

  const prompt = await loadPrompt(args);
  const diff = args.diffFile
    ? await readFile(args.diffFile, "utf8")
    : await collectWorkingTreeDiff(args.cwd);
  return {
    prompt,
    hunks: parseUnifiedDiff(diff),
    title: "Agent scan",
  };
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  help();
  process.exit(0);
}

const { prompt, hunks, title } = await loadHunks(args);
if (!hunks.length) {
  if (args.json) {
    console.log(JSON.stringify({ model: "jev-1.13.0", prompt, hunks: 0, flagged: [] }));
  } else {
    console.log("No changes to scan.");
  }
  process.exit(0);
}

const judgments = await classifyHunks(prompt, hunks);
if (args.json) {
  console.log(JSON.stringify(toScanJson(prompt, judgments), null, 2));
} else {
  printReport({ title, agentRequest: prompt, judgments });
}
process.exit(judgments.some((row) => row.flagged) ? 1 : 0);
