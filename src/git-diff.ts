import { spawn } from "node:child_process";

function git(cwd: string, args: string[]): Promise<{ stdout: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", args, { cwd, env: process.env });
    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", () => {});
    child.on("error", reject);
    child.on("close", (code) => resolve({ stdout, code: code ?? 1 }));
  });
}

export async function collectWorkingTreeDiff(cwd: string): Promise<string> {
  const inside = await git(cwd, ["rev-parse", "--is-inside-work-tree"]);
  if (inside.code !== 0 || inside.stdout.trim() !== "true") {
    throw new Error(`Not a git repository: ${cwd}`);
  }

  const head = await git(cwd, ["rev-parse", "--verify", "HEAD"]);
  const changed =
    head.code === 0
      ? await git(cwd, ["diff", "HEAD", "--no-color", "--"])
      : await git(cwd, ["diff", "--no-color", "--"]);

  const untracked = await git(cwd, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
  ]);
  const empty = process.platform === "win32" ? "NUL" : "/dev/null";
  const parts = [changed.stdout];

  for (const file of untracked.stdout.split("\0").filter(Boolean)) {
    const diff = await git(cwd, [
      "diff",
      "--no-index",
      "--no-color",
      "--",
      empty,
      file,
    ]);
    parts.push(diff.stdout);
  }

  return parts.filter((part) => part.trim()).join("\n");
}
