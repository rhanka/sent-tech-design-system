/** Where a data label sits relative to its datum. Default is per-chart. */
export type DataLabelPosition = "auto" | "inside" | "outside" | "top" | "center";
/**
 * The `dataLabels` prop, homogeneous across every series chart:
 * - `false` / absent (default) → no labels, behaviour unchanged.
 * - `true` → every datum's value with the chart's default numeric formatter.
 * - object → `format(value)` applied when provided (dataviz supplies an Intl
 *   formatter from core; the DS just calls it), `position` overriding the
 *   chart's sensible default when provided.
 */
export type DataLabelsProp = boolean | {
    /** Maps a numeric value to its displayed string. */
    format?: (value: number) => string;
    /** Placement hint; each chart picks a sensible default when omitted. */
    position?: DataLabelPosition;
};
/** Normalised data-label options. `enabled` gates all rendering. */
export type DataLabelsOptions = {
    enabled: boolean;
    format?: (value: number) => string;
    position?: DataLabelPosition;
};
/**
 * Normalises the `dataLabels` prop to `{ enabled, format, position }`. Pure and
 * identical across frameworks: `true` → enabled with no overrides; an object →
 * enabled, carrying any `format`/`position`; anything else → disabled.
 */
export declare function normalizeDataLabels(prop: DataLabelsProp | undefined): DataLabelsOptions;
/**
 * Resolves the string shown for a value. The caller-provided `format` wins;
 * otherwise the chart's own numeric formatter (`fallback`) is used. Non-finite
 * values yield an empty string so callers can skip rendering them.
 */
export declare function formatDataLabel(value: number, opts: DataLabelsOptions, fallback: (value: number) => string): string;
//# sourceMappingURL=chartDataLabels.d.ts.map