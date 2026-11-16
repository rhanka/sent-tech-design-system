/**
 * `diagram-notation@1` — the closed notation vocabulary and its pin.
 *
 * A profile maps its types onto this vocabulary (which role draws an entity
 * type, which encoding draws a relation type). The vocabulary is DS-owned;
 * the mapping is profile data and holds no place here.
 *
 * Two layers, both data, both pinned:
 *   - `DIAGRAM_NOTATION_SCHEMA`  JSON Schema 2020-12, structural only: closed
 *     objects, enums, string bounds, required `role`, `nature`, `encoding`,
 *     slot shape.
 *   - `DIAGRAM_NOTATION_RULES`   every conditional the schema does not state:
 *     the role table, the variants of each nature, the property list of each
 *     encoding, slot ownership.
 *
 * `DIAGRAM_NOTATION_PIN.contentDigest` is the SHA-256 of the RFC 8785 bytes of
 * `{ schema, rules }`. Any change to either is `diagram-notation@2`.
 *
 * NOT here: `validateNotation`, `validateViewNotation` and `resolveNotation`.
 * This module freezes the vocabulary a consumer pins; the executor that reads
 * it is a later lot, and until it ships nothing in this package enforces the
 * rules below.
 */

import type { PresentationPin } from "./presentation.js";
import { canonicalBytes, sha256Hex } from "./sha256.js";

export const DIAGRAM_NOTATION_VOCABULARY = "diagram-notation@1" as const;

export const DIAGRAM_NOTATION_MODES = ["strict", "metadata"] as const;
export const DIAGRAM_NOTATION_ROLES = ["card", "container", "lane", "entity-table", "flow-node"] as const;
export const DIAGRAM_NOTATION_NATURES = ["component", "responsibility", "data", "activity"] as const;
export const DIAGRAM_NOTATION_VARIANTS = ["task", "start", "end", "decision", "subprocess", "data", "document", "participant"] as const;
export const DIAGRAM_NOTATION_ENCODINGS = ["arrow", "containment", "detail", "footer"] as const;
export const DIAGRAM_NOTATION_ENDS = ["none", "arrow", "cardinality"] as const;

export type NotationMode = (typeof DIAGRAM_NOTATION_MODES)[number];
export type NotationRole = (typeof DIAGRAM_NOTATION_ROLES)[number];
export type NotationNature = (typeof DIAGRAM_NOTATION_NATURES)[number];
export type NotationVariant = (typeof DIAGRAM_NOTATION_VARIANTS)[number];
export type NotationEncoding = (typeof DIAGRAM_NOTATION_ENCODINGS)[number];
export type NotationEnds = (typeof DIAGRAM_NOTATION_ENDS)[number];

/** A slot is a literal text, or a lookup on an attribute of the instance. */
export type NotationSlot =
  | string
  | { readonly attribute: string; readonly values: Readonly<Record<string, string>>; readonly default: string };

export interface NotationTypeRef {
  readonly profile: string;
  readonly type: string;
}

export interface NotationNode {
  readonly role: NotationRole;
  readonly nature: NotationNature;
  readonly variant?: NotationSlot;
  readonly icon?: NotationSlot;
  readonly kicker?: NotationSlot;
  /** Roles of DIRECT containment children. */
  readonly holds?: readonly NotationRole[];
}

export interface NotationRelation {
  readonly encoding: NotationEncoding;
  readonly ends?: NotationEnds;
  readonly provisional?: { readonly attribute: string; readonly equals: string };
  readonly lift?: { readonly via: NotationTypeRef; readonly ancestors: readonly NotationTypeRef[] };
  readonly fallback?: { readonly encoding: "detail" | "footer"; readonly on: string; readonly label: string };
  readonly on?: string;
  readonly label?: string;
}

export interface NotationBlock {
  readonly vocabulary: typeof DIAGRAM_NOTATION_VOCABULARY;
  readonly mode?: NotationMode;
  readonly entityTypes: Readonly<Record<string, NotationNode>>;
  readonly relationTypes: Readonly<Record<string, NotationRelation>>;
}

const TEXT = { type: "string", minLength: 1, maxLength: 40 };
const NAME = { type: "string", minLength: 1, maxLength: 80 };

const PRIVATE_SCHEMA: Record<string, unknown> = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "engram:diagram-notation-schema/1",
  title: "diagram-notation@1 block",
  type: "object",
  properties: {
    vocabulary: { const: DIAGRAM_NOTATION_VOCABULARY },
    mode: { enum: [...DIAGRAM_NOTATION_MODES] },
    entityTypes: { type: "object", additionalProperties: { $ref: "#/$defs/node" } },
    relationTypes: { type: "object", additionalProperties: { $ref: "#/$defs/relation" } },
  },
  required: ["vocabulary", "entityTypes", "relationTypes"],
  additionalProperties: false,
  $defs: {
    text: TEXT,
    name: NAME,
    role: { enum: [...DIAGRAM_NOTATION_ROLES] },
    nature: { enum: [...DIAGRAM_NOTATION_NATURES] },
    slot: {
      anyOf: [
        { $ref: "#/$defs/text" },
        {
          type: "object",
          properties: {
            attribute: { $ref: "#/$defs/name" },
            values: { type: "object", maxProperties: 32, additionalProperties: { $ref: "#/$defs/text" } },
            default: { $ref: "#/$defs/text" },
          },
          required: ["attribute", "values", "default"],
          additionalProperties: false,
        },
      ],
    },
    typeRef: {
      type: "object",
      properties: { profile: { $ref: "#/$defs/name" }, type: { $ref: "#/$defs/name" } },
      required: ["profile", "type"],
      additionalProperties: false,
    },
    node: {
      type: "object",
      properties: {
        role: { $ref: "#/$defs/role" },
        nature: { $ref: "#/$defs/nature" },
        variant: { $ref: "#/$defs/slot" },
        icon: { $ref: "#/$defs/slot" },
        kicker: { $ref: "#/$defs/slot" },
        holds: { type: "array", items: { $ref: "#/$defs/role" }, uniqueItems: true },
      },
      required: ["role", "nature"],
      additionalProperties: false,
    },
    relation: {
      type: "object",
      properties: {
        encoding: { enum: [...DIAGRAM_NOTATION_ENCODINGS] },
        ends: { enum: [...DIAGRAM_NOTATION_ENDS] },
        provisional: {
          type: "object",
          properties: { attribute: { $ref: "#/$defs/name" }, equals: { $ref: "#/$defs/text" } },
          required: ["attribute", "equals"],
          additionalProperties: false,
        },
        lift: {
          type: "object",
          properties: {
            via: { $ref: "#/$defs/typeRef" },
            ancestors: { type: "array", minItems: 1, items: { $ref: "#/$defs/typeRef" } },
          },
          required: ["via", "ancestors"],
          additionalProperties: false,
        },
        fallback: {
          type: "object",
          properties: {
            encoding: { enum: ["detail", "footer"] },
            on: { $ref: "#/$defs/name" },
            label: { $ref: "#/$defs/text" },
          },
          required: ["encoding", "on", "label"],
          additionalProperties: false,
        },
        on: { $ref: "#/$defs/name" },
        label: { $ref: "#/$defs/text" },
      },
      required: ["encoding"],
      additionalProperties: false,
    },
  },
};

/** How a role treats one slot. `participant-only`: admitted when the effective variant is `participant`. */
export type NotationSlotRule = "required" | "optional" | "refused" | "participant-only";

export interface NotationRoleRule {
  readonly natures: readonly NotationNature[];
  readonly icon: NotationSlotRule;
  readonly kicker: NotationSlotRule;
  /** `by-nature`: the variant is one of `variants[nature]`. */
  readonly variant: "refused" | "by-nature";
  /** Roles a type of this role may list in `holds`. */
  readonly holds: readonly NotationRole[];
  /** When set, `holds` counts only for this effective variant. */
  readonly holdsEffectiveFor?: NotationVariant;
}

const PRIVATE_RULES = {
  vocabulary: DIAGRAM_NOTATION_VOCABULARY,
  defaultMode: "strict",
  roles: {
    card: {
      natures: ["component"],
      icon: "required",
      kicker: "optional",
      variant: "refused",
      holds: ["card", "entity-table", "flow-node"],
    },
    container: {
      natures: ["component"],
      icon: "required",
      kicker: "optional",
      variant: "refused",
      holds: ["card", "container", "entity-table", "lane", "flow-node"],
    },
    lane: {
      natures: ["responsibility"],
      icon: "refused",
      kicker: "refused",
      variant: "refused",
      holds: ["flow-node", "lane"],
    },
    "entity-table": {
      natures: ["data"],
      icon: "optional",
      kicker: "refused",
      variant: "refused",
      holds: [],
    },
    "flow-node": {
      natures: ["activity", "data", "responsibility"],
      icon: "participant-only",
      kicker: "refused",
      variant: "by-nature",
      holds: ["flow-node"],
      holdsEffectiveFor: "subprocess",
    },
  },
  /** Variants of each nature; the first is the default. `component` has none. */
  variants: {
    activity: ["task", "start", "end", "decision", "subprocess"],
    data: ["data", "document"],
    responsibility: ["participant"],
    component: [],
  },
  /** Glyph id grammar of an `icon` text. The glyph inventory is not part of the pin. */
  iconPattern: "^[a-z][a-z0-9-]{0,39}$",
  /** The properties each encoding admits, `encoding` included; `required` among them. */
  encodings: {
    arrow: { properties: ["encoding", "ends", "provisional"], required: ["encoding"] },
    containment: { properties: ["encoding", "lift", "fallback"], required: ["encoding"] },
    detail: { properties: ["encoding", "on", "label"], required: ["encoding", "on", "label"] },
    footer: { properties: ["encoding", "on", "label"], required: ["encoding", "on", "label"] },
  },
  /** `ends` when absent: `arrow` on a directed relation type, else `none`. */
  endsDefault: { directed: "arrow", undirected: "none" },
  /** Roles that own each text slot: every type allowed on the `on` endpoint must have one of them. */
  slotOwners: {
    detail: ["card", "container", "entity-table"],
    footer: ["card", "container"],
  },
  /** Roles a `lift.ancestors` type must have. */
  liftAncestorRoles: ["card", "container"],
  /** `containment` needs a relation type whose hierarchy has this shape. */
  containmentHierarchyShape: "tree",
} as const;

function deepClone<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return (value as readonly unknown[]).map((item) => deepClone(item)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    out[key] = deepClone((value as Record<string, unknown>)[key]);
  }
  return out as unknown as T;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  return Object.freeze(value);
}

deepFreeze(PRIVATE_SCHEMA);
deepFreeze(PRIVATE_RULES);

export interface DiagramNotationRules {
  readonly vocabulary: typeof DIAGRAM_NOTATION_VOCABULARY;
  readonly defaultMode: NotationMode;
  readonly roles: Readonly<Record<NotationRole, NotationRoleRule>>;
  readonly variants: Readonly<Record<NotationNature, readonly NotationVariant[]>>;
  readonly iconPattern: string;
  readonly encodings: Readonly<Record<NotationEncoding, { readonly properties: readonly string[]; readonly required: readonly string[] }>>;
  readonly endsDefault: { readonly directed: NotationEnds; readonly undirected: NotationEnds };
  readonly slotOwners: Readonly<Record<"detail" | "footer", readonly NotationRole[]>>;
  readonly liftAncestorRoles: readonly NotationRole[];
  readonly containmentHierarchyShape: "tree";
}

/** The structural JSON Schema of a `diagram-notation@1` block, deeply frozen. */
export const DIAGRAM_NOTATION_SCHEMA: Readonly<Record<string, unknown>> = deepFreeze(deepClone(PRIVATE_SCHEMA));

/** The semantic rules of `diagram-notation@1`, as data, deeply frozen. */
export const DIAGRAM_NOTATION_RULES: DiagramNotationRules = deepFreeze(deepClone(PRIVATE_RULES)) as DiagramNotationRules;

/** SHA-256 (64 lowercase hex) of the RFC 8785 bytes of `{ schema, rules }`. */
export const DIAGRAM_NOTATION_DIGEST: string = sha256Hex(canonicalBytes({ schema: PRIVATE_SCHEMA, rules: PRIVATE_RULES }));

/** The pin of the notation vocabulary. Equality is equality of the three fields. */
export const DIAGRAM_NOTATION_PIN: PresentationPin = deepFreeze({
  id: "diagram-notation",
  version: "1",
  contentDigest: DIAGRAM_NOTATION_DIGEST,
});
