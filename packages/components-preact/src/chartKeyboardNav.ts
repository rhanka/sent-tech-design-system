// --- Chart datapoint keyboard navigation (shared, framework-agnostic) --------
//
// FR-5: ROVING-TABINDEX keyboard navigation over a cartesian chart's data
// points (Bar / Line / Area). The decorative SVG stays `aria-hidden`; a thin,
// transparent overlay of focusable hit-rects (one per datum, in data order) is
// rendered on top. The overlay carries a SINGLE tab stop — the focused datum —
// and the arrow keys move that focus between datums:
//
//   ←/↑           previous datum            →/↓           next datum
//   Home          first datum               End           last datum
//   Enter / Space select the focused datum  Escape        leave the nav
//
// Each focusable element announces its category + value via `aria-label`
// (built by `datapointAriaLabel`). Selection emits `onSelectKey?(key | null)`;
// Escape clears the internal selection (emits null). The focus also feeds the
// shared crosshair channel: moving focus emits `onHoverKeyChange(key)` so a
// linked tooltip (FR-3) tracks the keyboard cursor, and leaving emits null.
//
// Purely additive: a chart that wires neither `onSelectKey` nor `keyboardNav`
// renders exactly as before (no overlay, no extra tab stop).

/** Keys that drive the roving focus, mapped to an action. */
export type DatapointNavAction =
  | { kind: "move"; index: number }
  | { kind: "select" }
  | { kind: "escape" };

/**
 * Maps a keydown to a roving-nav action given the current focused index and the
 * datum count. Returns `null` for keys we don't handle (so the caller leaves the
 * event untouched). `count` is assumed >= 1 when called.
 */
export function datapointNavAction(
  key: string,
  current: number,
  count: number,
): DatapointNavAction | null {
  if (count <= 0) return null;
  const clamp = (i: number) => Math.min(count - 1, Math.max(0, i));
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return { kind: "move", index: clamp(current + 1) };
    case "ArrowLeft":
    case "ArrowUp":
      return { kind: "move", index: clamp(current - 1) };
    case "Home":
      return { kind: "move", index: 0 };
    case "End":
      return { kind: "move", index: count - 1 };
    case "Enter":
    case " ":
    case "Spacebar": // legacy IE/Edge value
      return { kind: "select" };
    case "Escape":
    case "Esc": // legacy value
      return { kind: "escape" };
    default:
      return null;
  }
}

/**
 * The roving `tabindex` for the datum at `index`: `0` (the single tab stop) for
 * the focused datum, `-1` for every other. When nothing is focused yet
 * (`focusedIndex < 0`) the FIRST datum holds the tab stop so the group is
 * reachable by Tab.
 */
export function rovingTabIndex(index: number, focusedIndex: number, count: number): number {
  const active = focusedIndex >= 0 && focusedIndex < count ? focusedIndex : 0;
  return index === active ? 0 : -1;
}

/**
 * Accessible label for a focused datum: its category followed by its value, e.g.
 * `"Janvier, 42"`. `category` is the x/categorical label, `value` the y value.
 * Kept framework-agnostic and identical across the three packages.
 */
export function datapointAriaLabel(category: string | number, value: string | number): string {
  return `${category}, ${value}`;
}
