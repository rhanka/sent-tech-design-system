/**
 * Recursive authored layout hints (M3 §4.7).
 *
 * `items` is the single ordered sequence: references and subgroups can
 * interleave. There is no tree parser and no scene flag in the engine: hints
 * are input data, and no source coordinate is ever copied as layout input.
 */
import type { EntityRef } from "@sentropic/diagram-core";

import type { LayoutMetrics, LayoutRefusal } from "./types.js";

export interface LayoutGroup {
  readonly id: string;
  readonly direction: "rows" | "columns";
  readonly items: readonly (EntityRef | LayoutGroup)[];
  readonly stretch?: boolean;
  readonly gapAfter?: number;
}

export interface LayoutHints {
  readonly ordering?: Readonly<Record<EntityRef, readonly EntityRef[]>>;
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

/** Local stretch overrides global stretch (M3 §4.7). */
export function effectiveStretch(groupStretch: boolean | undefined, globalStretch: boolean | undefined): boolean {
  return groupStretch ?? globalStretch ?? false;
}
