// Types of rawgate/dl-rawgate.mjs (§2.7 of SPEC_EVOL_DL01_BIJECTION_HARNESS).
export const RAWGATE_SCHEMA: "dl-rawgate/1";
export interface RawgateRule {
  readonly minWordLength: 4;
  readonly minIdLength: 2;
  readonly ngramSizes: readonly number[];
}
export interface RawgateItem {
  readonly kind: "word" | "ngram" | "id";
  readonly token: string;
  readonly line: number; // 1-based
}
export function tokenise(text: string, rule: RawgateRule): RawgateItem[];
export function digest(key: Uint8Array, kind: "text" | "id", token: string): string; // 32 hex
export function keyId(key: Uint8Array): string; // 16 hex
export function newKey(): Uint8Array; // 32 random bytes
export function loadKeyFromEnv(env: NodeJS.ProcessEnv): Uint8Array | null; // fail closed: null when absent
export interface RawgateDigestFile {
  readonly schema: "dl-rawgate/1";
  readonly keyId: string;
  readonly baselineCommit: string;
  readonly minWordLength: 4;
  readonly minIdLength: 2;
  readonly ngramSizes: readonly number[];
  readonly count: number;
  readonly digests: readonly string[]; // ascending, unique, both classes mixed
  readonly allow: readonly { readonly digest: string; readonly reason: string }[];
}
export function buildDigestFile(input: {
  readonly key: Uint8Array;
  readonly rawStrings: readonly string[];
  readonly rawIdentifiers: readonly string[];
  readonly baseline: { readonly commit: string; readonly texts: Iterable<string> };
}): { readonly file: RawgateDigestFile; readonly baselinePresent: number };
export interface RawgateHit {
  readonly file: string;
  readonly line: number;
  readonly kind: "word" | "ngram" | "id" | "commit-message";
  readonly digestPrefix: string;
}
export function parseRange(spec: string): { readonly base: string | null; readonly head: string };
export function scanTree(input: {
  readonly key: Uint8Array;
  readonly file: RawgateDigestFile;
  readonly repoRoot: string;
}): { readonly hits: readonly RawgateHit[]; readonly files: number };
export function scanCommitMessages(input: {
  readonly key: Uint8Array;
  readonly file: RawgateDigestFile;
  readonly repoRoot: string;
  readonly range: string;
}): { readonly hits: readonly RawgateHit[]; readonly commits: number; readonly notice?: string | null };
