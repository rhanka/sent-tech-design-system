/** Serialises a Line/Area datum's `x` to its stable hover key. */
export declare function keyForX(x: number | string): string;
/**
 * Resolves the hover key to a datum index within `keys` (the ordered list of
 * every datum's key). Returns -1 when the key is null/undefined or unmatched.
 */
export declare function indexForHoverKey(hoverKey: string | null | undefined, keys: string[]): number;
/**
 * Picks the datum index to DISPLAY the crosshair/tooltip at.
 *   - Controlled (`hoverKey !== undefined`): the index of `hoverKey` in `keys`
 *     (or -1 when null/unmatched). The internal pointer index is ignored for
 *     display.
 *   - Uncontrolled (`hoverKey === undefined`): the internal pointer index.
 * Returns -1 when nothing should be shown.
 */
export declare function resolveActiveIndex(hoverKey: string | null | undefined, internalIndex: number | null, keys: string[]): number;
/** True when the chart is CONTROLLED (the parent supplied `hoverKey`). */
export declare function isControlled(hoverKey: string | null | undefined): boolean;
//# sourceMappingURL=chartCrosshair.d.ts.map