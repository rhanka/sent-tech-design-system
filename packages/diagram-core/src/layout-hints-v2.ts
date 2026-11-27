import { type Diagnostic, diagnostic } from "./diagnostics.js";
import {
  DS_LAYOUT_FORBIDDEN_HINTS,
  DS_LAYOUT_HINTS_SCHEMA,
  DS_LAYOUT_MEASURED_HINTS,
  DS_LAYOUT_VOCABULARY,
  type DsLayoutHints,
  type LayoutHintsContext,
  type LayoutHintsDiagnosticCode,
  type LoweredLayoutHints,
  lowerLayoutHints,
  validateLayoutHints,
} from "./layout-hints.js";
import type { EntityRef } from "./refs.js";
import { canonicalBytes, sha256Hex } from "./sha256.js";

export const DS_LAYOUT_V2_VOCABULARY = "ds-layout-hints@2";
export const DS_LAYOUT_HINTS_V2_SCHEMA_ID = "https://sentropic.dev/schemas/diagram/layout-hints/v2";

const modes = ["auto-pack", "layered-flow", "stage-columns"] as const;
const alignments = ["start", "center", "end", "stretch"] as const;
const sides = ["start", "end"] as const;
const axes = ["row", "column"] as const;
const aspects = ["16:9", "free"] as const;
const fanModes = ["comb", "separate"] as const;
const legends = ["right", "bottom", "free-cell", "none"] as const;
const compositionKeys = ["grids", "stacks", "aspect", "fanIn", "fanOut", "legend"] as const;
const autoPackKeys = ["grouping", "grouping_axis", "stretch"] as const;
const futureHints = ["compared_panels", "loop_corridor", "foldable", "direction", "rotate_labels"] as const;
const futureModes = ["tree"] as const;
const supersededModes = ["lane-stack", "matrix-grid"] as const;
const futureVocabulary = "ds-layout-hints@3";
const forbiddenHints = [
  ...DS_LAYOUT_FORBIDDEN_HINTS,
  "anchor", "bottom", "dc", "dx", "dy", "gap", "gutter", "labelAt", "label_at", "left", "margin",
  "offset", "padding", "pin", "pins", "points", "position", "right", "scale", "size", "top", "via",
  "waypoints", "zoom",
] as const;
const modeScope = {
  "auto-pack": compositionKeys,
  "layered-flow": [...DS_LAYOUT_MEASURED_HINTS, ...compositionKeys],
  "stage-columns": autoPackKeys,
} as const;

export type LayoutCellAlign = (typeof alignments)[number];

export interface LayoutBand {
  readonly id: string;
  readonly items: readonly EntityRef[];
}

export interface LayoutPeripheralColumn {
  readonly id: string;
  readonly side: (typeof sides)[number];
  readonly items: readonly EntityRef[];
  readonly from_band?: string;
}

export interface LayoutCell {
  readonly column?: string;
  readonly to_column?: string;
  readonly to_band?: string;
  readonly justify?: LayoutCellAlign;
  readonly align?: LayoutCellAlign;
}

export interface LayoutGrid {
  readonly stage_columns?: readonly string[] | "inherit";
  readonly transverse_bands: readonly LayoutBand[];
  readonly peripheral_columns?: readonly LayoutPeripheralColumn[];
  readonly cells?: Readonly<Partial<Record<EntityRef, LayoutCell>>>;
}

export interface LayoutStack {
  readonly axis: (typeof axes)[number];
  readonly align?: LayoutCellAlign;
}

export interface LayoutComposition {
  readonly grids: { readonly root: LayoutGrid } & Readonly<Partial<Record<EntityRef, LayoutGrid>>>;
  readonly stacks: Readonly<Partial<Record<EntityRef, LayoutStack>>>;
  readonly aspect: (typeof aspects)[number];
  readonly fanIn: (typeof fanModes)[number];
  readonly fanOut: (typeof fanModes)[number];
  /** "host" uses the scene option and its default. */
  readonly legend: (typeof legends)[number] | "host";
}

type ComposedLayoutHints = Pick<DsLayoutHints, "rootOrder" | "ordering"> & Partial<LayoutComposition> & {
  readonly mode: "stage-columns";
  readonly grids: LayoutComposition["grids"];
  readonly legend?: (typeof legends)[number];
};
export type DsLayoutHintsV2 = { readonly vocabulary: typeof DS_LAYOUT_V2_VOCABULARY } &
  (Omit<DsLayoutHints, "vocabulary"> | ComposedLayoutHints);

export interface LoweredLayoutHintsV2 extends LoweredLayoutHints {
  readonly composition?: LayoutComposition;
}

const entityPattern = "^entity:[A-Za-z0-9][A-Za-z0-9._-]*$";
const idPattern = "^[a-z][a-z0-9-]{0,39}$";
const entityRef = new RegExp(entityPattern);
const trackId = new RegExp(idPattern);

// Retain the @1 structural contract for all the words shared by both versions.
const shared = DS_LAYOUT_HINTS_SCHEMA as {
  properties: Record<string, unknown>;
  $defs: Record<string, unknown>;
};
const close = (properties: Record<string, unknown>, required: readonly string[] = []) => ({
  type: "object",
  properties,
  ...(required.length === 0 ? {} : { required }),
  additionalProperties: false,
});
const ref = (name: string) => ({ $ref: `#/$defs/${name}` });
const entries = (name: string) => ({ type: "object", patternProperties: { [entityPattern]: ref(name) }, additionalProperties: false });
const list = (name: string, minItems: number, maxItems?: number) => ({
  type: "array", items: ref(name), minItems, ...(maxItems === undefined ? {} : { maxItems }),
});

const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: DS_LAYOUT_HINTS_V2_SCHEMA_ID,
  title: DS_LAYOUT_V2_VOCABULARY,
  ...close({
    ...shared.properties,
    vocabulary: { const: DS_LAYOUT_V2_VOCABULARY },
    grids: ref("grids"),
    stacks: entries("stack"),
    aspect: { enum: aspects },
    fanIn: { enum: fanModes },
    fanOut: { enum: fanModes },
    legend: { enum: legends },
  }, ["vocabulary", "mode"]),
  dependentSchemas: { grouping: { properties: { grouping_axis: false } } },
  allOf: modes.map((mode) => ({
    if: { properties: { mode: { const: mode } }, required: ["mode"] },
    then: {
      properties: {
        ...Object.fromEntries(modeScope[mode].map((word) => [word, false])),
        ...(mode === "stage-columns" ? { grids: ref("grids") } : {}),
      },
      ...(mode === "stage-columns" ? { required: ["grids"] } : {}),
    },
  })),
  $defs: {
    ...shared.$defs,
    mode: { enum: modes },
    forbiddenHint: { enum: forbiddenHints },
    futureHint: { enum: futureHints },
    futureBandValue: { enum: ["inherit"] },
    futureMode: { enum: futureModes },
    supersededMode: { enum: supersededModes },
    modeScope: Object.fromEntries(modes.map((mode) => [mode, { enum: modeScope[mode] }])),
    id: { type: "string", pattern: idPattern },
    align: { enum: alignments },
    grids: { ...entries("grid"), properties: { root: ref("grid") }, required: ["root"] },
    grid: close({
      stage_columns: { anyOf: [list("id", 1, 16), { const: "inherit" }] },
      transverse_bands: list("band", 1, 24),
      peripheral_columns: list("peripheralColumn", 0),
      cells: entries("cell"),
    }, ["transverse_bands"]),
    band: close({ id: ref("id"), items: list("entityRef", 0, 32) }, ["id", "items"]),
    peripheralColumn: close({
      id: ref("id"), side: { enum: sides }, items: list("entityRef", 1, 16), from_band: ref("id"),
    }, ["id", "side", "items"]),
    cell: close({ column: ref("id"), to_column: ref("id"), to_band: ref("id"), justify: ref("align"), align: ref("align") }),
    stack: close({ axis: { enum: axes }, align: ref("align") }, ["axis"]),
  },
};

function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export const DS_LAYOUT_HINTS_V2_SCHEMA = freeze(schema);
export const DS_LAYOUT_HINTS_V2_SCHEMA_DIGEST = sha256Hex(canonicalBytes(schema));
export const DS_LAYOUT_V2_VOCABULARY_PIN = freeze({
  id: DS_LAYOUT_HINTS_V2_SCHEMA_ID,
  version: DS_LAYOUT_V2_VOCABULARY,
  contentDigest: DS_LAYOUT_HINTS_V2_SCHEMA_DIGEST,
});
export const DS_LAYOUT_HINTS_V2_RULES = freeze({
  vocabulary: DS_LAYOUT_V2_VOCABULARY,
  modes: { implemented: modes, future: futureModes, superseded: supersededModes, futureVocabulary },
  hints: { forbidden: forbiddenHints, future: futureHints, futureBandValues: schema.$defs.futureBandValue.enum },
  modeScope,
});

type JsonObject = Record<string, unknown>;
type Report = (code: LayoutHintsDiagnosticCode, path: string, message: string, details?: Record<string, string>) => void;

function isObject(value: unknown): value is JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

function vocabularyOf(value: unknown): unknown {
  if (!isObject(value)) return undefined;
  return Object.getOwnPropertyDescriptor(value, "vocabulary")?.value;
}

/** Read only plain data. Never invoke accessors or mutate a caller's object. */
function snapshot(value: unknown, path: string, report: Report, ancestors = new Set<object>()): unknown {
  if (typeof value === "number") report("layout-hints-invalid", path, "numeric values are forbidden");
  if (value === null || typeof value !== "object") return value;
  if ((!isObject(value) && !Array.isArray(value)) || ancestors.has(value)) {
    throw new TypeError("expected an acyclic JSON object");
  }
  ancestors.add(value);
  const descriptors = Object.getOwnPropertyDescriptors(value as object);
  const read = (key: string) => {
    const descriptor = Object.hasOwn(descriptors, key) ? descriptors[key] : undefined;
    if (descriptor === undefined || !("value" in descriptor)) throw new TypeError("expected a data property");
    return snapshot(descriptor.value, path ? `${path}.${key}` : key, report, ancestors);
  };
  let result: unknown;
  if (Array.isArray(value)) {
    const length = descriptors["length"]?.value as number;
    const keys = Object.keys(descriptors).filter((key) => key !== "length");
    if (keys.length !== length || keys.some((key, index) => key !== String(index))) throw new TypeError("expected a dense JSON array");
    result = keys.map(read);
  } else {
    result = Object.assign(Object.create(null), Object.fromEntries(Object.keys(descriptors).sort().map((key) => [key, read(key)])));
  }
  ancestors.delete(value);
  return result;
}

function checkShape(value: JsonObject, report: Report): void {
  const invalid = (path: string, message: string) => report("layout-hints-invalid", path, message);
  const unknown = (key: string, path: string) => {
    if ((forbiddenHints as readonly string[]).includes(key)) {
      report("layout-hint-forbidden", path, `${key} is a geometry override`, { hint: key });
    } else if ((futureHints as readonly string[]).includes(key)) {
      report("layout-hint-not-implemented", path, `${key} requires ${futureVocabulary}`, { hint: key, vocabulary: futureVocabulary });
    } else {
      report("layout-hint-unknown", path, `${key} is not a layout property`, { hint: key });
    }
  };
  const object = (entry: unknown, path: string, keys: readonly string[]): JsonObject => {
    if (!isObject(entry)) {
      invalid(path, "expected an object");
      return Object.create(null) as JsonObject;
    }
    for (const key of Object.keys(entry)) if (!keys.includes(key)) unknown(key, path ? `${path}.${key}` : key);
    return entry;
  };
  const table = (entry: unknown, path: string, check: (item: unknown, itemPath: string, key: string) => void, root = false) => {
    if (!isObject(entry)) return invalid(path, "expected an object keyed by entity");
    for (const [key, item] of Object.entries(entry)) {
      const itemPath = `${path}.${key}`;
      if (entityRef.test(key) || (root && key === "root")) check(item, itemPath, key);
      else unknown(key, itemPath);
    }
  };
  const array = (entry: unknown, path: string, min: number, max: number, check: (item: unknown, itemPath: string) => void) => {
    if (!Array.isArray(entry) || entry.length < min || entry.length > max) {
      return invalid(path, `expected a list with ${min}${Number.isFinite(max) ? `–${max}` : "+"} items`);
    }
    entry.forEach((item, index) => check(item, `${path}.${index}`));
  };
  const word = (entry: unknown, path: string, words: readonly string[]) => {
    if (typeof entry !== "string" || !words.includes(entry)) invalid(path, `expected one of ${words.join(", ")}`);
  };
  const pattern = (entry: unknown, path: string, regex: RegExp) => {
    if (typeof entry !== "string" || !regex.test(entry)) invalid(path, `expected a string matching ${regex.source}`);
  };
  const id = (entry: unknown, path: string) => pattern(entry, path, trackId);
  const items = (entry: unknown, path: string, min: number, max: number) => {
    array(entry, path, min, max, (item, itemPath) => pattern(item, itemPath, entityRef));
  };
  const mode = value["mode"] as (typeof modes)[number];
  object(value, "", [...Object.keys(schema.properties)]);
  if ((modes as readonly unknown[]).includes(mode)) {
    for (const key of modeScope[mode]) {
      if (Object.hasOwn(value, key)) report("layout-hint-out-of-scope", key, `${key} is out of scope for ${mode}`, { hint: key, mode });
    }
  } else if (mode === undefined) {
    invalid("mode", "mode is required");
  } else if ((futureModes as readonly unknown[]).includes(mode)) {
    report("layout-mode-not-implemented", "mode", `${mode} is reserved`, { mode, vocabulary: futureVocabulary });
  } else if ((supersededModes as readonly unknown[]).includes(mode)) {
    report("layout-mode-not-implemented", "mode", `${mode} is superseded by stage-columns`, { mode, supersededBy: "stage-columns" });
  } else {
    report("layout-mode-unknown", "mode", "unknown layout mode", typeof mode === "string" ? { mode } : undefined);
  }
  for (const [key, words] of Object.entries({ aspect: aspects, fanIn: fanModes, fanOut: fanModes, legend: legends })) {
    if (Object.hasOwn(value, key)) word(value[key], key, words);
  }

  if (mode === "stage-columns" && (!isObject(value["grids"]) || !Object.hasOwn(value["grids"], "root"))) {
    invalid("grids.root", "stage-columns requires a root grid");
  }
  if (Object.hasOwn(value, "grids")) table(value["grids"], "grids", (entry, path) => {
    const grid = object(entry, path, ["stage_columns", "transverse_bands", "peripheral_columns", "cells"]);
    if (Object.hasOwn(grid, "stage_columns") && grid["stage_columns"] !== "inherit") {
      array(grid["stage_columns"], `${path}.stage_columns`, 1, 16, id);
    }
    if (grid["transverse_bands"] === "inherit") {
      report("layout-hint-not-implemented", `${path}.transverse_bands`, "inherited bands are reserved", {
        hint: "transverse_bands", vocabulary: futureVocabulary,
      });
    } else {
      array(grid["transverse_bands"], `${path}.transverse_bands`, 1, 24, (item, itemPath) => {
        const band = object(item, itemPath, ["id", "items"]);
        id(band["id"], `${itemPath}.id`);
        items(band["items"], `${itemPath}.items`, 0, 32);
      });
    }
    if (Object.hasOwn(grid, "peripheral_columns")) {
      array(grid["peripheral_columns"], `${path}.peripheral_columns`, 0, Infinity, (item, itemPath) => {
        const column = object(item, itemPath, ["id", "side", "items", "from_band"]);
        id(column["id"], `${itemPath}.id`);
        word(column["side"], `${itemPath}.side`, sides);
        items(column["items"], `${itemPath}.items`, 1, 16);
        if (Object.hasOwn(column, "from_band")) id(column["from_band"], `${itemPath}.from_band`);
      });
    }
    if (Object.hasOwn(grid, "cells")) table(grid["cells"], `${path}.cells`, (item, itemPath) => {
      const cell = object(item, itemPath, ["column", "to_column", "to_band", "justify", "align"]);
      for (const key of ["column", "to_column", "to_band"]) if (Object.hasOwn(cell, key)) id(cell[key], `${itemPath}.${key}`);
      for (const key of ["justify", "align"]) if (Object.hasOwn(cell, key)) word(cell[key], `${itemPath}.${key}`, alignments);
    });
  }, true);
  if (Object.hasOwn(value, "stacks")) table(value["stacks"], "stacks", (entry, path) => {
    const stack = object(entry, path, ["axis", "align"]);
    word(stack["axis"], `${path}.axis`, axes);
    if (Object.hasOwn(stack, "align")) word(stack["align"], `${path}.align`, alignments);
  });

  // These are still @1 words, including recursive groups and layered-flow scope.
  // Classify the additional geometry keys when the old validator encounters them.
  if (Array.isArray(value["grouping"])) {
    const scanGroup = (group: unknown, path: string): void => {
      if (!isObject(group)) return;
      for (const key of Object.keys(group)) {
        if (!["id", "direction", "items", "stretch"].includes(key)) unknown(key, `${path}.${key}`);
      }
      const children = group["items"];
      if (Array.isArray(children)) children.forEach((child, index) => scanGroup(child, `${path}.items.${index}`));
    };
    value["grouping"].forEach((group, index) => scanGroup(group, `grouping.${index}`));
  }
}

function checkIdentity(value: ComposedLayoutHints, report: Report, context?: LayoutHintsContext): void {
  const conflict = (path: string, message: string) => report("layout-hint-conflict", path, message);
  const grids = new Map(Object.entries(value.grids) as [string, LayoutGrid][]);
  const placed = new Set<EntityRef>();
  const bandOwner = new Map<EntityRef, string>();
  for (const [scope, grid] of grids) {
    const path = `grids.${scope}`;
    const ids = new Set<string>();
    const track = (id: string, trackPath: string) => {
      if (ids.has(id)) conflict(trackPath, `duplicate track id ${id}`);
      ids.add(id);
    };
    const place = (items: readonly EntityRef[], itemPath: string) => {
      items.forEach((item, index) => {
        if (placed.has(item)) conflict(`${itemPath}.${index}`, `${item} is already placed`);
        placed.add(item);
      });
    };
    if (grid.stage_columns !== undefined && grid.stage_columns !== "inherit") {
      grid.stage_columns.forEach((id, index) => track(id, `${path}.stage_columns.${index}`));
    }
    grid.transverse_bands.forEach((band, index) => {
      track(band.id, `${path}.transverse_bands.${index}.id`);
      place(band.items, `${path}.transverse_bands.${index}.items`);
      for (const item of band.items) if (!bandOwner.has(item)) bandOwner.set(item, scope);
    });
    grid.peripheral_columns?.forEach((column, index) => {
      const columnPath = `${path}.peripheral_columns.${index}`;
      track(column.id, `${columnPath}.id`);
      place(column.items, `${columnPath}.items`);
      if (column.from_band !== undefined && !grid.transverse_bands.some((band) => band.id === column.from_band)) {
        conflict(`${columnPath}.from_band`, "unknown starting band");
      }
    });
    if (value.stacks?.[scope as EntityRef] !== undefined) conflict(`stacks.${scope}`, "a scope cannot be both a grid and a stack");
  }

  const resolved = new Map<string, readonly string[]>();
  const resolving = new Set<string>();
  function columnsOf(scope: string): readonly string[] {
    const cached = resolved.get(scope);
    if (cached !== undefined) return cached;
    const own = grids.get(scope)?.stage_columns;
    if (own !== "inherit") return own ?? [];
    const parent = bandOwner.get(scope as EntityRef);
    const parentGrid = parent === undefined ? undefined : grids.get(parent);
    const cell = parentGrid?.cells?.[scope as EntityRef];
    if (scope === "root" || parent === undefined || parentGrid?.stage_columns === undefined ||
        cell?.column === undefined || resolving.has(scope)) {
      conflict(`grids.${scope}.stage_columns`, "inherit requires a cell in an enclosing staged grid");
      return [];
    }
    resolving.add(scope);
    const ids = columnsOf(parent);
    resolving.delete(scope);
    const first = ids.indexOf(cell.column);
    const last = ids.indexOf(cell.to_column ?? cell.column);
    const ownColumns = first >= 0 && last >= first ? ids.slice(first, last + 1) : [];
    resolved.set(scope, ownColumns);
    return ownColumns;
  }

  for (const [scope, grid] of grids) {
    const path = `grids.${scope}`;
    const columns = columnsOf(scope);
    if (grid.stage_columns === "inherit" && columns.length > 0) {
      const inherited = new Set(columns);
      grid.transverse_bands.forEach((band, index) => {
        if (inherited.has(band.id)) conflict(`${path}.transverse_bands.${index}.id`, `duplicate track id ${band.id}`);
      });
      grid.peripheral_columns?.forEach((column, index) => {
        if (inherited.has(column.id)) conflict(`${path}.peripheral_columns.${index}.id`, `duplicate track id ${column.id}`);
      });
    }
    const bandIds = grid.transverse_bands.map((band) => band.id);
    const bandItems = new Set(grid.transverse_bands.flatMap((band) => band.items));
    const covered = new Set<number>();
    const slots = new Set<number>();
    const staged = grid.stage_columns !== undefined;
    for (const key of Object.keys(grid.cells ?? {})) {
      if (!bandItems.has(key as EntityRef)) conflict(`${path}.cells.${key}`, "a cell must belong to a band item of its grid");
    }
    grid.transverse_bands.forEach((band, startBand) => {
      for (const item of band.items) {
        const cell = grid.cells?.[item];
        const cellPath = `${path}.cells.${item}`;
        if (!staged) {
          for (const key of ["column", "to_column", "to_band", "justify"]) {
            if (cell !== undefined && Object.hasOwn(cell, key)) conflict(`${cellPath}.${key}`, "this field requires stage columns");
          }
          continue;
        }
        if (cell?.column === undefined) {
          conflict(`${cellPath}.column`, "a staged band item requires a cell column");
          continue;
        }
        const first = columns.indexOf(cell.column);
        const last = columns.indexOf(cell.to_column ?? cell.column);
        const endBand = cell.to_band === undefined ? startBand : bandIds.indexOf(cell.to_band);
        if (first < 0) conflict(`${cellPath}.column`, "unknown stage column");
        if (cell.to_column !== undefined && (last < 0 || last < first)) {
          conflict(`${cellPath}.to_column`, "the end column must be known and at or after the start column");
        }
        if (endBand < startBand) conflict(`${cellPath}.to_band`, "the end band must be known and at or after the start band");
        if (first < 0 || last < first || endBand < startBand) continue;
        let overlap = false;
        for (let row = startBand; row <= endBand; row++) {
          if (row > startBand) covered.add(row);
          for (let column = first; column <= last; column++) {
            const slot = row * columns.length + column;
            overlap ||= slots.has(slot);
            slots.add(slot);
          }
        }
        if (overlap) conflict(cellPath, "cells cannot cover the same slot");
      }
    });
    grid.transverse_bands.forEach((band, index) => {
      if (band.items.length === 0 && !covered.has(index)) {
        conflict(`${path}.transverse_bands.${index}.items`, "an empty band requires a cell spanning it from an earlier band");
      }
    });
  }

  for (const stackKey of Object.keys(value.stacks ?? {}).sort()) {
    const stack = value.stacks?.[stackKey as EntityRef];
    if (stack?.align !== "stretch") continue;
    if (context?.containers !== undefined && context.parentOf !== undefined) {
      const containerSet = context.containers instanceof Set ? context.containers : new Set(context.containers);
      const entries = context.parentOf instanceof Map
        ? [...context.parentOf.entries()]
        : Object.entries(context.parentOf);
      const hasLeafChild = entries.some(
        ([child, parent]) => parent === stackKey && !containerSet.has(child as EntityRef),
      );
      if (hasLeafChild) {
        conflict(
          `stacks.${stackKey}.align`,
          `stretch alignment is admitted on containers only, not leaves in stack ${stackKey}`,
        );
      }
      continue;
    }
    if (stack.axis === "column" || context?.containers === undefined) {
      conflict(
        `stacks.${stackKey}.align`,
        `stretch alignment on ${stack.axis} stack ${stackKey} is not admitted for card children (cards have fixed footprint); omit align or use start/center/end`,
      );
    }
  }
}

/** Validate the closed @2 vocabulary, then verify identities and span occupancy. */
export function validateLayoutHintsV2(input: unknown, context?: LayoutHintsContext): readonly Diagnostic[] {
  const found: Diagnostic[] = [];
  const report: Report = (code, path, message, details) => {
    const item = diagnostic({ code, path: path ? `layout.${path}` : "layout", message, ...(details === undefined ? {} : { details }) });
    if (!found.some((entry) => entry.code === item.code && entry.path === item.path)) found.push(item);
  };
  try {
    if (!isObject(input)) {
      report("layout-hints-invalid", "", "expected a layout-hint object");
    } else if (vocabularyOf(input) !== DS_LAYOUT_V2_VOCABULARY) {
      report("layout-vocabulary-unknown", "vocabulary", `expected ${DS_LAYOUT_V2_VOCABULARY}`);
    } else {
      const value = snapshot(input, "", report) as JsonObject;
      checkShape(value, report);
      const mode = value["mode"];
      const twin: JsonObject = { vocabulary: DS_LAYOUT_VOCABULARY, mode: mode === "layered-flow" ? mode : "auto-pack" };
      for (const key of DS_LAYOUT_MEASURED_HINTS) if (Object.hasOwn(value, key)) twin[key] = value[key];
      for (const entry of validateLayoutHints(twin, context)) {
        const samePath = found.filter((item) => item.path === entry.path);
        if (samePath.some((item) => item.code === entry.code)) continue;
        if (entry.code === "layout-hint-unknown" && samePath.length > 0) continue;
        found.push(entry);
      }
      if (found.length === 0 && mode === "stage-columns") checkIdentity(value as unknown as ComposedLayoutHints, report, context);
    }
  } catch {
    report("layout-hints-invalid", "", "expected a plain, acyclic layout-hint payload");
  }
  return found.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
}

export function validateAnyLayoutHints(value: unknown, context?: LayoutHintsContext): readonly Diagnostic[] {
  try {
    return vocabularyOf(value) === DS_LAYOUT_V2_VOCABULARY
      ? validateLayoutHintsV2(value, context)
      : validateLayoutHints(value, context);
  } catch {
    return [diagnostic({ code: "layout-hints-invalid", path: "layout", message: "expected a plain layout-hint payload" })];
  }
}

/** Lower a validated @2 declaration. Legacy modes share the @1 lowering. */
export function lowerLayoutHintsV2(hints: DsLayoutHintsV2, roots: readonly EntityRef[] = []): LoweredLayoutHintsV2 {
  if (hints.mode !== "stage-columns") return lowerLayoutHints({ ...hints, vocabulary: DS_LAYOUT_VOCABULARY }, roots);
  return {
    ...(hints.rootOrder === undefined ? {} : { rootOrder: hints.rootOrder }),
    ...(hints.ordering === undefined ? {} : { ordering: hints.ordering }),
    composition: {
      grids: hints.grids,
      stacks: hints.stacks ?? {},
      aspect: hints.aspect ?? "free",
      fanIn: hints.fanIn ?? "separate",
      fanOut: hints.fanOut ?? "separate",
      legend: hints.legend ?? "host",
    },
  };
}
