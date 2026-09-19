import { hunkQuestions } from "./questions.ts";
import { getClient, MODEL } from "./client.ts";
import { decide } from "./flag.ts";
import type { Hunk, HunkJudgment } from "./types.ts";

export async function classifyHunk(
  agentRequest: string,
  hunk: Hunk,
): Promise<HunkJudgment> {
  const started = performance.now();
  const response = await getClient().systemOne({
    model: MODEL,
    state: {
      agent_request: agentRequest,
      hunk: {
        path: hunk.path,
        enclosing_function: hunk.enclosing_function,
        diff: hunk.diff,
      },
    },
    questions: hunkQuestions,
  });
  const relation = response.answers.relation;
  return decide({
    hunk,
    relation: relation.choice,
    relation_probabilities: {
      implements_request: relation.probabilities.implements_request ?? 0,
      supporting_ripple: relation.probabilities.supporting_ripple ?? 0,
      unrelated_cleanup: relation.probabilities.unrelated_cleanup ?? 0,
      weakens_or_removes_check:
        relation.probabilities.weakens_or_removes_check ?? 0,
    },
    relation_confidence: relation.confidence,
    weakens_check: response.answers.weakens_check.noul,
    input_tokens: response.usage.input_tokens ?? 0,
    seconds: (performance.now() - started) / 1000,
  });
}

export async function classifyHunks(
  agentRequest: string,
  hunks: Hunk[],
): Promise<HunkJudgment[]> {
  return Promise.all(hunks.map((hunk) => classifyHunk(agentRequest, hunk)));
}
