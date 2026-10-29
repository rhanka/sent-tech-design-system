/**
 * Deterministic ArchiMate matrix case builder (spec A.4).
 *
 * The finite closed corpus: 62 ordered concept pairs × 11 relation ids =
 * 42,284 cases. Each expanded tuple yields an allowed case; every absent
 * tuple yields a rejection. `@relation` witnesses use real relation
 * targets, never entity stubs.
 */
import { ARCHIMATE_CONCEPT_NAMES } from "./profiles/archimate-matrix.js";
import type { ArchimateTuple } from "./profiles/archimate2.js";

export interface ArchimatePairCase {
  readonly relationType: string;
  readonly sourceType: string;
  readonly targetType: string;
  readonly expected: "allowed" | "rejected";
}

/** @deprecated Use ArchimatePairCase (renamed to keep the no-transform invariant). */
export type ArchimateMatrixCase = ArchimatePairCase;

const typeIdOf = (name: string): string =>
  name === "Relationship" ? "@relation" : name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

export function buildArchimatePairCases(
  tuples: readonly ArchimateTuple[],
  relationshipIds: readonly string[],
): ArchimatePairCase[] {
  const allowed = new Set(tuples.map((t) => `${t.relationType}\0${t.sourceType}\0${t.targetType}`));
  const cases: ArchimatePairCase[] = [];
  for (const sourceName of ARCHIMATE_CONCEPT_NAMES) {
    for (const targetName of ARCHIMATE_CONCEPT_NAMES) {
      for (const relationType of relationshipIds) {
        const sourceType = typeIdOf(sourceName);
        const targetType = typeIdOf(targetName);
        cases.push({
          relationType,
          sourceType,
          targetType,
          expected: allowed.has(`${relationType}\0${sourceType}\0${targetType}`) ? "allowed" : "rejected",
        });
      }
    }
  }
  return cases;
}
