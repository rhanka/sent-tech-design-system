/**
 * `archimate@2` - the completed ArchiMate profile (M3 §3.9.2, A.4).
 *
 * Deterministic expansion over the pinned 61-row catalogue and the full
 * tuple set: 62 native type declarations, 12 relation declarations and 3
 * constraints. Relation-target endpoints use the shared carrier (§3.9.1)
 * with targets `entity` and `relation`.
 */
import type { Profile } from "../profile.js";
import {
  ARCHIMATE_CATALOGUE,
  ARCHIMATE_CONCEPT_NAMES,
  ARCHIMATE_MATRIX_CELLS,
  RELATION_KEY,
} from "./archimate-matrix.js";

export { ARCHIMATE_CATALOGUE };

export const ARCHIMATE2_PROFILE_ID = "archimate@2" as const;

export const ARCHIMATE_RELATIONSHIP_IDS = [
  "composition",
  "aggregation",
  "assignment",
  "realization",
  "serving",
  "access",
  "influence",
  "triggering",
  "flow",
  "association",
  "specialization",
] as const;

export interface ArchimateTuple {
  readonly relationType: string;
  readonly sourceType: string;
  readonly targetType: string;
}

export function expandArchimateTuples(): ArchimateTuple[] {
  const typeId = (name: string): string =>
    name === "Relationship" ? "@relation" : name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const out: ArchimateTuple[] = [];
  ARCHIMATE_MATRIX_CELLS.forEach((row, i) => {
    row.split(" ").forEach((keys, j) => {
      if (keys === "-") return;
      for (const k of keys) {
        out.push({
          relationType: RELATION_KEY[k] as string,
          sourceType: typeId(ARCHIMATE_CONCEPT_NAMES[i] as string),
          targetType: typeId(ARCHIMATE_CONCEPT_NAMES[j] as string),
        });
      }
    });
  });
  return out;
}

type JsonRecord = Record<string, unknown>;

const text = (name: string, maxLength?: number, required = false): JsonRecord => ({
  name,
  kind: "text",
  ...(required ? { required: true } : {}),
  ...(maxLength === undefined ? {} : { maxLength }),
});

const bool = (name: string): JsonRecord => ({ name, kind: "boolean" });

const enumeration = (name: string, values: readonly string[], required = false): JsonRecord => ({
  name,
  kind: "enum",
  values: [...values],
  ...(required ? { required: true } : {}),
});

const role = (name: string, targets: readonly string[], entityTypes?: readonly string[]): JsonRecord => ({
  role: name,
  cardinality: { min: 1, max: 1 },
  targets: [...targets],
  ...(entityTypes === undefined ? {} : { entityTypes: [...entityTypes] }),
});

const pair = (id: string, entityTypes?: readonly string[], targets: readonly string[] = ["entity"]): JsonRecord => ({
  id,
  label: id,
  direction: "directed",
  roles: [role("source", targets, entityTypes), role("target", targets, entityTypes)],
});

const hierarchy = (
  id: string,
  hierarchyId: string,
  parentType: string,
  childTypes?: readonly string[],
): JsonRecord => ({
  id,
  label: id,
  direction: "directed",
  roles: [role("parent", ["entity"], [parentType]), role("child", ["entity"], childTypes)],
  hierarchy: { id: hierarchyId, shape: "tree", parentRole: "parent", childRole: "child" },
});

function buildDeclaration(): Record<string, unknown> {
  const tuples = expandArchimateTuples();
  return {
    id: "archimate@2",
    name: "archimate",
    version: 2,
    completeness: "complete",
    entityTypes: [
      { id: "element", label: "Element", abstract: true, attributes: [] },
      ...ARCHIMATE_CATALOGUE.map((c) => ({
        id: c.id,
        label: c.name,
        supertypes: ["element"],
        ...(c.id === "grouping" ? { container: true } : {}),
        attributes: [
          ...(c.id === "junction"
            ? [enumeration("operator", ["and", "or"], true)]
            : [text("name", 200, c.id !== "grouping")]),
          ...(c.layer === "none" ? [] : [enumeration("layer", [c.layer], true)]),
          enumeration("aspect", [c.aspect]),
        ],
      })),
    ],
    portTypes: [],
    relationTypes: [
      ...ARCHIMATE_RELATIONSHIP_IDS.map((id) => ({
        ...pair(id, undefined, ["entity", "relation"]),
        ...(id === "access"
          ? { attributes: [enumeration("accessMode", ["write", "read", "unspecified", "read-write"])] }
          : id === "influence"
            ? { attributes: [text("strength")] }
            : id === "association"
              ? { attributes: [bool("directed")] }
              : {}),
      })),
      hierarchy("groupingContainment", "archimate-grouping", "grouping", ["element"]),
    ],
    constraints: [
      { kind: "acyclic-hierarchy", hierarchyId: "archimate-grouping" },
      {
        kind: "relationship-matrix",
        matrixId: "archimate-3.2",
        sourceRole: "source",
        targetRole: "target",
        tuples,
      },
      {
        kind: "incident-type-uniformity",
        matrixId: "archimate-3.2",
        entityType: "junction",
        relationTypes: [...ARCHIMATE_RELATIONSHIP_IDS],
      },
    ],
    limits: { maxEndpointsPerRelation: 2 },
    notes: [],
  };
}

const declaration = buildDeclaration();

export const archimate2Profile: Profile = declaration as unknown as Profile;
