import { DIAGRAM_SCENE_SPACING as spacing } from './spacing.generated.js';
/**
 * Recursive authored layout hints (M3 §4.7).
 *
 * `items` is the single ordered sequence: references and subgroups can
 * interleave. There is no tree parser and no scene flag in the engine: hints
 * are input data, and no source coordinate is ever copied as layout input.
 */
import type { EntityRef } from "@sentropic/diagram-core";

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
  return refusals;
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
export function resolveRowGaps(hints: LayoutHints | undefined, metrics: LayoutMetrics): ResolvedRowGaps {
  return {
    cardX: hints?.cardGapX ?? metrics.rowGapInline ?? metrics.gapMin ?? DEFAULT_ROW_GAP,
    cardY: hints?.cardGapY ?? metrics.rowGapBlock ?? metrics.gapMinBlock ?? spacing.gapMinBlock,
    zoneX: hints?.zoneGapX ?? metrics.rowGapInline ?? metrics.gapMin ?? DEFAULT_ROW_GAP,
    zoneY: hints?.zoneGapY ?? metrics.rowGapBlock ?? metrics.gapMinBlock ?? spacing.gapMinBlock,
    maxX: metrics.gapInlineMax ?? metrics.gapMax ?? DEFAULT_ROW_GAP_MAX,
    maxY: metrics.gapBlockMax ?? metrics.gapMax ?? DEFAULT_ROW_GAP_MAX,
  };
}

/** Local stretch overrides global stretch (M3 §4.7). */
export function effectiveStretch(groupStretch: boolean | undefined, globalStretch: boolean | undefined): boolean {
  return groupStretch ?? globalStretch ?? false;
}
