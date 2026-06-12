import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";
import { formatDataLabel, normalizeDataLabels, type DataLabelsProp } from "./chartDataLabels.js";
import { resolveActiveIndex } from "./chartCrosshair.js";
import { datapointAriaLabel, datapointNavAction, rovingTabIndex } from "./chartKeyboardNav.js";

export type ScatterPlotTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ScatterPlotDatum = {
  x: number;
  y: number;
  label?: string;
  tone?: ScatterPlotTone;
  /**
   * Per-datum radius, clamped to a sane maximum (32). Non-finite or
   * negative ⇒ falls back to the global `radius`.
   */
  r?: number;
};

/** Cluster centroid marker (ring + cross), drawn above the data points. */
export type ScatterPlotCentroid = {
  x: number;
  y: number;
  tone?: ScatterPlotTone;
  label?: string;
};

export type ScatterPlotProps = {
  data: ScatterPlotDatum[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  radius?: number;
  /**
   * Cluster centroid markers (ring + cross), drawn above the points. Their
   * coordinates are folded into the axis domain. Non-finite x/y are skipped.
   */
  centroids?: ScatterPlotCentroid[];
  /**
   * Annotation overlay in DATA space (points, labels, axis lines, regions,
   * polygons). Both axes are continuous (linear). Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Per-point value labels. `false`/absent (default) → none. `true` → each
   * point's value (the datum `label` wins when present). Object → `format` /
   * `position`. Default position is `top`. Labels are `aria-hidden`.
   */
  dataLabels?: DataLabelsProp;
  /**
   * CONTROLLED synchronised hover key (FR-3). A point's key is its `label` when
   * present, otherwise `"x,y"`. Absent (`undefined`) keeps the uncontrolled
   * behaviour.
   */
  hoverKey?: string | null;
  /** Emitted on hover (the key) / leave (`null`); fired even while controlled. */
  onHoverKeyChange?: (key: string | null) => void;
  /** FR-5 — roving-tabindex keyboard navigation of the data points. */
  keyboardNav?: boolean;
  /** Emitted on Enter/Space select (the key) / Escape (`null`); enables nav. */
  onSelectKey?: (key: string | null) => void;
  label: string;
  class?: string;
};

const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 } as const;

// Sane upper bound for a per-datum radius (keeps oversized bubbles inside
// the plot); non-finite/negative values fall back to the global radius.
const MAX_POINT_RADIUS = 32;

const TONES: ScatterPlotTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

/** Stable hover/selection key of a point: its label, else `"x,y"`. */
function keyForPoint(d: ScatterPlotDatum): string {
  return d.label ?? `${d.x},${d.y}`;
}

export const ScatterPlot = defineComponent({
  name: "ScatterPlot",
  props: {
    data: { type: Array as () => ScatterPlotDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
    xLabel: { type: String, default: undefined },
    yLabel: { type: String, default: undefined },
    radius: { type: Number, default: 5 },
    centroids: { type: Array as () => ScatterPlotCentroid[], default: undefined },
    annotations: { type: Array as () => ChartAnnotation[], default: undefined },
    dataLabels: { type: [Boolean, Object] as unknown as () => DataLabelsProp, default: undefined },
    hoverKey: { type: [String, null] as unknown as () => string | null, default: undefined },
    onHoverKeyChange: { type: Function as unknown as () => (key: string | null) => void, default: undefined },
    keyboardNav: { type: Boolean, default: undefined },
    onSelectKey: { type: Function as unknown as () => (key: string | null) => void, default: undefined },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);
    // FR-5 — roving keyboard focus over the data points (separate from hover).
    const focusedIndex = ref<number>(-1);
    const datapointRefs: Array<SVGRectElement | null> = [];

    function emitHoverKey(index: number | null, hoverKeys: string[]) {
      props.onHoverKeyChange?.(index == null ? null : hoverKeys[index] ?? null);
    }

    return () => {
      const width = props.width ?? 480;
      const height = props.height ?? 280;
      const radius = props.radius ?? 5;
      const label = props.label;
      const data = props.data;

      // Centroids guarded once: non-finite coordinates are skipped entirely.
      const validCentroids = (props.centroids ?? []).filter((c) => Number.isFinite(c.x) && Number.isFinite(c.y));

      // Centroid coordinates are folded into the domain so markers always sit
      // inside the plot (and a centroids-only chart still gets a real scale).
      const xs = [...data.map((d) => d.x), ...validCentroids.map((c) => c.x)].filter(Number.isFinite);
      const ys = [...data.map((d) => d.y), ...validCentroids.map((c) => c.y)].filter(Number.isFinite);
      const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
      const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
      const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
      const xMin = xTicks[0];
      const xMax = xTicks[xTicks.length - 1];
      const yMin = yTicks[0];
      const yMax = yTicks[yTicks.length - 1];

      const points = data.map((d, i) => ({
        cx: MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW),
        cy: MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0),
        r: typeof d.r === "number" && Number.isFinite(d.r) && d.r >= 0 ? Math.min(d.r, MAX_POINT_RADIUS) : radius,
        datum: d,
        index: i,
        tone: (d.tone ?? TONES[i % TONES.length]) as ScatterPlotTone,
      }));

      const centroidMarks = validCentroids.map((c, i) => ({
        cx: MARGIN.left + scaleLinear(c.x, xMin, xMax, 0, plotW),
        cy: MARGIN.top + scaleLinear(c.y, yMin, yMax, plotH, 0),
        tone: (c.tone ?? TONES[i % TONES.length]) as ScatterPlotTone,
        label: c.label,
      }));

      // --- Annotation overlay -------------------------------------------------
      // Both axes continuous: linear `xScale`/`yScale`, out-of-domain ⇒ null.
      const annotationXScale = (v: number | string): number | null => {
        if (typeof v !== "number" || !Number.isFinite(v)) return null;
        if (v < xMin || v > xMax) return null;
        return scaleLinear(v, xMin, xMax, 0, plotW);
      };
      const annotationYScale = (v: number): number | null => {
        if (!Number.isFinite(v)) return null;
        if (v < yMin || v > yMax) return null;
        return scaleLinear(v, yMin, yMax, plotH, 0);
      };
      const resolvedAnnotations = resolveAnnotations(props.annotations, {
        xScale: annotationXScale,
        yScale: annotationYScale,
        plotLeft: MARGIN.left,
        plotTop: MARGIN.top,
        plotWidth: plotW,
        plotHeight: plotH,
      });
      const annotationRegions = resolvedAnnotations.filter((a) => a.kind === "region");
      const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== "region");

      // --- Data labels --------------------------------------------------------
      // One label per point. Default `top`. The datum `label` wins; else the y.
      const dataLabelOpts = normalizeDataLabels(props.dataLabels);
      const dataLabelItems = dataLabelOpts.enabled
        ? points.map((p) => {
            const text = p.datum.label ?? formatDataLabel(p.datum.y, dataLabelOpts, formatTick);
            const center = dataLabelOpts.position === "center" || dataLabelOpts.position === "inside";
            return {
              key: p.index,
              x: p.cx,
              y: center ? p.cy : p.cy - (p.r + 5),
              text,
              baseline: (center ? "middle" : "auto") as "middle" | "auto",
            };
          })
        : [];

      const dataValueItems = [
        ...data.map((d) => (d.label ? `${d.label}: x ${d.x}, y ${d.y}` : `x ${d.x}, y ${d.y}`)),
        ...validCentroids.map((c) =>
          c.label ? `Centroïde ${c.label}: (${c.x}, ${c.y})` : `Centroïde: (${c.x}, ${c.y})`,
        ),
        ...annotationDataListItems(props.annotations),
      ];

      // Stable key per point (FR-3): `label` else `"x,y"`.
      const hoverKeys = data.map((d) => keyForPoint(d));

      function handleLeave() {
        hoveredIndex.value = null;
        emitHoverKey(null, hoverKeys);
      }
      function handleVisualPointerMove(event: PointerEvent) {
        const target = event.target;
        if (!(target instanceof Element)) {
          hoveredIndex.value = null;
          emitHoverKey(null, hoverKeys);
          return;
        }
        const raw = Number(target.getAttribute("data-chart-index"));
        const index = Number.isInteger(raw) ? raw : null;
        hoveredIndex.value = index;
        emitHoverKey(index, hoverKeys);
      }

      // Index whose crosshair/tooltip is DISPLAYED.
      const activeIndex = resolveActiveIndex(props.hoverKey, hoveredIndex.value, hoverKeys);
      const hovered = activeIndex >= 0 ? points[activeIndex] : undefined;

      // --- Keyboard navigation (FR-5) ----------------------------------------
      const navEnabled = (props.keyboardNav === true || props.onSelectKey !== undefined) && points.length > 0;
      const NAV_HIT = 18;
      function focusDatum(index: number) {
        focusedIndex.value = index;
        datapointRefs[index]?.focus();
        emitHoverKey(index, hoverKeys);
      }
      function handleDatapointKeyDown(event: KeyboardEvent, index: number) {
        const action = datapointNavAction(event.key, index, points.length);
        if (!action) return;
        event.preventDefault();
        if (action.kind === "move") {
          focusDatum(action.index);
        } else if (action.kind === "select") {
          props.onSelectKey?.(hoverKeys[index] ?? null);
        } else {
          focusedIndex.value = -1;
          emitHoverKey(null, hoverKeys);
          props.onSelectKey?.(null);
          (event.currentTarget as SVGElement).blur();
        }
      }

      const svgChildren: ReturnType<typeof h>[] = [];
      for (const t of yTicks) {
        const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
        svgChildren.push(
          h("line", { key: `gy${t}`, class: "st-scatterPlot__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: y, y2: y }),
          h(
            "text",
            { key: `ty${t}`, class: "st-scatterPlot__tick", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(t),
          ),
        );
      }
      for (const t of xTicks) {
        const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
        svgChildren.push(
          h(
            "text",
            { key: `tx${t}`, class: "st-scatterPlot__tick", x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            formatTick(t),
          ),
        );
      }

      svgChildren.push(
        h("line", { class: "st-scatterPlot__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-scatterPlot__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
      );

      if (props.xLabel) {
        svgChildren.push(
          h(
            "text",
            { class: "st-scatterPlot__axisLabel", x: MARGIN.left + plotW / 2, y: height - 4, "text-anchor": "middle" },
            props.xLabel,
          ),
        );
      }
      if (props.yLabel) {
        svgChildren.push(
          h(
            "text",
            {
              class: "st-scatterPlot__axisLabel",
              x: 12,
              y: MARGIN.top + plotH / 2,
              "text-anchor": "middle",
              transform: `rotate(-90 12 ${MARGIN.top + plotH / 2})`,
            },
            props.yLabel,
          ),
        );
      }

      // Annotation regions sit BEHIND the points (filled bands).
      if (annotationRegions.length > 0) {
        const regionChildren: ReturnType<typeof h>[] = [];
        annotationRegions.forEach((a) => {
          if (a.kind !== "region") return;
          regionChildren.push(
            h("rect", { key: `ann-region-${a.key}`, class: "st-scatterPlot__annotationRegion", x: a.x, y: a.y, width: a.width, height: a.height }),
          );
          if (a.label) {
            regionChildren.push(
              h("text", { key: `ann-region-label-${a.key}`, class: "st-scatterPlot__annotationLabel", x: a.x + 4, y: a.y + 11 }, a.label),
            );
          }
        });
        svgChildren.push(h("g", { class: "st-scatterPlot__annotations st-scatterPlot__annotations--behind" }, regionChildren));
      }

      points.forEach((p, i) => {
        svgChildren.push(
          h("circle", {
            key: `p${i}`,
            class: classNames("st-scatterPlot__point", `st-scatterPlot__point--${p.tone}`),
            cx: p.cx,
            cy: p.cy,
            r: p.r,
            "data-chart-index": i,
          }),
        );
      });

      // cluster centroids — distinct ring + cross markers, above the points
      centroidMarks.forEach((c, i) => {
        svgChildren.push(
          h(
            "g",
            { key: `c${i}`, class: classNames("st-scatterPlot__centroid", `st-scatterPlot__centroid--${c.tone}`) },
            [
              h("circle", { class: "st-scatterPlot__centroidRing", cx: c.cx, cy: c.cy, r: "7" }),
              h("line", { class: "st-scatterPlot__centroidCross", x1: c.cx - 3.5, x2: c.cx + 3.5, y1: c.cy, y2: c.cy }),
              h("line", { class: "st-scatterPlot__centroidCross", x1: c.cx, x2: c.cx, y1: c.cy - 3.5, y2: c.cy + 3.5 }),
            ],
          ),
        );
      });

      // Annotations ABOVE the points: lines, shapes, points, labels.
      if (annotationAbove.length > 0) {
        const aboveChildren: ReturnType<typeof h>[] = [];
        annotationAbove.forEach((a) => {
          if (a.kind === "line") {
            aboveChildren.push(
              h("line", { key: `ann-line-${a.key}`, class: "st-scatterPlot__annotationLine", x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2 }),
            );
            if (a.label) {
              aboveChildren.push(
                h(
                  "text",
                  {
                    key: `ann-line-label-${a.key}`,
                    class: "st-scatterPlot__annotationLabel",
                    x: a.axis === "x" ? a.x1 + 4 : MARGIN.left + plotW - 4,
                    y: a.axis === "x" ? MARGIN.top + 11 : a.y1 - 4,
                    "text-anchor": a.axis === "x" ? "start" : "end",
                  },
                  a.label,
                ),
              );
            }
          } else if (a.kind === "shape") {
            aboveChildren.push(
              h("polygon", { key: `ann-shape-${a.key}`, class: "st-scatterPlot__annotationShape", points: polygonPoints(a.points) }),
            );
            if (a.label) {
              aboveChildren.push(
                h("text", { key: `ann-shape-label-${a.key}`, class: "st-scatterPlot__annotationLabel", x: a.labelX, y: a.labelY, "text-anchor": "middle" }, a.label),
              );
            }
          } else if (a.kind === "point") {
            aboveChildren.push(
              h("circle", { key: `ann-point-${a.key}`, class: "st-scatterPlot__annotationPoint", cx: a.x, cy: a.y, r: "4.5" }),
            );
            if (a.label) {
              aboveChildren.push(
                h("text", { key: `ann-point-label-${a.key}`, class: "st-scatterPlot__annotationLabel", x: a.x, y: a.y - 8, "text-anchor": "middle" }, a.label),
              );
            }
          } else {
            aboveChildren.push(
              h("text", { key: `ann-label-${a.key}`, class: "st-scatterPlot__annotationText", x: a.x, y: a.y, "text-anchor": a.anchor }, a.text),
            );
          }
        });
        svgChildren.push(h("g", { class: "st-scatterPlot__annotations st-scatterPlot__annotations--above" }, aboveChildren));
      }

      // Data labels — one value/label per point, drawn on top. aria-hidden.
      if (dataLabelItems.length > 0) {
        svgChildren.push(
          h(
            "g",
            { class: "st-scatterPlot__dataLabels", "aria-hidden": "true" },
            dataLabelItems.map((d) =>
              h(
                "text",
                { key: d.key, class: "st-scatterPlot__dataLabel", x: d.x, y: d.y, "text-anchor": "middle", "dominant-baseline": d.baseline },
                d.text,
              ),
            ),
          ),
        );
      }

      // Crosshair (FR-3) — tokenised CROSSED pair + marker at the active key.
      if (hovered) {
        svgChildren.push(
          h("g", { class: "st-scatterPlot__crosshair", "aria-hidden": "true" }, [
            h("line", { class: "st-scatterPlot__crosshairLine", x1: hovered.cx, x2: hovered.cx, y1: MARGIN.top, y2: MARGIN.top + plotH }),
            h("line", { class: "st-scatterPlot__crosshairLine", x1: MARGIN.left, x2: MARGIN.left + plotW, y1: hovered.cy, y2: hovered.cy }),
            h("circle", { class: "st-scatterPlot__crosshairMarker", cx: hovered.cx, cy: hovered.cy, r: "5" }),
          ]),
        );
      }

      const visualChildren: ReturnType<typeof h>[] = [
        h(
          "svg",
          {
            viewBox: `0 0 ${width} ${height}`,
            preserveAspectRatio: "xMidYMid meet",
            width: "100%",
            height: "100%",
            focusable: "false",
            "aria-hidden": "true",
          },
          svgChildren,
        ),
      ];

      // Keyboard navigation overlay (FR-5) — focusable transparent hit layer.
      if (navEnabled) {
        datapointRefs.length = points.length;
        visualChildren.push(
          h(
            "svg",
            {
              class: "st-scatterPlot__navLayer",
              viewBox: `0 0 ${width} ${height}`,
              preserveAspectRatio: "xMidYMid meet",
              width: "100%",
              height: "100%",
              role: "group",
              "aria-label": `${label} — points de données`,
            },
            points.map((p, i) =>
              h("rect", {
                key: `nav${p.index}`,
                ref: (el: unknown) => {
                  datapointRefs[i] = (el as SVGRectElement) ?? null;
                },
                class: "st-scatterPlot__navDatum",
                x: p.cx - NAV_HIT / 2,
                y: p.cy - NAV_HIT / 2,
                width: NAV_HIT,
                height: NAV_HIT,
                rx: "3",
                role: "img",
                tabindex: rovingTabIndex(i, focusedIndex.value, points.length),
                "aria-label": datapointAriaLabel(p.datum.label ?? `${p.datum.x}, ${p.datum.y}`, p.datum.y),
                onKeydown: (event: KeyboardEvent) => handleDatapointKeyDown(event, i),
                onFocus: () => {
                  focusedIndex.value = i;
                  emitHoverKey(i, hoverKeys);
                },
              }),
            ),
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-scatterPlot", props.class) }, [
        h(
          "div",
          {
            class: "st-scatterPlot__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handleVisualPointerMove,
            onPointerleave: handleLeave,
          },
          visualChildren,
        ),
        chartDataList(label, dataValueItems),
        hovered
          ? h(
              "div",
              {
                class: "st-scatterPlot__tooltip",
                role: "presentation",
                style: `left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`,
              },
              [
                hovered.datum.label ? h("span", { class: "st-scatterPlot__tooltipLabel" }, hovered.datum.label) : null,
                h("span", { class: "st-scatterPlot__tooltipValue" }, `x ${hovered.datum.x} · y ${hovered.datum.y}`),
              ],
            )
          : null,
      ]);
    };
  },
});
