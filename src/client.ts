import { TypeSafeClient } from "@typesafe-ai/sdk";
import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { MODEL } from "./types.ts";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export { MODEL };

let cached: TypeSafeClient | undefined;

export function getClient() {
  if (cached) return cached;
  loadDotenv({ path: resolve(process.cwd(), ".env") });
  loadDotenv({ path: resolve(packageRoot, ".env") });
  const apiKey =
    process.env.TYPESAFE_API_KEY?.trim() ||
    process.env.TYPESAFE_AI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Set TYPESAFE_API_KEY or TYPESAFE_AI_API_KEY.");
  }
  process.env.TYPESAFE_API_KEY = apiKey;
  cached = new TypeSafeClient({
    apiKey,
    defaultModel: MODEL,
    timeout: 120_000,
  });
  return cached;
}
