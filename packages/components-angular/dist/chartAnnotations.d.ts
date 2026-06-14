/**
 * Marker glyph for a `point` annotation. Defaults to `circle`.
 */
export type ChartAnnotationMarker = "circle" | "square" | "diamond";
/**
 * A single chart annotation in DATA space. Discriminated on `kind`:
 * - `point`  — a marked coordinate `(x, y)` with an optional label.
 * - `label`  — free text anchored at `(x, y)`.
 * - `line`   — a full-width/height guide on one axis at `value` (vertical when
 *              `axis: "x"`, horizontal when `axis: "y"`).
 * - `region` — a filled band on one axis between `from` and `to`.
 * - `shape`  — a closed polygon through `points` (data-space coordinates).
 *
 * `x` may be a string for categorical (ordinal) x axes — it then matches a
 * category by equality; `y` and value-axis numbers are always numeric.
 */
export type ChartAnnotation = {
    kind: "point";
    x: number | string;
    y: number;
    label?: string;
    marker?: ChartAnnotationMarker;
} | {
    kind: "label";
    x: number | string;
    y: number;
    text: string;
    anchor?: "start" | "middle" | "end";
} | {
    kind: "line";
    axis: "x" | "y";
    value: number;
    label?: string;
} | {
    kind: "region";
    axis: "x" | "y";
    from: number;
    to: number;
    label?: string;
} | {
    kind: "shape";
    points: {
        x: number | string;
        y: number;
    }[];
    label?: string;
};
/**
 * Scale context for {@link resolveAnnotations}. `xScale` / `yScale` map a data
 * value to a pixel offset RELATIVE to the plot (0..plotWidth / 0..plotHeight),
 * returning `null` when the value is non-finite, out of domain, or — for a
 * categorical x axis — does not match any category. `plotLeft` / `plotTop` are
 * the plot's pixel origin (chart margins); `plotWidth` / `plotHeight` its size.
 */
export type AnnotationScaleContext = {
    xScale: (value: number | string) => number | null;
    yScale: (value: number) => number | null;
    plotLeft: number;
    plotTop: number;
    plotWidth: number;
    plotHeight: number;
};
/** Resolved annotation primitive in ABSOLUTE pixel space (plot origin folded in). */
export type ResolvedAnnotation = {
    kind: "region";
    key: number;
    axis: "x" | "y";
    x: number;
    y: number;
    width: number;
    height: number;
    label?: string;
} | {
    kind: "line";
    key: number;
    axis: "x" | "y";
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    label?: string;
} | {
    kind: "shape";
    key: number;
    points: {
        x: number;
        y: number;
    }[];
    label?: string;
    labelX: number;
    labelY: number;
} | {
    kind: "point";
    key: number;
    x: number;
    y: number;
    label?: string;
    marker: ChartAnnotationMarker;
} | {
    kind: "label";
    key: number;
    x: number;
    y: number;
    text: string;
    anchor: "start" | "middle" | "end";
};
/**
 * Resolves DATA-space annotations to ABSOLUTE-pixel primitives. Pure: given the
 * same inputs it always returns the same output, with no DOM/framework access.
 *
 * Region/line on `axis: "x"` are positioned via `xScale` (vertical guide / band
 * spanning the full plot height); on `axis: "y"` via `yScale` (horizontal guide
 * / band spanning the full plot width). Points, labels and shape vertices are
 * positioned via both scales. Any annotation whose required coordinates fall
 * outside the domain (scale returns `null`) or are non-finite is DROPPED, so an
 * annotation never escapes the plot. The original index is preserved as `key`
 * for stable rendering keys + a11y ordering.
 */
export declare function resolveAnnotations(annotations: ReadonlyArray<ChartAnnotation> | undefined, ctx: AnnotationScaleContext): ResolvedAnnotation[];
/**
 * Screen-reader descriptions of the annotations, appended after the data values
 * (and any analytical overlays) in the ChartDataList. Each item is
 * `Annotation: <label/text>`; annotations without a label/text are skipped
 * (nothing meaningful to announce). Empty when no annotation is present.
 */
export declare function annotationDataListItems(annotations: ReadonlyArray<ChartAnnotation> | undefined): string[];
/** SVG polygon `points` attribute from resolved pixel vertices. */
export declare function polygonPoints(points: ReadonlyArray<{
    x: number;
    y: number;
}>): string;
//# sourceMappingURL=chartAnnotations.d.ts.map