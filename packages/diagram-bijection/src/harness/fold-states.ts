// Fold states of one view (§2.1): `default`, `all-expanded`, `all-folded`,
// then one `toggle:<EID>` per container of D in ascending order.
import type { FoldContext, FoldState } from "./types.js";

export function enumerateFoldStates(ctx: FoldContext): readonly FoldState[] {
  const containers = [...ctx.containers].sort();
  const defaultCollapsed = [...ctx.defaultCollapsed].sort();
  const states: FoldState[] = [
    { id: "default", view: ctx.view, collapsed: defaultCollapsed },
    { id: "all-expanded", view: ctx.view, collapsed: [] },
    { id: "all-folded", view: ctx.view, collapsed: containers },
  ];
  for (const container of containers) {
    const toggled = defaultCollapsed.includes(container)
      ? defaultCollapsed.filter((c) => c !== container)
      : [...defaultCollapsed, container].sort();
    states.push({ id: `toggle:${container}`, view: ctx.view, collapsed: toggled });
  }
  return states;
}

/** The `default` state of a view context. */
export function defaultFoldState(ctx: FoldContext): FoldState {
  return { id: "default", view: ctx.view, collapsed: [...ctx.defaultCollapsed].sort() };
}

/** Recover the state id of a (view, collapsed) pair inside a fold context. */
export function foldStateIdOf(ctx: FoldContext, collapsed: readonly string[]): FoldState["id"] {
  const sorted = [...collapsed].sort();
  const eq = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((v, i) => v === b[i]);
  if (eq(sorted, [...ctx.defaultCollapsed].sort())) return "default";
  if (sorted.length === 0) return "all-expanded";
  if (eq(sorted, [...ctx.containers].sort())) return "all-folded";
  const containers = [...ctx.containers].sort();
  const base = [...ctx.defaultCollapsed].sort();
  const diff = containers.filter((c) => (sorted.includes(c) !== base.includes(c)));
  if (diff.length === 1) return `toggle:${diff[0]}`;
  return "default";
}
