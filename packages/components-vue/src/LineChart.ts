import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  chartDataList,
  clampFraction,
  extendValueDomain,
  fixedLogTicks,
  fixedTicks,
  forecastRuns,
  formatTick,
  isNumeric,
  linearRegression,
  logTicks,
  niceTicks,
  overlayDataListItems,
  overlayToneClass,
  scaleLinear,
  smallestPositive,
  validLinearDomain,
  validLogDomain,
  type ChartBand,
  type ChartGoalLine,
  type ChartReferenceLine,
  type ChartScale,
  type ForecastRun,
} from "./chartScale.js";
import {
  annotationDataListItems,
  polygonPoints,
  resolveAnnotations,
  type ChartAnnotation,
} from "./chartAnnotations.js";

export type LineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type LineChartDatum = {
  x: number | string;
  y: number;
  /**
   * Marks the datum as a FORECAST point. Forecast points render with the
   * dedicated forecast tone and every segment touching a forecast point is
   * dashed — including the segment between the last actual point and the
   * first forecast point, so the line stays connected. Absent/false ⇒
   * rendering unchanged (additive).
   */
  forecast?: boolean;
};

export type LineChartProps = {
  data: LineChartDatum[];
  width?: number;
  height?: number;
  tone?: LineChartTone;
  smooth?: boolean;
  area?: boolean;
  label: string;
  /** Reference lines (default `axis: "y"` → horizontal at `value`). */
  referenceLines?: ChartReferenceLine[];
  /** Shaded value-axis bands between `from`..`to`. */
  bands?: ChartBand[];
  /** A single goal line, emphasised above the data. */
  goalLine?: ChartGoalLine;
  /** Least-squares trend line over the data points. */
  trend?: boolean;
  /**
   * Annotation overlay in DATA space (points, labels, axis lines, regions,
   * polygons). Resolved to pixels via the chart's scales and drawn in a
   * dedicated `<g class="st-lineChart__annotations">` — regions behind the
   * series, every other kind above it. Additive: absent ⇒ unchanged.
   */
  annotations?: ChartAnnotation[];
  /**
   * Fixed value-axis (y) domain `[min, max]`. When provided (and finite,
   * min<max) the y scale uses it instead of the data-derived range. Invalid or
   * absent → auto range (unchanged).
   */
  domain?: [number, number];
  /**
   * Value-axis scale. `"linear"` (default) is unchanged. `"log"` switches the
   * y axis to base-10 logarithmic — values `<= 0` are ignored for domain/ticks
   * and clamped to the lowest tick when positioned.
   */
  scale?: ChartScale;
  /** Inverts the value (y) axis. Default false. */
  invertAxis?: boolean;
  /**
   * Toggles the legend if the chart has one. LineChart is single-series and has
   * no legend surface; accepted for parity and otherwise ignored.
   */
  showLegend?: boolean;
  class?: string;
};

const MARGIN = CHART_MARGIN;

export const LineChart = defineComponent({
  name: "LineChart",
  props: {
    data: { type: Array as () => LineChartDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    tone: { type: String as () => LineChartTone, default: "category1" },
    smooth: { type: Boolean, default: false },
    area: { type: Boolean, default: false },
    label: { type: String, required: true },
    referenceLines: { type: Array as () => ChartReferenceLine[], default: undefined },
    bands: { type: Array as () => ChartBand[], default: undefined },
    goalLine: { type: Object as () => ChartGoalLine, default: undefined },
    trend: { type: Boolean, default: false },
    annotations: { type: Array as () => ChartAnnotation[], default: undefined },
    domain: { type: Array as unknown as () => [number, number], default: undefined },
    scale: { type: String as () => ChartScale, default: "linear" },
    invertAxis: { type: Boolean, default: false },
    showLegend: { type: Boolean, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);

    function handleLeave() {
      hoveredIndex.value = null;
    }
    function handleVisualPointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hoveredIndex.value = null;
        return;
      }
      const index = Number(target.getAttribute("data-chart-index"));
      hoveredIndex.value = Number.isInteger(index) ? index : null;
    }

    return () => {
      const width = props.width ?? 480;
      const height = props.height ?? 240;
      const tone = props.tone ?? "category1";
      const smooth = props.smooth ?? false;
      const area = props.area ?? false;
      const label = props.label;
      const data = props.data;
      const referenceLines = props.referenceLines;
      const bands = props.bands;
      // A valid goal line needs a finite value; otherwise it is ignored.
      const goal = props.goalLine && Number.isFinite(props.goalLine.value) ? props.goalLine : null;
      const trend = props.trend ?? false;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      let xDomain:
        | { kind: "ordinal"; values: (number | string)[] }
        | { kind: "numeric"; min: number; max: number };
      if (data.length === 0) {
        xDomain = { kind: "ordinal", values: [] };
      } else if (data.every((d) => isNumeric(d.x))) {
        const xs = data.map((d) => d.x as number);
        xDomain = { kind: "numeric", min: Math.min(...xs), max: Math.max(...xs) };
      } else {
        xDomain = { kind: "ordinal", values: data.map((d) => d.x) };
      }

      const isLog = props.scale === "log";
      const invertAxis = props.invertAxis ?? false;
      const domain = props.domain;
      const validDomain = isLog ? validLogDomain(domain) : validLinearDomain(domain);

      let yTicks: number[];
      const ys = data.map((d) => d.y).filter((y) => Number.isFinite(y));
      if (isLog) {
        const posOverlays = [
          ...(referenceLines ?? []).filter((r) => (r.axis ?? "y") === "y").map((r) => r.value),
          ...(bands ?? []).flatMap((b) => [b.from, b.to]),
          ...(goal ? [goal.value] : []),
        ];
        let lo: number;
        let hi: number;
        if (validDomain) {
          lo = validDomain[0];
          hi = validDomain[1];
        } else {
          lo = smallestPositive(...ys, ...posOverlays);
          hi = Math.max(lo, ...ys.filter((y) => y > 0), ...posOverlays.filter((v) => v > 0));
        }
        yTicks = validDomain ? fixedLogTicks(lo, hi) : logTicks(lo, hi);
      } else if (validDomain) {
        yTicks = fixedTicks(validDomain[0], validDomain[1], 5);
      } else if (ys.length === 0 && !referenceLines?.length && !bands?.length && !goal) {
        yTicks = [0];
      } else {
        let yMin = ys.length ? Math.min(...ys) : 0;
        let yMax = ys.length ? Math.max(...ys) : 0;
        // Fold overlay values into the domain so they never fall outside the plot.
        [yMin, yMax] = extendValueDomain(yMin, yMax, { referenceLines, bands, goalLine: goal });
        const padded = (yMax - yMin) * 0.08 || Math.max(Math.abs(yMax), 1) * 0.1;
        yTicks = niceTicks(yMin - padded, yMax + padded, 5);
      }
      const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

      // Maps a y value to a fraction in [0,1] (0 = yDomain.min, 1 = yDomain.max),
      // honouring log scale + axis inversion. Linear + no invert is unchanged.
      const valueFraction = (v: number) => {
        let f: number;
        if (isLog) {
          const lo = Math.log10(yDomain.min);
          const hi = Math.log10(yDomain.max);
          const clamped = v > 0 ? v : yDomain.min;
          f = hi === lo ? 0 : (Math.log10(clamped) - lo) / (hi - lo);
        } else {
          f = yDomain.max === yDomain.min ? 0 : (v - yDomain.min) / (yDomain.max - yDomain.min);
        }
        return clampFraction(invertAxis ? 1 - f : f);
      };

      type Point = { x: number; y: number; datum: LineChartDatum; index: number };
      let points: Point[] = [];
      if (data.length !== 0) {
        points = data.map((d, i) => {
          let x: number;
          if (xDomain.kind === "numeric") {
            x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
          } else {
            const denom = Math.max(data.length - 1, 1);
            x = data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
          }
          const y = plotHeight * (1 - valueFraction(d.y));
          return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
        });
      }

      // --- Analytical overlays -----------------------------------------------
      const valueToY = (v: number) => MARGIN.top + plotHeight * (1 - valueFraction(v));
      const dataValueToX = (v: number) =>
        xDomain.kind === "numeric"
          ? MARGIN.left + scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth)
          : null;

      const bandRects = (bands ?? [])
        .filter((b) => Number.isFinite(b.from) && Number.isFinite(b.to))
        .map((b, i) => {
          const y1 = valueToY(b.from);
          const y2 = valueToY(b.to);
          return {
            key: i,
            x: MARGIN.left,
            y: Math.min(y1, y2),
            width: plotWidth,
            height: Math.max(Math.abs(y2 - y1), 0.5),
            label: b.label,
            tone: b.tone,
          };
        });

      type Ref = { key: number; axis: "x" | "y"; x1: number; x2: number; y1: number; y2: number; label?: string; tone?: ChartReferenceLine["tone"] };
      const refLines: Ref[] = [];
      (referenceLines ?? [])
        .filter((r) => Number.isFinite(r.value))
        .forEach((r, i) => {
          const axis = r.axis ?? "y";
          if (axis === "x") {
            const x = dataValueToX(r.value);
            if (x === null) return;
            refLines.push({ key: i, axis, x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + plotHeight, label: r.label, tone: r.tone });
          } else {
            const y = valueToY(r.value);
            refLines.push({ key: i, axis, x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: y, y2: y, label: r.label, tone: r.tone });
          }
        });

      const goalGeom = goal
        ? { y: valueToY(goal.value), label: goal.label, value: goal.value }
        : null;

      const trendModel =
        trend && xDomain.kind === "numeric"
          ? linearRegression(data.map((d) => ({ x: d.x as number, y: d.y })))
          : null;
      const trendLine =
        trendModel && xDomain.kind === "numeric"
          ? {
              x1: MARGIN.left + scaleLinear(trendModel.minX, xDomain.min, xDomain.max, 0, plotWidth),
              y1: valueToY(trendModel.slope * trendModel.minX + trendModel.intercept),
              x2: MARGIN.left + scaleLinear(trendModel.maxX, xDomain.min, xDomain.max, 0, plotWidth),
              y2: valueToY(trendModel.slope * trendModel.maxX + trendModel.intercept),
            }
          : null;

      // --- Annotation overlay -------------------------------------------------
      // Data-space annotations resolved to absolute pixels via the chart scales.
      // `xScale` honours the ordinal/numeric x domain (a category matches by
      // equality, a numeric value must sit inside the domain); `yScale` reuses
      // the value fraction. Out-of-domain coordinates yield `null` → the
      // resolver drops them, so an annotation never escapes the plot.
      const ordinalIndex = (v: number | string) => {
        if (xDomain.kind !== "ordinal") return null;
        const i = data.findIndex((d) => d.x === v);
        if (i < 0) return null;
        const denom = Math.max(data.length - 1, 1);
        return data.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
      };
      const annotationXScale = (v: number | string): number | null => {
        if (xDomain.kind === "numeric") {
          if (typeof v !== "number" || !Number.isFinite(v)) return null;
          if (v < xDomain.min || v > xDomain.max) return null;
          return scaleLinear(v, xDomain.min, xDomain.max, 0, plotWidth);
        }
        return ordinalIndex(v);
      };
      const annotationYScale = (v: number): number | null => {
        if (!Number.isFinite(v)) return null;
        return plotHeight * (1 - valueFraction(v));
      };
      const resolvedAnnotations = resolveAnnotations(props.annotations, {
        xScale: annotationXScale,
        yScale: annotationYScale,
        plotLeft: MARGIN.left,
        plotTop: MARGIN.top,
        plotWidth,
        plotHeight,
      });
      const annotationRegions = resolvedAnnotations.filter((a) => a.kind === "region");
      const annotationAbove = resolvedAnnotations.filter((a) => a.kind !== "region");

      // --- Forecast segments --------------------------------------------------
      // A datum with `forecast: true` renders as a forecast point: its dot
      // takes the forecast tone and every segment touching a forecast point is
      // dashed, so the actual→forecast transition stays connected. Without any
      // forecast datum the single solid path below is identical to before
      // (additive).
      const forecastFlags = data.map((d) => d.forecast === true);
      const hasForecast = forecastFlags.some(Boolean);

      const dataValueItems = [
        ...data.map((d, i) => (forecastFlags[i] ? `${d.x}: ${d.y} (prévision)` : `${d.x}: ${d.y}`)),
        ...overlayDataListItems({ referenceLines, bands, goalLine: goal, trend: trendModel }),
        ...annotationDataListItems(props.annotations),
      ];

      // Full-series path (area fill always covers the whole series).
      const fullLinePath = points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points);

      // Solid (actual) + dashed (forecast) sub-paths. Without any forecast
      // datum the solid list is exactly [fullLinePath] — the previous single path.
      const segmentPath = (run: ForecastRun) => {
        const seg = points.slice(run.start, run.end + 1);
        return smooth ? buildSmoothPath(seg) : buildLinearPath(seg);
      };
      const runs = hasForecast ? forecastRuns(forecastFlags) : [];
      const solidPaths = hasForecast
        ? runs.filter((r) => !r.forecast).map(segmentPath)
        : fullLinePath
          ? [fullLinePath]
          : [];
      const forecastPaths = runs.filter((r) => r.forecast).map(segmentPath);

      let areaPath = "";
      if (area && points.length !== 0) {
        const base = MARGIN.top + plotHeight;
        const first = points[0];
        const last = points[points.length - 1];
        areaPath = `${fullLinePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
      }

      const gridLines = yTicks.map((tick) => ({
        value: tick,
        y: MARGIN.top + plotHeight * (1 - valueFraction(tick)),
      }));

      let xTickEntries: { x: number; label: string }[] = [];
      if (data.length !== 0) {
        if (xDomain.kind === "ordinal") {
          xTickEntries = points.map((p, i) => ({ x: p.x, label: String(data[i].x) }));
        } else {
          const target = Math.min(5, data.length);
          const stride = Math.max(1, Math.round((data.length - 1) / (target - 1 || 1)));
          for (let i = 0; i < data.length; i += stride) {
            xTickEntries.push({ x: points[i].x, label: String(data[i].x) });
          }
          const lastIdx = data.length - 1;
          if (xTickEntries[xTickEntries.length - 1]?.label !== String(data[lastIdx].x)) {
            xTickEntries.push({ x: points[lastIdx].x, label: String(data[lastIdx].x) });
          }
        }
      }

      const gridChildren: ReturnType<typeof h>[] = [];
      for (const g of gridLines) {
        gridChildren.push(
          h("line", { key: `g${g.value}`, class: "st-lineChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: g.y, y2: g.y }),
          h(
            "text",
            { key: `t${g.value}`, class: "st-lineChart__tickLabel", x: MARGIN.left - 6, y: g.y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(g.value),
          ),
        );
      }

      const xLabels = xTickEntries.map((tick, i) =>
        h(
          "text",
          { key: `x${i}`, class: "st-lineChart__tickLabel", x: tick.x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
          tick.label,
        ),
      );

      const dots = points.map((p) =>
        h("circle", {
          key: p.index,
          class: classNames("st-lineChart__dot", forecastFlags[p.index] && "st-lineChart__dot--forecast"),
          cx: p.x,
          cy: p.y,
          r: "4",
          "data-chart-index": p.index,
        }),
      );

      // Overlay vnodes — bands + reference lines + trend below the data; the
      // goal line is rendered above for emphasis.
      const belowOverlays: ReturnType<typeof h>[] = [];
      for (const b of bandRects) {
        belowOverlays.push(
          h("rect", {
            key: `band${b.key}`,
            class: classNames("st-lineChart__band", overlayToneClass("st-lineChart__band", b.tone)),
            x: b.x,
            y: b.y,
            width: b.width,
            height: b.height,
          }),
        );
        if (b.label) {
          belowOverlays.push(
            h("text", { key: `bandL${b.key}`, class: "st-lineChart__overlayLabel", x: b.x + 4, y: b.y + 11 }, b.label),
          );
        }
      }
      for (const r of refLines) {
        belowOverlays.push(
          h("line", {
            key: `ref${r.key}`,
            class: classNames("st-lineChart__refLine", overlayToneClass("st-lineChart__refLine", r.tone)),
            x1: r.x1,
            x2: r.x2,
            y1: r.y1,
            y2: r.y2,
          }),
        );
        if (r.label) {
          belowOverlays.push(
            h(
              "text",
              {
                key: `refL${r.key}`,
                class: "st-lineChart__overlayLabel",
                x: r.axis === "x" ? r.x1 + 4 : MARGIN.left + plotWidth - 4,
                y: r.axis === "x" ? MARGIN.top + 11 : r.y1 - 4,
                "text-anchor": r.axis === "x" ? "start" : "end",
              },
              r.label,
            ),
          );
        }
      }
      if (trendLine) {
        belowOverlays.push(
          h("line", { class: "st-lineChart__trend", x1: trendLine.x1, y1: trendLine.y1, x2: trendLine.x2, y2: trendLine.y2 }),
        );
      }

      const goalOverlays: ReturnType<typeof h>[] = [];
      if (goalGeom) {
        goalOverlays.push(
          h("line", { class: "st-lineChart__goalLine", x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: goalGeom.y, y2: goalGeom.y }),
          h(
            "text",
            { class: "st-lineChart__goalLabel", x: MARGIN.left + plotWidth - 4, y: goalGeom.y - 4, "text-anchor": "end" },
            goalGeom.label ?? `Objectif ${goalGeom.value}`,
          ),
        );
      }

      // Annotation regions sit BEHIND the series (filled bands).
      const annotationRegionGroup =
        annotationRegions.length > 0
          ? h(
              "g",
              { class: "st-lineChart__annotations st-lineChart__annotations--behind" },
              annotationRegions.flatMap((a) => {
                if (a.kind !== "region") return [];
                const nodes: ReturnType<typeof h>[] = [
                  h("rect", { key: `ann-region-${a.key}`, class: "st-lineChart__annotationRegion", x: a.x, y: a.y, width: a.width, height: a.height }),
                ];
                if (a.label) {
                  nodes.push(
                    h("text", { key: `ann-region-label-${a.key}`, class: "st-lineChart__annotationLabel", x: a.x + 4, y: a.y + 11 }, a.label),
                  );
                }
                return nodes;
              }),
            )
          : null;

      // Annotations ABOVE the series: lines, shapes, points, labels.
      const annotationAboveGroup =
        annotationAbove.length > 0
          ? h(
              "g",
              { class: "st-lineChart__annotations st-lineChart__annotations--above" },
              annotationAbove.flatMap((a) => {
                if (a.kind === "line") {
                  const nodes: ReturnType<typeof h>[] = [
                    h("line", { key: `ann-line-${a.key}`, class: "st-lineChart__annotationLine", x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2 }),
                  ];
                  if (a.label) {
                    nodes.push(
                      h(
                        "text",
                        {
                          key: `ann-line-label-${a.key}`,
                          class: "st-lineChart__annotationLabel",
                          x: a.axis === "x" ? a.x1 + 4 : MARGIN.left + plotWidth - 4,
                          y: a.axis === "x" ? MARGIN.top + 11 : a.y1 - 4,
                          "text-anchor": a.axis === "x" ? "start" : "end",
                        },
                        a.label,
                      ),
                    );
                  }
                  return nodes;
                }
                if (a.kind === "shape") {
                  const nodes: ReturnType<typeof h>[] = [
                    h("polygon", { key: `ann-shape-${a.key}`, class: "st-lineChart__annotationShape", points: polygonPoints(a.points) }),
                  ];
                  if (a.label) {
                    nodes.push(
                      h("text", { key: `ann-shape-label-${a.key}`, class: "st-lineChart__annotationLabel", x: a.labelX, y: a.labelY, "text-anchor": "middle" }, a.label),
                    );
                  }
                  return nodes;
                }
                if (a.kind === "point") {
                  const nodes: ReturnType<typeof h>[] = [
                    h("circle", { key: `ann-point-${a.key}`, class: "st-lineChart__annotationPoint", cx: a.x, cy: a.y, r: "4.5" }),
                  ];
                  if (a.label) {
                    nodes.push(
                      h("text", { key: `ann-point-label-${a.key}`, class: "st-lineChart__annotationLabel", x: a.x, y: a.y - 8, "text-anchor": "middle" }, a.label),
                    );
                  }
                  return nodes;
                }
                return [
                  h("text", { key: `ann-label-${a.key}`, class: "st-lineChart__annotationText", x: a.x, y: a.y, "text-anchor": a.anchor }, a.text),
                ];
              }),
            )
          : null;

      const svgChildren: ReturnType<typeof h>[] = [
        ...gridChildren,
        h("line", { class: "st-lineChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-lineChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        ...xLabels,
        ...belowOverlays,
      ];
      if (annotationRegionGroup) {
        svgChildren.push(annotationRegionGroup);
      }
      if (area && areaPath) {
        svgChildren.push(h("path", { class: "st-lineChart__area", d: areaPath }));
      }
      for (const [i, d] of solidPaths.entries()) {
        svgChildren.push(
          h("path", {
            key: `line-${i}`,
            class: "st-lineChart__line",
            d,
            fill: "none",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          }),
        );
      }
      for (const [i, d] of forecastPaths.entries()) {
        svgChildren.push(
          h("path", {
            key: `forecast-${i}`,
            class: "st-lineChart__line st-lineChart__line--forecast",
            d,
            fill: "none",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          }),
        );
      }
      svgChildren.push(...dots, ...goalOverlays);
      if (annotationAboveGroup) {
        svgChildren.push(annotationAboveGroup);
      }

      const hoveredPoint = hoveredIndex.value !== null ? points[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-lineChart", `st-lineChart--${tone}`, props.class) }, [
        h(
          "div",
          {
            class: "st-lineChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handleVisualPointerMove,
            onPointerleave: handleLeave,
          },
          [
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
          ],
        ),
        chartDataList(label, dataValueItems),
        hoveredPoint
          ? h(
              "div",
              {
                class: "st-lineChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredPoint.x / width) * 100}%; top: ${(hoveredPoint.y / height) * 100}%`,
              },
              [
                h("span", { class: "st-lineChart__tooltipLabel" }, String(hoveredPoint.datum.x)),
                h("span", { class: "st-lineChart__tooltipValue" }, String(hoveredPoint.datum.y)),
              ],
            )
          : null,
      ]);
    };
  },
});
