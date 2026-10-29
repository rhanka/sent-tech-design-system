/**
 * `uml@2` - the completed UML class-diagram profile (M3 §3.11.1, A.4).
 *
 * Seven named schemas (six entity kinds plus the identity-abstract
 * multiplicity struct), four relations and six constraints. Multiplicity is
 * the K6 structured-value carrier; stereotypes apply through K2 references.
 */
import type { Profile } from "../profile.js";

export const UML2_PROFILE_ID = "uml@2" as const;

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

const visibility = (): JsonRecord => enumeration("visibility", ["public", "protected", "private", "package"]);

const stereotypes = (): JsonRecord => ({
  name: "stereotypes",
  kind: "collection",
  item: { kind: "reference", refKind: "entity", targetTypes: ["stereotype"] },
  maxItems: 8,
});

const common = (): JsonRecord[] => [text("name", 200, true), visibility(), stereotypes()];

const multiplicity = (name: string): JsonRecord => ({ name, kind: "struct", targetTypes: ["multiplicity"] });

const aggregation = (name: string): JsonRecord => enumeration(name, ["none", "shared", "composite"]);

function buildDeclaration(): Record<string, unknown> {
  const generalization = pair("generalization", ["class", "interface"]);
  (generalization as JsonRecord)["hierarchy"] = {
    id: "uml-generalization",
    shape: "dag",
    parentRole: "target",
    childRole: "source",
  };
  return {
    id: "uml@2",
    name: "uml",
    version: 2,
    completeness: "complete",
    entityTypes: [
      { id: "class", label: "Class", attributes: [...common(), bool("abstract"), bool("isStatic")] },
      { id: "interface", label: "Interface", attributes: common() },
      { id: "package", label: "Package", container: true, attributes: common() },
      {
        id: "property",
        label: "Property",
        attributes: [...common(), text("typeName", 200), multiplicity("multiplicity"), bool("isDerived"), bool("isStatic")],
      },
      {
        id: "operation",
        label: "Operation",
        attributes: [...common(), text("returnTypeName", 200), bool("isStatic")],
      },
      {
        id: "stereotype",
        label: "Stereotype",
        attributes: [
          text("name", 60, true),
          {
            name: "extends",
            kind: "collection",
            required: true,
            item: { kind: "enum", values: ["class", "interface", "package", "property", "operation"] },
            minItems: 1,
            maxItems: 5,
          },
        ],
      },
      {
        id: "multiplicity",
        label: "Multiplicity",
        abstract: true,
        attributes: [
          { name: "lower", kind: "quantity", required: true, units: ["unit"], integer: true, min: 0, max: 9007199254740991 },
          { name: "upper", kind: "quantity", required: true, units: ["unit"], integer: true, min: -1, max: 9007199254740991 },
          bool("isOrdered"),
          bool("isUnique"),
        ],
      },
    ],
    portTypes: [],
    relationTypes: [
      {
        ...pair("association", ["class", "interface"]),
        attributes: [
          multiplicity("sourceMultiplicity"),
          multiplicity("targetMultiplicity"),
          aggregation("sourceAggregation"),
          aggregation("targetAggregation"),
        ],
      },
      generalization,
      pair("dependency"),
      hierarchy("packageContainment", "uml-package-containment", "package"),
    ],
    constraints: [
      { kind: "acyclic-hierarchy", hierarchyId: "uml-package-containment" },
      { kind: "acyclic-hierarchy", hierarchyId: "uml-generalization" },
      { kind: "bound-pair", valueType: "multiplicity", lowerField: "lower", upperField: "upper", unboundedUpper: -1 },
      {
        kind: "reference-application",
        attribute: "stereotypes",
        declarationType: "stereotype",
        allowedTypesField: "extends",
      },
      {
        kind: "at-most-value",
        relationType: "association",
        attributes: ["sourceAggregation", "targetAggregation"],
        value: "composite",
        max: 1,
      },
      { kind: "collection-unique", entityType: "stereotype", attribute: "extends" },
    ],
    limits: { maxEndpointsPerRelation: 2 },
    notes: [],
  };
}

const declaration = buildDeclaration();

export const uml2Profile: Profile = declaration as unknown as Profile;
