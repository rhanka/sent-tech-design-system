/**
 * UML multiplicity parser (spec §3.11, A.2).
 *
 * Admitted notations are `n`, `n..m`, `n..*` and `*` (`0..*`) only, with no
 * trimming or guessing. Anything else is a `multiplicity-syntax` refusal;
 * a syntactically valid reversed range is `multiplicity-invalid`.
 */

export type MultiplicityParse =
  | { readonly ok: true; readonly lower: number; readonly upper: number }
  | { readonly ok: false; readonly reason: "multiplicity-syntax" | "multiplicity-invalid" };

const SAFE_MAX = 9007199254740991;

export function parseMultiplicity(raw: string): MultiplicityParse {
  if (raw === "*") return { ok: true, lower: 0, upper: -1 };
  const m = /^([0-9]+)(\.\.(\*|[0-9]+))?$/.exec(raw);
  if (m === null) return { ok: false, reason: "multiplicity-syntax" };
  const lower = Number(m[1]);
  const upper = m[3] === undefined ? lower : m[3] === "*" ? -1 : Number(m[3]);
  if (lower > SAFE_MAX || (upper !== -1 && upper > SAFE_MAX)) return { ok: false, reason: "multiplicity-syntax" };
  if (upper !== -1 && lower > upper) return { ok: false, reason: "multiplicity-invalid" };
  return { ok: true, lower, upper };
}

export type UmlMultiplicityExpectation =
  | { readonly ok: true; readonly lower: number; readonly upper: number }
  | { readonly ok: false; readonly reason: "multiplicity-syntax" | "multiplicity-invalid" };

export interface UmlMultiplicityCase {
  readonly input: string;
  readonly expected: UmlMultiplicityExpectation;
}

/** Appendix A.2 admitted notations and refusals, in order. */
export const UML_MULTIPLICITY_ORACLE: readonly UmlMultiplicityCase[] = [
  { input: "1", expected: { ok: true, lower: 1, upper: 1 } },
  { input: "0..1", expected: { ok: true, lower: 0, upper: 1 } },
  { input: "1..5", expected: { ok: true, lower: 1, upper: 5 } },
  { input: "*", expected: { ok: true, lower: 0, upper: -1 } },
  { input: "1..*", expected: { ok: true, lower: 1, upper: -1 } },
  { input: " 1", expected: { ok: false, reason: "multiplicity-syntax" } },
  { input: "1 ", expected: { ok: false, reason: "multiplicity-syntax" } },
  { input: "one", expected: { ok: false, reason: "multiplicity-syntax" } },
  { input: "", expected: { ok: false, reason: "multiplicity-syntax" } },
  { input: "1...2", expected: { ok: false, reason: "multiplicity-syntax" } },
];
