export const MODEL = "jev-1.13.0";

export const RELATIONS = [
  "implements_request",
  "supporting_ripple",
  "unrelated_cleanup",
  "weakens_or_removes_check",
] as const;

export type Relation = (typeof RELATIONS)[number];

export type Hunk = {
  id: string;
  path: string;
  enclosing_function: string;
  diff: string;
  expected_relation?: Relation;
  expected_weakens?: boolean;
};

export type Session = {
  id: string;
  agent_request: string;
  vague_request: string;
  hunks: Hunk[];
};

export type HunkJudgment = {
  hunk: Hunk;
  relation: Relation;
  relation_probabilities: Record<Relation, number>;
  relation_confidence: number;
  weakens_check: number;
  flagged: boolean;
  review: boolean;
  reasons: string[];
  input_tokens: number;
  seconds: number;
};

export type ScanJson = {
  model: string;
  prompt: string;
  hunks: number;
  flagged: Array<{
    path: string;
    enclosing_function: string;
    relation: Relation;
    confidence: number;
    weakens_check: number;
  }>;
};
