/**
 * `generic@2` - the complete generic successor (M3 §3.1, declaration §5.5).
 *
 * A replacement BASE, not a G0 child of `generic@1`: it removes `collapsed`,
 * the global container-name uniqueness and the container count limit, and
 * raises `link.label` to 200. It retains the general node/port attributes and
 * the link weight, and adds the semantic legend and legend-key types.
 *
 * Category is domain data (never a token, icon, order or footprint). Legend
 * drawing order is view data, not a semantic attribute.
 */

import type { Profile } from "../profile.js";

export const GENERIC2_PROFILE_ID = "generic@2" as const;

/** The declared containment hierarchy: a tree, so cycles are refused. */
export const GENERIC2_CONTAINMENT_HIERARCHY = "containment" as const;

/** Key grammar (M3 §3.3): min 1, max 40, `^[a-z][a-z0-9-]*$`, name `key`. */
export const GENERIC_KEY_PATTERN = "^[a-z][a-z0-9-]*$" as const;
export const GENERIC_KEY_PATTERN_NAME = "key" as const;

const keyCategory = (name: string, required: boolean) =>
  ({
    name,
    kind: "text",
    ...(required ? { required: true } : {}),
    minLength: 1,
    maxLength: 40,
    pattern: GENERIC_KEY_PATTERN,
    patternName: GENERIC_KEY_PATTERN_NAME,
  }) as const;

export const generic2Profile: Profile = {
  id: GENERIC2_PROFILE_ID,
  name: "generic",
  version: 2,
  completeness: "complete",
  entityTypes: [
    {
      id: "node",
      label: "Node",
      attributes: [
        { name: "name", kind: "text", required: true, maxLength: 200 },
        { name: "state", kind: "enum", values: ["draft", "active", "retired"] },
        { name: "weight", kind: "quantity", units: ["unit"] },
        { name: "duration", kind: "quantity", units: ["s", "min", "h"] },
        { name: "createdAt", kind: "date" },
        { name: "pinned", kind: "boolean" },
        { name: "tags", kind: "collection", item: { kind: "text", maxLength: 40 }, maxItems: 8 },
        { name: "owner", kind: "reference", refKind: "entity" },
        keyCategory("category", false),
      ],
    },
    {
      id: "container",
      label: "Container",
      container: true,
      attributes: [
        { name: "name", kind: "text", required: true, maxLength: 200 },
        keyCategory("category", false),
      ],
    },
    {
      id: "legend",
      label: "Legend",
      container: true,
      attributes: [
        { name: "name", kind: "text", required: true, maxLength: 200 },
        { name: "description", kind: "text", maxLength: 600 },
      ],
    },
    {
      id: "legend-key",
      label: "Legend key",
      attributes: [
        { name: "name", kind: "text", required: true, maxLength: 120 },
        keyCategory("category", true),
        { name: "description", kind: "text", maxLength: 200 },
      ],
    },
  ],
  portTypes: [
    {
      id: "port",
      label: "Port",
      directions: ["in", "out", "inout"],
      attributes: [{ name: "label", kind: "text", maxLength: 80 }],
    },
  ],
  relationTypes: [
    {
      id: "link",
      label: "Link",
      direction: "directed",
      roles: [
        { role: "source", cardinality: { min: 1, max: 1 }, targets: ["entity", "port"] },
        { role: "target", cardinality: { min: 1, max: 1 }, targets: ["entity", "port"] },
      ],
      attributes: [
        { name: "label", kind: "text", maxLength: 200 },
        { name: "weight", kind: "quantity", units: ["unit"] },
      ],
    },
    {
      id: "contains",
      label: "Contains",
      direction: "directed",
      roles: [
        { role: "parent", cardinality: { min: 1, max: 1 }, targets: ["entity"], entityTypes: ["container", "legend"] },
        { role: "child", cardinality: { min: 1, max: 1 }, targets: ["entity"] },
      ],
      hierarchy: {
        id: GENERIC2_CONTAINMENT_HIERARCHY,
        shape: "tree",
        parentRole: "parent",
        childRole: "child",
      },
    },
    {
      id: "association",
      label: "Association",
      direction: "undirected",
      roles: [{ role: "member", cardinality: { min: 2, max: 8 }, targets: ["entity"] }],
      attributes: [{ name: "label", kind: "text", maxLength: 120 }],
    },
  ],
  constraints: [
    {
      kind: "hierarchy",
      relationType: "contains",
      hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY,
      parentRole: "parent",
      childRole: "child",
    },
    { kind: "parent-family", hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY, familyRoots: ["container", "legend"] },
    {
      kind: "children-restricted",
      parentFamilyRoots: ["legend"],
      childTypes: ["legend-key"],
      hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY,
    },
    {
      kind: "required-parent",
      childTypes: ["legend-key"],
      parentFamilyRoots: ["legend"],
      hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY,
    },
    { kind: "acyclic-hierarchy", hierarchyId: GENERIC2_CONTAINMENT_HIERARCHY },
    {
      kind: "unique-attribute",
      entityType: "legend-key",
      attribute: "category",
      scope: { withinType: "legend" },
    },
  ],
  limits: {
    maxEntities: 100_000,
    maxRelations: 500_000,
    maxEndpointsPerRelation: 8,
  },
  notes: [
    "Complete profile: the replacement base for generic@1, not its child.",
    "Business cycles are legal through `link` and `association`; only the declared `containment` tree refuses them.",
    "Category is domain data; tokens, icons, order and footprints live in the view/presentation contract.",
  ],
};
