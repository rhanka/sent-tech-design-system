// --- Chart data-label layer (shared, framework-agnostic) -------------------
//
// Uniform value labels rendered next to each datum/series of a chart. The prop
// is normalised here to a single `{ enabled, format, position }` shape so the
// three renderers (react / vue / svelte) stay in strict parity, and a single
// `formatDataLabel` helper resolves the displayed string (the caller's
// `format` wins, otherwise the chart's own numeric formatter). Purely additive:
// `false`/absent yields `enabled: false` and no labels.
/**
 * Normalises the `dataLabels` prop to `{ enabled, format, position }`. Pure and
 * identical across frameworks: `true` → enabled with no overrides; an object →
 * enabled, carrying any `format`/`position`; anything else → disabled.
 */
export function normalizeDataLabels(prop) {
    if (prop === true)
        return { enabled: true };
    if (prop && typeof prop === "object") {
        return { enabled: true, format: prop.format, position: prop.position };
    }
    return { enabled: false };
}
/**
 * Resolves the string shown for a value. The caller-provided `format` wins;
 * otherwise the chart's own numeric formatter (`fallback`) is used. Non-finite
 * values yield an empty string so callers can skip rendering them.
 */
export function formatDataLabel(value, opts, fallback) {
    if (!Number.isFinite(value))
        return "";
    return opts.format ? opts.format(value) : fallback(value);
}
//# sourceMappingURL=chartDataLabels.js.map