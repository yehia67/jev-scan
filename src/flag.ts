import type { HunkJudgment, Relation } from "./types.ts";

export const THRESHOLDS = {
  weakensCheckMin: 0.7,
  relationConfidenceMin: 0.5,
} as const;

const FLAG_RELATIONS = new Set<Relation>([
  "unrelated_cleanup",
  "weakens_or_removes_check",
]);

export function decide(input: {
  hunk: HunkJudgment["hunk"];
  relation: Relation;
  relation_probabilities: Record<Relation, number>;
  relation_confidence: number;
  weakens_check: number;
  input_tokens: number;
  seconds: number;
}): HunkJudgment {
  const reasons: string[] = [];
  let flagged = false;

  if (input.weakens_check >= THRESHOLDS.weakensCheckMin) {
    flagged = true;
    reasons.push(
      `weakens_check ${input.weakens_check.toFixed(2)} ≥ ${THRESHOLDS.weakensCheckMin}`,
    );
  }

  if (
    FLAG_RELATIONS.has(input.relation) &&
    input.relation_confidence >= THRESHOLDS.relationConfidenceMin
  ) {
    flagged = true;
    reasons.push(
      `relation=${input.relation} confidence ${input.relation_confidence.toFixed(2)}`,
    );
  }

  const review = input.relation_confidence < THRESHOLDS.relationConfidenceMin;
  if (review) {
    reasons.push(
      `relation confidence ${input.relation_confidence.toFixed(2)} < ${THRESHOLDS.relationConfidenceMin}`,
    );
  }

  return { ...input, flagged, review, reasons };
}
