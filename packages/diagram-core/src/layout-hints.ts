/**
 * `ds-layout-hints@1` — the closed layout-hint vocabulary of the Design System.
 *
 * A view declaration (engram `MetamodelViewDecl.layout`) names a layout by this
 * vocabulary and never by a table of its own. The vocabulary is authored,
 * versioned and pinned here, and nowhere else.
 *
 * Scope rule of `@1`: it admits only what the layout engine of
 * `@sentropic/diagram-canvas` executes at this version.
 *   - `auto-pack`    = `layoutMeasured` (measured, row-packed views);
 *   - `layered-flow` = `layoutDocument` (ranked flow), on `generic@1` views
 *                      without a typed presentation only.
 * A mode or a hint that is specified but not executed yet (`lane-stack`,
 * `matrix-grid`, `tree`, `direction`, `rotate_labels`) is REFUSED with its own
 * code, never coerced to another mode: a template that validates against `@1`
 * must render. Spacing overrides and coordinates are forbidden outright.
 *
 * Three layers, one source:
 *   - `DS_LAYOUT_HINTS_SCHEMA`  JSON Schema 2020-12, closed. Its `$defs` also
 *     carry the refusal classification, so the pinned bytes cover it.
 *   - `DS_LAYOUT_HINTS_RULES`   frozen data read from the schema `$defs`.
 *   - `validateLayoutHints()`   pure; structural and semantic; diagnostics.
 *
 * Any change to the schema is `ds-layout-hints@2`: the pin digest is the
 * SHA-256 of the RFC 8785 bytes of the schema.
 */

import { type Diagnostic, type DiagnosticCode, diagnostic } from "./diagnostics.js";
import type { PresentationPin } from "./presentation.js";
import type { EntityRef } from "./refs.js";
import { canonicalBytes, sha256Hex } from "./sha256.js";

export const DS_LAYOUT_VOCABULARY = "ds-layout-hints@1" as const;
export const DS_LAYOUT_HINTS_SCHEMA_ID = "https://sentropic.dev/schemas/diagram/layout-hints/v1" as const;

/** Modes the layout engine executes at this version. */
export const DS_LAYOUT_MODES = ["auto-pack", "layered-flow"] as const;
/** Modes specified for a later vocabulary: refused in `@1`. */
export const DS_LAYOUT_FUTURE_MODES = ["lane-stack", "matrix-grid", "tree"] as const;
/** Hints specified for a later vocabulary: refused in `@1`. */
export const DS_LAYOUT_FUTURE_HINTS = ["direction", "rotate_labels"] as const;
/** Spacing overrides and coordinates: refused in every version (one gap law, no authored geometry). */
export const DS_LAYOUT_FORBIDDEN_HINTS = [
  "cardGapX",
  "cardGapY",
  "density",
  "edge_label_orientation",
  "gapAfter",
  "height",
  "rankGap",
  "width",
  "x",
  "y",
  "zoneGapX",
  "zoneGapY",
] as const;
/** Hints read by the measured path only: refused under `layered-flow`. */
export const DS_LAYOUT_MEASURED_HINTS = ["grouping", "grouping_axis", "ordering", "rootOrder", "stretch"] as const;
export const DS_LAYOUT_AXES = ["rows", "columns"] as const;

export type DsLayoutMode = (typeof DS_LAYOUT_MODES)[number];
export type DsLayoutFutureMode = (typeof DS_LAYOUT_FUTURE_MODES)[number];
export type DsLayoutAxis = (typeof DS_LAYOUT_AXES)[number];

/** A recursive authored group: references and subgroups interleave in `items`. */
export interface DsLayoutGroup {
  readonly id: string;
  readonly direction: DsLayoutAxis;
  readonly items: readonly (EntityRef | DsLayoutGroup)[];
  readonly stretch?: boolean;
}

/** A valid `ds-layout-hints@1` payload. */
export interface DsLayoutHints {
  readonly vocabulary: typeof DS_LAYOUT_VOCABULARY;
  readonly mode: DsLayoutMode;
  /** Sibling order per semantic parent. */
  readonly ordering?: Readonly<Record<EntityRef, readonly EntityRef[]>>;
  /** Declaration order of the root level. */
  readonly rootOrder?: readonly EntityRef[];
  /** Authored groups. Exclusive with `grouping_axis`. */
  readonly grouping?: readonly DsLayoutGroup[];
  /** Shorthand: one group over the root level, packed along this axis. Exclusive with `grouping`. */
  readonly grouping_axis?: DsLayoutAxis;
  readonly stretch?: boolean;
}

/**
 * What the validator must know about the view to judge a mode. Absent facts
 * never widen a scope: `layered-flow` without a context is refused.
 */
export interface LayoutHintsContext {
  /** Profile references of the view's document (`generic@1`, `archimate@2`, …). */
  readonly profiles?: readonly string[];
  /** True when the view carries a typed presentation (`presentation.diagram`). */
  readonly diagramPresentation?: boolean;
  /** The presentation vocabulary of the declaring profile, when it has one (`diagram-notation@1`). */
  readonly presentationVocabulary?: string;
}

const ENTITY_REF_PATTERN = "^entity:[A-Za-z0-9][A-Za-z0-9._-]*$";
const ENTITY_REF = new RegExp(ENTITY_REF_PATTERN);
const GROUP_ID_MAX = 80;
const LAYERED_FLOW_PROFILE = "generic@1";

const PRIVATE_SCHEMA: Record<string, unknown> = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: DS_LAYOUT_HINTS_SCHEMA_ID,
  title: "ds-layout-hints@1",
  type: "object",
  properties: {
    vocabulary: { const: DS_LAYOUT_VOCABULARY },
    mode: { $ref: "#/$defs/mode" },
    ordering: {
      type: "object",
      propertyNames: { $ref: "#/$defs/entityRef" },
      additionalProperties: { $ref: "#/$defs/entityRefList" },
    },
    rootOrder: { $ref: "#/$defs/entityRefList" },
    grouping: { type: "array", items: { $ref: "#/$defs/group" } },
    grouping_axis: { $ref: "#/$defs/axis" },
    stretch: { type: "boolean" },
  },
  required: ["vocabulary", "mode"],
  additionalProperties: false,
  dependentSchemas: { grouping: { properties: { grouping_axis: false } } },
  if: { properties: { mode: { const: "layered-flow" } }, required: ["mode"] },
  then: {
    properties: { grouping: false, grouping_axis: false, ordering: false, rootOrder: false, stretch: false },
  },
  $defs: {
    mode: { enum: [...DS_LAYOUT_MODES] },
    futureMode: { enum: [...DS_LAYOUT_FUTURE_MODES] },
    futureHint: { enum: [...DS_LAYOUT_FUTURE_HINTS] },
    forbiddenHint: { enum: [...DS_LAYOUT_FORBIDDEN_HINTS] },
    measuredHint: { enum: [...DS_LAYOUT_MEASURED_HINTS] },
    layeredFlowScope: {
      type: "object",
      properties: {
        profiles: { type: "array", minItems: 1, items: { const: LAYERED_FLOW_PROFILE } },
        diagramPresentation: { const: false },
        presentationVocabulary: false,
      },
      required: ["profiles", "diagramPresentation"],
    },
    axis: { enum: [...DS_LAYOUT_AXES] },
    entityRef: { type: "string", pattern: ENTITY_REF_PATTERN },
    entityRefList: { type: "array", items: { $ref: "#/$defs/entityRef" }, uniqueItems: true },
    group: {
      type: "object",
      properties: {
        id: { type: "string", minLength: 1, maxLength: GROUP_ID_MAX },
        direction: { $ref: "#/$defs/axis" },
        items: {
          type: "array",
          minItems: 1,
          items: { anyOf: [{ $ref: "#/$defs/entityRef" }, { $ref: "#/$defs/group" }] },
        },
        stretch: { type: "boolean" },
      },
      required: ["id", "direction", "items"],
      additionalProperties: false,
    },
  },
};

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

/** The canonical JSON Schema of `ds-layout-hints@1`, deeply frozen. Also shipped as `schemas/ds-layout-hints-1.json`. */
export const DS_LAYOUT_HINTS_SCHEMA: Readonly<Record<string, unknown>> = deepFreeze(deepClone(PRIVATE_SCHEMA));

/** SHA-256 (64 lowercase hex) of the RFC 8785 bytes of the schema. */
export const DS_LAYOUT_HINTS_SCHEMA_DIGEST: string = sha256Hex(canonicalBytes(PRIVATE_SCHEMA));

/** The pin a view declaration references. Equality is equality of the three fields. */
export const DS_LAYOUT_VOCABULARY_PIN: PresentationPin = deepFreeze({
  id: DS_LAYOUT_HINTS_SCHEMA_ID,
  version: DS_LAYOUT_VOCABULARY,
  contentDigest: DS_LAYOUT_HINTS_SCHEMA_DIGEST,
});

export type LayoutHintsDiagnosticCode = Extract<DiagnosticCode, `layout-${string}`>;

export interface DsLayoutHintsRules {
  readonly vocabulary: typeof DS_LAYOUT_VOCABULARY;
  /** Admitted modes, and the code raised for everything else. */
  readonly modes: {
    readonly implemented: readonly DsLayoutMode[];
    /** Refused with `layout-mode-not-implemented`. */
    readonly future: readonly DsLayoutFutureMode[];
    /** The vocabulary a future mode waits for. */
    readonly futureVocabulary: "ds-layout-hints@2";
  };
  /** `layered-flow` is admitted only on a view matching every fact below. */
  readonly layeredFlowScope: {
    readonly profiles: readonly [typeof LAYERED_FLOW_PROFILE];
    readonly diagramPresentation: false;
    readonly presentationVocabulary: "absent";
  };
  readonly hints: {
    /** Read by the measured path; refused under `layered-flow` with `layout-hint-out-of-scope`. */
    readonly measuredOnly: readonly string[];
    /** Refused with `layout-hint-not-implemented`. */
    readonly future: readonly string[];
    /** Refused with `layout-hint-forbidden`. */
    readonly forbidden: readonly string[];
    /** Pairs that cannot be authored together (`layout-hint-conflict`). */
    readonly exclusive: readonly (readonly [string, string])[];
  };
  /** Identity rules checked on a structurally valid payload (`layout-hint-conflict`). */
  readonly identity: readonly ["group-id-unique", "group-leaf-once", "ordering-member-single-parent", "ordering-parent-not-member"];
}

/** The semantic rules of `ds-layout-hints@1`, as data. Every list equals the matching schema `$defs` enum. */
export const DS_LAYOUT_HINTS_RULES: DsLayoutHintsRules = deepFreeze({
  vocabulary: DS_LAYOUT_VOCABULARY,
  modes: {
    implemented: [...DS_LAYOUT_MODES],
    future: [...DS_LAYOUT_FUTURE_MODES],
    futureVocabulary: "ds-layout-hints@2",
  },
  layeredFlowScope: {
    profiles: [LAYERED_FLOW_PROFILE],
    diagramPresentation: false,
    presentationVocabulary: "absent",
  },
  hints: {
    measuredOnly: [...DS_LAYOUT_MEASURED_HINTS],
    future: [...DS_LAYOUT_FUTURE_HINTS],
    forbidden: [...DS_LAYOUT_FORBIDDEN_HINTS],
    exclusive: [["grouping", "grouping_axis"]],
  },
  identity: ["group-id-unique", "group-leaf-once", "ordering-member-single-parent", "ordering-parent-not-member"],
});

const ROOT_KEYS: readonly string[] = ["vocabulary", "mode", "ordering", "rootOrder", "grouping", "grouping_axis", "stretch"];
const GROUP_KEYS: readonly string[] = ["id", "direction", "items", "stretch"];

function isRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function includes(list: readonly string[], value: unknown): boolean {
  return typeof value === "string" && list.includes(value);
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

type Push = (
  code: LayoutHintsDiagnosticCode,
  path: string,
  message: string,
  extra?: { refs?: readonly string[]; details?: Readonly<Record<string, string | number | boolean>> },
) => void;

/** One property name outside the admitted set, classified. */
function refuseKey(key: string, path: string, push: Push): void {
  if (includes(DS_LAYOUT_FORBIDDEN_HINTS, key)) {
    push("layout-hint-forbidden", path, `${key} is a spacing or coordinate override: ${DS_LAYOUT_VOCABULARY} admits none`, {
      details: { hint: key },
    });
  } else if (includes(DS_LAYOUT_FUTURE_HINTS, key)) {
    push("layout-hint-not-implemented", path, `${key} is not executed by the layout engine at ${DS_LAYOUT_VOCABULARY}`, {
      details: { hint: key, vocabulary: DS_LAYOUT_HINTS_RULES.modes.futureVocabulary },
    });
  } else {
    push("layout-hint-unknown", path, `${key} is not a property of ${DS_LAYOUT_VOCABULARY}`, { details: { hint: key } });
  }
}

function checkEntityRef(value: unknown, path: string, push: Push): value is EntityRef {
  if (typeof value === "string" && ENTITY_REF.test(value)) return true;
  push("layout-hints-invalid", path, `expected an entity reference, got ${typeof value === "string" ? JSON.stringify(value) : describe(value)}`);
  return false;
}

function checkEntityRefList(value: unknown, path: string, push: Push): readonly EntityRef[] {
  if (!Array.isArray(value)) {
    push("layout-hints-invalid", path, `expected an array of entity references, got ${describe(value)}`);
    return [];
  }
  const out: EntityRef[] = [];
  const seen = new Set<string>();
  (value as readonly unknown[]).forEach((member, index) => {
    if (!checkEntityRef(member, `${path}.${index}`, push)) return;
    if (seen.has(member)) {
      push("layout-hint-conflict", `${path}.${index}`, `${member} is listed twice`, { refs: [member] });
      return;
    }
    seen.add(member);
    out.push(member);
  });
  return out;
}

function checkAxis(value: unknown, path: string, push: Push): boolean {
  if (includes(DS_LAYOUT_AXES, value)) return true;
  push("layout-hints-invalid", path, `expected "rows" or "columns", got ${typeof value === "string" ? JSON.stringify(value) : describe(value)}`);
  return false;
}

interface GroupLedger {
  readonly ids: Map<string, string>;
  readonly leaves: Map<string, string>;
}

function checkGroup(value: unknown, path: string, ledger: GroupLedger, ancestors: ReadonlySet<object>, push: Push): void {
  if (!isRecord(value)) {
    push("layout-hints-invalid", path, `expected a group object, got ${describe(value)}`);
    return;
  }
  if (ancestors.has(value)) {
    push("layout-hints-invalid", path, "a group cannot contain itself");
    return;
  }
  for (const key of Object.keys(value)) {
    if (!GROUP_KEYS.includes(key)) refuseKey(key, `${path}.${key}`, push);
  }
  const id = value["id"];
  if (typeof id !== "string" || id.length < 1 || id.length > GROUP_ID_MAX) {
    push("layout-hints-invalid", `${path}.id`, `a group id is a string of 1 to ${GROUP_ID_MAX} characters`);
  } else {
    const first = ledger.ids.get(id);
    if (first !== undefined) {
      push("layout-hint-conflict", `${path}.id`, `group id ${JSON.stringify(id)} is already used at ${first}`, { details: { group: id } });
    } else {
      ledger.ids.set(id, path);
    }
  }
  checkAxis(value["direction"], `${path}.direction`, push);
  if ("stretch" in value && typeof value["stretch"] !== "boolean") {
    push("layout-hints-invalid", `${path}.stretch`, `expected a boolean, got ${describe(value["stretch"])}`);
  }
  const items = value["items"];
  if (!Array.isArray(items) || items.length === 0) {
    push("layout-hints-invalid", `${path}.items`, "a group lists at least one item");
    return;
  }
  const nested = new Set(ancestors).add(value);
  (items as readonly unknown[]).forEach((item, index) => {
    const itemPath = `${path}.items.${index}`;
    if (typeof item === "string") {
      if (!checkEntityRef(item, itemPath, push)) return;
      const owner = ledger.leaves.get(item);
      if (owner !== undefined) {
        push("layout-hint-conflict", itemPath, `${item} is already placed by ${owner}`, { refs: [item] });
      } else {
        ledger.leaves.set(item, itemPath);
      }
      return;
    }
    checkGroup(item, itemPath, ledger, nested, push);
  });
}

function checkLayeredFlowScope(context: LayoutHintsContext | undefined, push: Push): void {
  const refuse = (message: string, details: Readonly<Record<string, string | number | boolean>>): void => {
    push("layout-mode-out-of-scope", "mode", `layered-flow is admitted on ${LAYERED_FLOW_PROFILE} views without a typed presentation only: ${message}`, {
      details: { mode: "layered-flow", ...details },
    });
  };
  const profiles = context?.profiles;
  if (profiles === undefined || profiles.length === 0) {
    refuse("the view's profiles are not stated", { reason: "profiles-unstated" });
    return;
  }
  const foreign = profiles.filter((profile) => profile !== LAYERED_FLOW_PROFILE);
  if (foreign.length > 0) {
    refuse(`the view uses ${foreign.join(", ")}`, { reason: "profile", profile: foreign[0] as string });
  }
  if (context?.diagramPresentation !== false) {
    refuse(
      context?.diagramPresentation === true ? "the view carries a typed presentation" : "the absence of a typed presentation is not stated",
      { reason: context?.diagramPresentation === true ? "diagram-presentation" : "diagram-presentation-unstated" },
    );
  }
  if (context?.presentationVocabulary !== undefined) {
    refuse(`the profile declares ${context.presentationVocabulary}`, {
      reason: "presentation-vocabulary",
      presentationVocabulary: context.presentationVocabulary,
    });
  }
}

/**
 * Validate a layout-hint payload against `ds-layout-hints@1`: structure and
 * semantics, in one pass. Pure; never throws; an empty result means valid.
 * Diagnostics are sorted by (path, code).
 *
 * What it cannot see: whether a reference exists in the document and whether
 * the members of a group are siblings. Those need the document and stay with
 * the layout engine (`validateHints` in `@sentropic/diagram-canvas`).
 */
export function validateLayoutHints(value: unknown, context?: LayoutHintsContext): readonly Diagnostic[] {
  const found: Diagnostic[] = [];
  const push: Push = (code, path, message, extra) => {
    found.push(diagnostic({ code, path: path === "" ? "layout" : `layout.${path}`, message, ...extra }));
  };
  const done = (): readonly Diagnostic[] =>
    found.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : a.code < b.code ? -1 : a.code > b.code ? 1 : 0));

  if (!isRecord(value)) {
    push("layout-hints-invalid", "", `expected a layout-hint object, got ${describe(value)}`);
    return done();
  }

  const vocabulary = value["vocabulary"];
  if (vocabulary !== DS_LAYOUT_VOCABULARY) {
    // Fail closed: nothing else is read from a payload of another vocabulary.
    push(
      "layout-vocabulary-unknown",
      "vocabulary",
      vocabulary === undefined
        ? `vocabulary is required and must be ${JSON.stringify(DS_LAYOUT_VOCABULARY)}`
        : `vocabulary ${typeof vocabulary === "string" ? JSON.stringify(vocabulary) : describe(vocabulary)} is not ${JSON.stringify(DS_LAYOUT_VOCABULARY)}`,
      typeof vocabulary === "string" ? { details: { vocabulary } } : undefined,
    );
    return done();
  }

  for (const key of Object.keys(value)) {
    if (!ROOT_KEYS.includes(key)) refuseKey(key, key, push);
  }

  const mode = value["mode"];
  let admitted: DsLayoutMode | undefined;
  if (mode === undefined) {
    push("layout-hints-invalid", "mode", "mode is required: an absent mode is never read as auto-pack");
  } else if (includes(DS_LAYOUT_MODES, mode)) {
    admitted = mode as DsLayoutMode;
  } else if (includes(DS_LAYOUT_FUTURE_MODES, mode)) {
    push("layout-mode-not-implemented", "mode", `${String(mode)} is not executed by the layout engine at ${DS_LAYOUT_VOCABULARY}`, {
      details: { mode: mode as string, vocabulary: DS_LAYOUT_HINTS_RULES.modes.futureVocabulary },
    });
  } else {
    push("layout-mode-unknown", "mode", `mode ${typeof mode === "string" ? JSON.stringify(mode) : describe(mode)} is not a mode of ${DS_LAYOUT_VOCABULARY}`,
      typeof mode === "string" ? { details: { mode } } : undefined);
  }

  if (admitted === "layered-flow") {
    checkLayeredFlowScope(context, push);
    for (const key of DS_LAYOUT_MEASURED_HINTS) {
      if (key in value) {
        push("layout-hint-out-of-scope", key, `${key} is read by auto-pack only; layered-flow takes no authored hint`, {
          details: { hint: key, mode: "layered-flow" },
        });
      }
    }
  }

  if ("stretch" in value && typeof value["stretch"] !== "boolean") {
    push("layout-hints-invalid", "stretch", `expected a boolean, got ${describe(value["stretch"])}`);
  }
  if ("rootOrder" in value) checkEntityRefList(value["rootOrder"], "rootOrder", push);

  if ("ordering" in value) {
    const ordering = value["ordering"];
    if (!isRecord(ordering)) {
      push("layout-hints-invalid", "ordering", `expected an object keyed by parent entity, got ${describe(ordering)}`);
    } else {
      const parentOf = new Map<string, string>();
      for (const parent of Object.keys(ordering)) {
        const path = `ordering.${parent}`;
        const parentValid = checkEntityRef(parent, path, push);
        for (const member of checkEntityRefList(ordering[parent], path, push)) {
          if (parentValid && member === parent) {
            push("layout-hint-conflict", path, `${member} cannot be ordered under itself`, { refs: [member] });
            continue;
          }
          const first = parentOf.get(member);
          if (first !== undefined && first !== parent) {
            push("layout-hint-conflict", path, `${member} is already ordered under ${first}`, { refs: [member, first, parent] });
            continue;
          }
          parentOf.set(member, parent);
        }
      }
    }
  }

  if ("grouping" in value && "grouping_axis" in value) {
    push("layout-hint-conflict", "grouping_axis", "grouping and grouping_axis cannot be authored together", {
      details: { hint: "grouping_axis", other: "grouping" },
    });
  }
  if ("grouping_axis" in value) checkAxis(value["grouping_axis"], "grouping_axis", push);
  if ("grouping" in value) {
    const grouping = value["grouping"];
    if (!Array.isArray(grouping)) {
      push("layout-hints-invalid", "grouping", `expected an array of groups, got ${describe(grouping)}`);
    } else {
      const ledger: GroupLedger = { ids: new Map(), leaves: new Map() };
      (grouping as readonly unknown[]).forEach((group, index) => checkGroup(group, `grouping.${index}`, ledger, new Set(), push));
    }
  }

  return done();
}

/** Type guard: true iff `validateLayoutHints` raises nothing. */
export function isLayoutHints(value: unknown, context?: LayoutHintsContext): value is DsLayoutHints {
  return validateLayoutHints(value, context).length === 0;
}

/** The engine-side group shape (`LayoutGroup` of `@sentropic/diagram-canvas`), stated structurally. */
export interface LoweredLayoutGroup {
  readonly id: string;
  readonly direction: DsLayoutAxis;
  readonly items: readonly (EntityRef | LoweredLayoutGroup)[];
  readonly stretch?: boolean;
}

/** The engine-side hints (`LayoutHints` of `@sentropic/diagram-canvas`), stated structurally: no gap, no coordinate. */
export interface LoweredLayoutHints {
  readonly ordering?: Readonly<Record<EntityRef, readonly EntityRef[]>>;
  readonly rootOrder?: readonly EntityRef[];
  readonly grouping?: readonly LoweredLayoutGroup[];
  readonly stretch?: boolean;
}

/** The id of the root group `grouping_axis` lowers to. */
export const DS_LAYOUT_ROOT_GROUP_ID = "ds-layout-hints.root" as const;

function lowerGroup(group: DsLayoutGroup): LoweredLayoutGroup {
  return {
    id: group.id,
    direction: group.direction,
    items: group.items.map((item) => (typeof item === "string" ? item : lowerGroup(item))),
    ...(group.stretch === undefined ? {} : { stretch: group.stretch }),
  };
}

/**
 * Lower a VALID payload to the hints the layout engine takes. `mode` selects
 * the engine entry and is not part of the result; `layered-flow` lowers to no
 * hint at all.
 *
 * `grouping_axis` is a shorthand for one group over the root level: it needs
 * the visible root entities, which only the caller knows. Listed roots come
 * first in `rootOrder`, the others after in UTF-16 order (the engine's own
 * rule). Without roots the shorthand lowers to nothing.
 */
export function lowerLayoutHints(hints: DsLayoutHints, roots: readonly EntityRef[] = []): LoweredLayoutHints {
  if (hints.mode !== "auto-pack") return {};
  let grouping: readonly LoweredLayoutGroup[] | undefined = hints.grouping?.map(lowerGroup);
  if (hints.grouping_axis !== undefined && roots.length > 0) {
    const members = new Set(roots);
    const listed = (hints.rootOrder ?? []).filter((member) => members.has(member));
    const rest = [...members].filter((member) => !listed.includes(member)).sort();
    grouping = [{ id: DS_LAYOUT_ROOT_GROUP_ID, direction: hints.grouping_axis, items: [...listed, ...rest] }];
  }
  return {
    ...(hints.ordering === undefined ? {} : { ordering: hints.ordering }),
    ...(hints.rootOrder === undefined ? {} : { rootOrder: hints.rootOrder }),
    ...(grouping === undefined ? {} : { grouping }),
    ...(hints.stretch === undefined ? {} : { stretch: hints.stretch }),
  };
}
