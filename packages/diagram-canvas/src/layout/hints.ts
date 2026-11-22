import { DIAGRAM_SCENE_SPACING as spacing } from './spacing.generated.js';
/**
 * Recursive authored layout hints (M3 §4.7).
 *
 * `items` is the single ordered sequence: references and subgroups can
 * interleave. There is no tree parser and no scene flag in the engine: hints
 * are input data, and no source coordinate is ever copied as layout input.
 */
import type {
  EntityRef,
  LayoutBand,
  LayoutCell,
  LayoutCellAlign,
  LayoutComposition,
  LayoutGrid,
  LayoutPeripheralColumn,
  LayoutStack,
} from "@sentropic/diagram-core";

export type {
  LayoutBand,
  LayoutCell,
  LayoutCellAlign,
  LayoutComposition,
  LayoutGrid,
  LayoutPeripheralColumn,
  LayoutStack,
};

import { DEFAULT_ROW_GAP, DEFAULT_ROW_GAP_MAX, type LayoutMetrics, type LayoutRefusal } from "./types.js";

export interface LayoutGroup {
  readonly id: string;
  /**
   * How the group packs its items on a measured view (DC-2a §3.7): `rows` =
   * horizontal shelves filled left to right and wrapping downward, `columns` =
   * vertical shelves filled top to bottom and wrapping rightward. Before
   * DC-2a `rows` was one vertical stack and `columns` one horizontal row.
   */
  readonly direction: "rows" | "columns";
  readonly items: readonly (EntityRef | LayoutGroup)[];
  readonly stretch?: boolean;
  /** Gap after this group inside its level, replacing the base gap; refused above the axis cap. */
  readonly gapAfter?: number;
}

export interface LayoutHints {
  readonly ordering?: Readonly<Record<EntityRef, readonly EntityRef[]>>;
  /**
   * Declaration order of the root level (DC-2a §6.4) of a measured view:
   * listed roots first, unlisted visible roots after in UTF-16 order (the
   * documented degraded mode — a host supplies the full order).
   */
  readonly rootOrder?: readonly EntityRef[];
  readonly grouping?: readonly LayoutGroup[];
  readonly stretch?: boolean;
  /** Composed `ds-layout-hints@2` placement (`stage-columns`). Absent on `@1` and `auto-pack`. */
  readonly composition?: LayoutComposition;
  readonly cardGapX?: number;
  readonly cardGapY?: number;
  readonly zoneGapX?: number;
  readonly zoneGapY?: number;
  readonly rankGap?: number;
}

export function isLayoutGroup(item: EntityRef | LayoutGroup): item is LayoutGroup {
  return typeof item !== "string";
}

/** Flattened leaf references of a group, in order. */
export function groupLeaves(group: LayoutGroup): EntityRef[] {
  const out: EntityRef[] = [];
  const visit = (item: EntityRef | LayoutGroup): void => {
    if (!isLayoutGroup(item)) {
      out.push(item);
      return;
    }
    for (const child of item.items) visit(child);
  };
  for (const item of group.items) visit(item);
  return out;
}

/** Sibling scope of an entity: its semantic parent, or undefined at the root. */
export interface HintScope {
  readonly roots: ReadonlySet<EntityRef>;
  readonly parentOf: ReadonlyMap<EntityRef, EntityRef | undefined>;
  /** Entities whose document/presentation kind is container or legend (expanded or collapsed). */
  readonly containers?: ReadonlySet<EntityRef>;
}

/**
 * Validate authored hints: duplicate leaf membership in one context and a
 * reference outside its sibling context refuse with `layout-hint-invalid`.
 * Unknown entity references (absent from the document) refuse as well.
 */
export function validateHints(hints: LayoutHints, scope: HintScope): LayoutRefusal[] {
  const refusals: LayoutRefusal[] = [];
  const refuse = (path: string, message: string, refs: readonly string[]): void => {
    refusals.push({ code: "layout-hint-invalid", path, message, refs });
  };
  for (const [parent, order] of Object.entries(hints.ordering ?? {})) {
    const parentRef = parent as EntityRef;
    const seen = new Set<string>();
    for (const member of order as readonly EntityRef[]) {
      if (seen.has(member)) {
        refuse(`hints.ordering.${parent}`, `duplicate member ${member} in the ordering of ${parent}`, [member]);
        continue;
      }
      seen.add(member);
      if (!scope.roots.has(member) && !scope.parentOf.has(member)) {
        refuse(`hints.ordering.${parent}`, `unknown member ${member} in the ordering of ${parent}`, [member]);
      } else if (scope.parentOf.get(member) !== parentRef) {
        refuse(`hints.ordering.${parent}`, `member ${member} is outside the sibling context of ${parent}`, [member]);
      }
    }
  }
  // §6.4: `rootOrder` lists root entities only, each once.
  const seenRoots = new Set<string>();
  for (const member of hints.rootOrder ?? []) {
    if (!scope.roots.has(member) || seenRoots.has(member)) {
      refuse("hints.rootOrder", `${member} is not a root entity listed once in hints.rootOrder`, [member]);
    }
    seenRoots.add(member);
  }
  const visitGroup = (group: LayoutGroup, path: string): void => {
    const leaves = groupLeaves(group);
    const seen = new Set<string>();
    for (const leaf of leaves) {
      if (seen.has(leaf)) {
        refuse(`${path}.items`, `duplicate leaf ${leaf} in group ${group.id}`, [leaf]);
        continue;
      }
      seen.add(leaf);
      if (!scope.roots.has(leaf) && !scope.parentOf.has(leaf)) {
        refuse(`${path}.items`, `unknown leaf ${leaf} in group ${group.id}`, [leaf]);
      }
    }
    // One context, one sibling scope: every leaf of a group shares a parent.
    const scopes = new Set<EntityRef | undefined>();
    for (const leaf of new Set(leaves)) {
      if (scope.roots.has(leaf)) scopes.add(undefined);
      else scopes.add(scope.parentOf.get(leaf));
    }
    if (scopes.size > 1) {
      refuse(
        `${path}.items`,
        `group ${group.id} mixes sibling contexts (${leaves.join(", ")})`,
        [...new Set(leaves)],
      );
    }
    for (const item of group.items) {
      if (isLayoutGroup(item)) visitGroup(item, `${path}.items.${item.id}`);
    }
  };
  for (const group of hints.grouping ?? []) visitGroup(group, `hints.grouping.${group.id}`);
  const ownership = new Map<string, Map<string, string>>();
  for (const group of hints.grouping ?? []) {
    const leaves = [...new Set(groupLeaves(group))];
    const contexts = new Set<string>();
    for (const leaf of leaves) {
      const context = scope.roots.has(leaf) ? "__roots__" : `parent:${String(scope.parentOf.get(leaf) ?? "__unknown__")}`;
      contexts.add(context);
    }
    if (contexts.size !== 1) continue;
    const context = [...contexts][0]!;
    let claimed = ownership.get(context);
    if (claimed === undefined) {
      claimed = new Map<string, string>();
      ownership.set(context, claimed);
    }
    for (const leaf of leaves) {
      const first = claimed.get(leaf);
      if (first !== undefined) {
        refuse(`hints.grouping.${group.id}.items`, `duplicate leaf ${leaf} across groups ${first} and ${group.id}`, [leaf]);
        continue;
      }
      claimed.set(leaf, group.id);
    }
  }
  if (hints.composition !== undefined) {
    validateCompositionHints(hints.composition, scope, refuse);
  }
  return refusals;
}

function validateCompositionHints(
  composition: LayoutComposition,
  scope: HintScope,
  refuse: (path: string, message: string, refs: readonly string[]) => void,
): void {
  const byString = (left: string, right: string): number => (left < right ? -1 : left > right ? 1 : 0);
  const hasEntity = (ref: EntityRef): boolean => scope.roots.has(ref) || scope.parentOf.has(ref);
  const isContainer = (ref: EntityRef): boolean => scope.containers?.has(ref) ?? false;
  const grids = composition.grids;
  if (grids === undefined || grids.root === undefined) {
    refuse("hints.composition.grids.root", "stage-columns composition requires a root grid", []);
    return;
  }
  const bandOwner = new Map<EntityRef, string>();
  const placed = new Set<EntityRef>();
  for (const scopeKey of Object.keys(grids).sort(byString)) {
    const grid = grids[scopeKey as keyof typeof grids];
    if (grid === undefined) continue;
    const gridPath = `hints.composition.grids.${scopeKey}`;
    if (scopeKey !== "root") {
      const entity = scopeKey as EntityRef;
      if (!hasEntity(entity)) {
        refuse(gridPath, `unknown grid scope ${scopeKey}`, [entity]);
      } else if (scope.containers !== undefined && !isContainer(entity)) {
        refuse(gridPath, `grid scope ${scopeKey} is not a container`, [entity]);
      }
    }
    const checkChild = (item: EntityRef, path: string): void => {
      if (placed.has(item)) {
        refuse(path, `duplicate placement of ${item} in composition`, [item]);
      } else {
        placed.add(item);
      }
      if (!hasEntity(item)) {
        refuse(path, `unknown entity ${item} in grid ${scopeKey}`, [item]);
        return;
      }
      const inScope = scopeKey === "root" ? scope.roots.has(item) : scope.parentOf.get(item) === (scopeKey as EntityRef);
      if (!inScope) {
        refuse(path, `entity ${item} does not have ${scopeKey} as placement parent`, [item]);
      }
    };
    const bandItems = new Set<EntityRef>();
    for (const band of grid.transverse_bands) {
      const bandPath = `${gridPath}.transverse_bands.${band.id}.items`;
      for (const item of band.items) {
        checkChild(item, bandPath);
        bandItems.add(item);
        if (!bandOwner.has(item)) bandOwner.set(item, scopeKey);
      }
    }
    for (const column of grid.peripheral_columns ?? []) {
      const columnPath = `${gridPath}.peripheral_columns.${column.id}.items`;
      for (const item of column.items) {
        checkChild(item, columnPath);
      }
    }
    for (const itemKey of Object.keys(grid.cells ?? {}).sort(byString)) {
      const itemRef = itemKey as EntityRef;
      const cell = grid.cells?.[itemRef];
      if (cell === undefined) continue;
      const cellPath = `${gridPath}.cells.${itemKey}`;
      if (!hasEntity(itemRef)) {
        refuse(cellPath, `unknown cell entity ${itemKey} in grid ${scopeKey}`, [itemRef]);
        continue;
      }
      if (!bandItems.has(itemRef)) {
        refuse(cellPath, `cell entity ${itemKey} is not a band item of grid ${scopeKey}`, [itemRef]);
      }
      if (
        scope.containers !== undefined &&
        !isContainer(itemRef) &&
        (cell.justify === "stretch" || cell.align === "stretch")
      ) {
        refuse(cellPath, `stretch alignment is admitted on containers only, not leaf ${itemKey}`, [itemRef]);
      }
    }
  }
  // Check `stage_columns: "inherit"` chains against enclosing staged grids.
  const resolving = new Set<string>();
  const checkInherit = (scopeKey: string): boolean => {
    const grid = grids[scopeKey as keyof typeof grids];
    if (grid === undefined) return false;
    if (grid.stage_columns !== "inherit") return grid.stage_columns !== undefined;
    const path = `hints.composition.grids.${scopeKey}.stage_columns`;
    if (scopeKey === "root" || resolving.has(scopeKey)) {
      refuse(path, `inherit on ${scopeKey} requires a cell in an enclosing staged grid`, scopeKey === "root" ? [] : [scopeKey]);
      return false;
    }
    const entity = scopeKey as EntityRef;
    const parent = bandOwner.get(entity);
    const parentGrid = parent === undefined ? undefined : grids[parent as keyof typeof grids];
    const parentCell = parentGrid?.cells?.[entity];
    if (parent === undefined || parentGrid === undefined || parentGrid.stage_columns === undefined || parentCell?.column === undefined) {
      refuse(path, `inherit on ${scopeKey} requires a band cell in an enclosing staged grid`, [entity]);
      return false;
    }
    resolving.add(scopeKey);
    const ok = checkInherit(parent);
    resolving.delete(scopeKey);
    return ok;
  };
  for (const scopeKey of Object.keys(grids).sort(byString)) {
    if (grids[scopeKey as keyof typeof grids]?.stage_columns === "inherit") checkInherit(scopeKey);
  }
  for (const stackKey of Object.keys(composition.stacks ?? {}).sort(byString)) {
    const entity = stackKey as EntityRef;
    const stack = composition.stacks[entity];
    const stackPath = `hints.composition.stacks.${stackKey}`;
    if (!hasEntity(entity)) {
      refuse(stackPath, `unknown stack container ${stackKey}`, [entity]);
      continue;
    }
    if (scope.containers !== undefined && !isContainer(entity)) {
      refuse(stackPath, `stack key ${stackKey} is not a container`, [entity]);
      continue;
    }
    if (grids[entity] !== undefined) {
      refuse(stackPath, `container ${stackKey} cannot declare both a grid and a stack`, [entity]);
    }
    if (stack?.align === "stretch" && scope.containers !== undefined) {
      const leafChildren: EntityRef[] = [];
      for (const [child, parent] of scope.parentOf) {
        if (parent === entity && !isContainer(child)) leafChildren.push(child);
      }
      if (leafChildren.length > 0) {
        refuse(`${stackPath}.align`, `stretch alignment is admitted on containers only, not leaves in stack ${stackKey}`, leafChildren.sort(byString));
      }
    }
  }
}

/**
 * Sibling order within one semantic parent: listed members first in authored
 * order, unlisted siblings after in UTF-16 reference order (M3 §4.7).
 */
export function resolveOrder(
  siblings: readonly EntityRef[],
  ordered: readonly EntityRef[] | undefined,
): EntityRef[] {
  const members = new Set(siblings);
  const listed = (ordered ?? []).filter((member) => members.has(member));
  const rest = siblings.filter((member) => !(ordered ?? []).includes(member)).sort();
  return [...listed, ...rest];
}

export interface ResolvedGaps {
  readonly cardGapX: number;
  readonly cardGapY: number;
  readonly zoneGapX: number;
  readonly zoneGapY: number;
  readonly rankGap: number;
}

/**
 * Absent values inherit the call's engine metrics; absence is never replaced
 * with an invented measured number (M3 §4.7).
 */
export function resolveGaps(hints: LayoutHints | undefined, metrics: LayoutMetrics): ResolvedGaps {
  return {
    cardGapX: hints?.cardGapX ?? metrics.nodeGap,
    cardGapY: hints?.cardGapY ?? metrics.nodeGap,
    zoneGapX: hints?.zoneGapX ?? metrics.nodeGap,
    zoneGapY: hints?.zoneGapY ?? metrics.nodeGap,
    rankGap: hints?.rankGap ?? metrics.rankGap,
  };
}

/** Sibling gaps of the measured path (DC-2a §3.5), resolved: base gap per box kind and axis, and the axis caps. */
export interface ResolvedRowGaps {
  readonly cardX: number;
  readonly cardY: number;
  readonly zoneX: number;
  readonly zoneY: number;
  readonly maxX: number;
  readonly maxY: number;
}

/**
 * One place where the measured sibling gaps resolve: a hint override, else
 * the token number passed as a metric, else the engine default mirroring the
 * token. The caps come from the metrics only: no hint raises a cap.
 */
export function resolveRowGaps(
  hints: LayoutHints | undefined,
  metrics: LayoutMetrics,
  useZoneGutter = false,
): ResolvedRowGaps {
  // REQ-R7-14 (DE-2 ask 3): on the r7 path, sibling-zone gutters use one single
  // fixed `zoneGutter` token (>= 96) on both axes; per-axis `zoneGapX/Y` hints
  // cannot shrink or split it. On v1 (`useZoneGutter === false`), hints keep
  // exact main behaviour.
  const zoneGutter = useZoneGutter
    ? Math.max(spacing.zoneGutter, metrics.zoneGutter ?? spacing.zoneGutter)
    : undefined;
  return {
    cardX: hints?.cardGapX ?? metrics.rowGapInline ?? metrics.gapMin ?? DEFAULT_ROW_GAP,
    cardY: hints?.cardGapY ?? metrics.rowGapBlock ?? metrics.gapMinBlock ?? spacing.gapMinBlock,
    zoneX: zoneGutter ?? hints?.zoneGapX ?? metrics.rowGapInline ?? metrics.gapMin ?? DEFAULT_ROW_GAP,
    zoneY: zoneGutter ?? hints?.zoneGapY ?? metrics.rowGapBlock ?? metrics.gapMinBlock ?? spacing.gapMinBlock,
    maxX: metrics.gapInlineMax ?? metrics.gapMax ?? DEFAULT_ROW_GAP_MAX,
    maxY: metrics.gapBlockMax ?? metrics.gapMax ?? DEFAULT_ROW_GAP_MAX,
  };
}

/** Local stretch overrides global stretch (M3 §4.7). */
export function effectiveStretch(groupStretch: boolean | undefined, globalStretch: boolean | undefined): boolean {
  return groupStretch ?? globalStretch ?? false;
}
