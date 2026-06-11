// --- Chart annotation layer (shared, framework-agnostic) -------------------
//
// A declarative overlay of annotations expressed in DATA space (x / y values),
// resolved here to framework-agnostic PIXEL primitives. The model is the
// `ChartAnnotation` discriminated union provided by dataviz-core; the resolver
// is pure and identical across react / vue / svelte so the three renderers stay
// in strict parity. Purely additive: an absent/empty `annotations` prop yields
// no primitives and no a11y items.

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
export type ChartAnnotation =
  | { kind: "point"; x: number | string; y: number; label?: string; marker?: ChartAnnotationMarker }
  | { kind: "label"; x: number | string; y: number; text: string; anchor?: "start" | "middle" | "end" }
  | { kind: "line"; axis: "x" | "y"; value: number; label?: string }
  | { kind: "region"; axis: "x" | "y"; from: number; to: number; label?: string }
  | { kind: "shape"; points: { x: number | string; y: number }[]; label?: string };

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
export type ResolvedAnnotation =
  | { kind: "region"; key: number; axis: "x" | "y"; x: number; y: number; width: number; height: number; label?: string }
  | { kind: "line"; key: number; axis: "x" | "y"; x1: number; y1: number; x2: number; y2: number; label?: string }
  | { kind: "shape"; key: number; points: { x: number; y: number }[]; label?: string; labelX: number; labelY: number }
  | { kind: "point"; key: number; x: number; y: number; label?: string; marker: ChartAnnotationMarker }
  | { kind: "label"; key: number; x: number; y: number; text: string; anchor: "start" | "middle" | "end" };

const finite = (v: number | undefined | null): v is number => typeof v === "number" && Number.isFinite(v);

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
export function resolveAnnotations(
  annotations: ReadonlyArray<ChartAnnotation> | undefined,
  ctx: AnnotationScaleContext,
): ResolvedAnnotation[] {
  if (!annotations || annotations.length === 0) return [];
  const { xScale, yScale, plotLeft, plotTop, plotWidth, plotHeight } = ctx;
  const out: ResolvedAnnotation[] = [];

  annotations.forEach((a, key) => {
    switch (a.kind) {
      case "region": {
        if (!finite(a.from) || !finite(a.to)) return;
        if (a.axis === "x") {
          const p1 = xScale(a.from);
          const p2 = xScale(a.to);
          if (p1 === null || p2 === null) return;
          const x = plotLeft + Math.min(p1, p2);
          out.push({ kind: "region", key, axis: "x", x, y: plotTop, width: Math.max(Math.abs(p2 - p1), 0.5), height: plotHeight, label: a.label });
        } else {
          const p1 = yScale(a.from);
          const p2 = yScale(a.to);
          if (p1 === null || p2 === null) return;
          const y = plotTop + Math.min(p1, p2);
          out.push({ kind: "region", key, axis: "y", x: plotLeft, y, width: plotWidth, height: Math.max(Math.abs(p2 - p1), 0.5), label: a.label });
        }
        return;
      }
      case "line": {
        if (!finite(a.value)) return;
        if (a.axis === "x") {
          const p = xScale(a.value);
          if (p === null) return;
          const x = plotLeft + p;
          out.push({ kind: "line", key, axis: "x", x1: x, y1: plotTop, x2: x, y2: plotTop + plotHeight, label: a.label });
        } else {
          const p = yScale(a.value);
          if (p === null) return;
          const y = plotTop + p;
          out.push({ kind: "line", key, axis: "y", x1: plotLeft, y1: y, x2: plotLeft + plotWidth, y2: y, label: a.label });
        }
        return;
      }
      case "shape": {
        if (!a.points || a.points.length < 2) return;
        const pts: { x: number; y: number }[] = [];
        for (const p of a.points) {
          const px = xScale(p.x);
          const py = yScale(p.y);
          if (px === null || py === null) return; // a missing vertex invalidates the polygon
          pts.push({ x: plotLeft + px, y: plotTop + py });
        }
        const labelX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const labelY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        out.push({ kind: "shape", key, points: pts, label: a.label, labelX, labelY });
        return;
      }
      case "point": {
        const px = xScale(a.x);
        const py = yScale(a.y);
        if (px === null || py === null) return;
        out.push({ kind: "point", key, x: plotLeft + px, y: plotTop + py, label: a.label, marker: a.marker ?? "circle" });
        return;
      }
      case "label": {
        const px = xScale(a.x);
        const py = yScale(a.y);
        if (px === null || py === null) return;
        out.push({ kind: "label", key, x: plotLeft + px, y: plotTop + py, text: a.text, anchor: a.anchor ?? "middle" });
        return;
      }
    }
  });

  return out;
}

/**
 * Screen-reader descriptions of the annotations, appended after the data values
 * (and any analytical overlays) in the ChartDataList. Each item is
 * `Annotation: <label/text>`; annotations without a label/text are skipped
 * (nothing meaningful to announce). Empty when no annotation is present.
 */
export function annotationDataListItems(annotations: ReadonlyArray<ChartAnnotation> | undefined): string[] {
  if (!annotations || annotations.length === 0) return [];
  const items: string[] = [];
  for (const a of annotations) {
    const text = a.kind === "label" ? a.text : a.label;
    if (text) items.push(`Annotation: ${text}`);
  }
  return items;
}

/** SVG polygon `points` attribute from resolved pixel vertices. */
export function polygonPoints(points: ReadonlyArray<{ x: number; y: number }>): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}
