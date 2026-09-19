#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const cli = resolve(dirname(fileURLToPath(import.meta.url)), "../src/cli.ts");
const child = spawn(
  process.execPath,
  ["--experimental-strip-types", cli, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    cwd: process.cwd(),
    env: { ...process.env, NODE_NO_WARNINGS: "1" },
  },
);
child.on("exit", (code) => process.exit(code ?? 1));
