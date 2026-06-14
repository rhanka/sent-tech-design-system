// --- Chart crosshair / synchronised hover layer (shared, framework-agnostic) -
//
// FR-3: a CONTROLLED crosshair + tooltip whose position is driven by a `hoverKey`
// string the parent owns, so dataviz can share one hover channel across several
// aligned panels (a "linked" tooltip). The DS stays presentational: it resolves
// the key to a datum index, draws a tokenised vertical line at that x (plus a
// marker on the point for Line/Area), and reuses the existing tooltip surface.
//
// The "key" is the stable identifier of a datum on the categorical/x axis:
//   - Bar:        the bar's `label`.
//   - Line/Area:  the point's `x`, serialised with `String(x)`.
//
// Behaviour:
//   - `hoverKey === undefined` → UNCONTROLLED (internal hover, unchanged, fully
//     backward compatible).
//   - `hoverKey` provided (string or null) → CONTROLLED: the displayed
//     crosshair/tooltip tracks `hoverKey` (null = nothing shown), the chart's own
//     pointer hover no longer drives the DISPLAY, but `onHoverKeyChange` is still
//     emitted so the parent can keep the shared channel in sync.
//
// Purely additive: a chart that passes neither prop renders exactly as before.
/** Serialises a Line/Area datum's `x` to its stable hover key. */
export function keyForX(x) {
    return String(x);
}
/**
 * Resolves the hover key to a datum index within `keys` (the ordered list of
 * every datum's key). Returns -1 when the key is null/undefined or unmatched.
 */
export function indexForHoverKey(hoverKey, keys) {
    if (hoverKey == null)
        return -1;
    return keys.indexOf(hoverKey);
}
/**
 * Picks the datum index to DISPLAY the crosshair/tooltip at.
 *   - Controlled (`hoverKey !== undefined`): the index of `hoverKey` in `keys`
 *     (or -1 when null/unmatched). The internal pointer index is ignored for
 *     display.
 *   - Uncontrolled (`hoverKey === undefined`): the internal pointer index.
 * Returns -1 when nothing should be shown.
 */
export function resolveActiveIndex(hoverKey, internalIndex, keys) {
    if (hoverKey !== undefined)
        return indexForHoverKey(hoverKey, keys);
    return internalIndex == null ? -1 : internalIndex;
}
/** True when the chart is CONTROLLED (the parent supplied `hoverKey`). */
export function isControlled(hoverKey) {
    return hoverKey !== undefined;
}
//# sourceMappingURL=chartCrosshair.js.map