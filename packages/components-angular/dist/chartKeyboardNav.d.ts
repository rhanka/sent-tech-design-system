/** Keys that drive the roving focus, mapped to an action. */
export type DatapointNavAction = {
    kind: "move";
    index: number;
} | {
    kind: "select";
} | {
    kind: "escape";
};
/**
 * Maps a keydown to a roving-nav action given the current focused index and the
 * datum count. Returns `null` for keys we don't handle (so the caller leaves the
 * event untouched). `count` is assumed >= 1 when called.
 */
export declare function datapointNavAction(key: string, current: number, count: number): DatapointNavAction | null;
/**
 * The roving `tabindex` for the datum at `index`: `0` (the single tab stop) for
 * the focused datum, `-1` for every other. When nothing is focused yet
 * (`focusedIndex < 0`) the FIRST datum holds the tab stop so the group is
 * reachable by Tab.
 */
export declare function rovingTabIndex(index: number, focusedIndex: number, count: number): number;
/**
 * Accessible label for a focused datum: its category followed by its value, e.g.
 * `"Janvier, 42"`. `category` is the x/categorical label, `value` the y value.
 * Kept framework-agnostic and identical across the three packages.
 */
export declare function datapointAriaLabel(category: string | number, value: string | number): string;
//# sourceMappingURL=chartKeyboardNav.d.ts.map