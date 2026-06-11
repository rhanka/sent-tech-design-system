import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import {
  buildSmoothPath,
  CHART_MARGIN,
  chartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type AreaSplineRangeChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AreaSplineRangeChartDatum = {
  x: number | string;
  low: number;
  high: number;
};

export type AreaSplineRangeChartProps = {
  data: AreaSplineRangeChartDatum[];
  width?: number;
  height?: number;
  tone?: AreaSplineRangeChartTone;
  label: string;
  class?: string;
};

const MARGIN = CHART_MARGIN;

let gradientCounter = 0;

// Normalise a datum: finite low/high, ordered (lo <= hi).
function normalize(d: AreaSplineRangeChartDatum): { lo: number; hi: number } | null {
  if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
}

// Continue an existing path along `pts` WITHOUT a leading `M` (the band chains
// the smoothed high line then the smoothed reversed low line into one sub-path).
function continuePath(prefix: string, pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return prefix;
  const full = buildSmoothPath(pts);
  return `${prefix} L${full.slice(1)}`;
}

export const AreaSplineRangeChart = defineComponent({
  name: "AreaSplineRangeChart",
  props: {
    data: { type: Array as () => AreaSplineRangeChartDatum[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    tone: { type: String as () => AreaSplineRangeChartTone, default: "category1" },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);
    const gradientId = `st-areasplinerangechart-gradient-${(gradientCounter++).toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

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
      const label = props.label;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Valid data: finite low + high.
      const validData = (props.data ?? []).filter((d) => normalize(d) !== null);

      const dataValueItems = validData.map((d) => {
        const r = normalize(d)!;
        return `${d.x}: ${r.lo} – ${r.hi}`;
      });

      let xDomain:
        | { kind: "ordinal"; values: (number | string)[] }
        | { kind: "numeric"; min: number; max: number };
      if (validData.length === 0) {
        xDomain = { kind: "ordinal", values: [] };
      } else if (validData.every((d) => isNumeric(d.x))) {
        const xs = validData.map((d) => d.x as number);
        xDomain = { kind: "numeric", min: Math.min(...xs), max: Math.max(...xs) };
      } else {
        xDomain = { kind: "ordinal", values: validData.map((d) => d.x) };
      }

      let yTicks: number[];
      if (validData.length === 0) {
        yTicks = [0];
      } else {
        const lows = validData.map((d) => normalize(d)!.lo);
        const highs = validData.map((d) => normalize(d)!.hi);
        const yMin = Math.min(...lows);
        const yMax = Math.max(...highs);
        const padded = (yMax - yMin) * 0.08 || Math.max(Math.abs(yMax), 1) * 0.1;
        yTicks = niceTicks(yMin - padded, yMax + padded, 5);
      }
      const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

      type RangePoint = {
        x: number;
        yLow: number;
        yHigh: number;
        datum: AreaSplineRangeChartDatum;
        range: { lo: number; hi: number };
        index: number;
      };
      let points: RangePoint[] = [];
      if (validData.length !== 0) {
        points = validData.map((d, i) => {
          let x: number;
          if (xDomain.kind === "numeric") {
            x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
          } else {
            const denom = Math.max(validData.length - 1, 1);
            x = validData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
          }
          const r = normalize(d)!;
          const yLow = scaleLinear(r.lo, yDomain.min, yDomain.max, plotHeight, 0);
          const yHigh = scaleLinear(r.hi, yDomain.min, yDomain.max, plotHeight, 0);
          return {
            x: MARGIN.left + x,
            yLow: MARGIN.top + yLow,
            yHigh: MARGIN.top + yHigh,
            datum: d,
            range: r,
            index: i,
          };
        });
      }

      const highPts = points.map((p) => ({ x: p.x, y: p.yHigh }));
      const lowPts = points.map((p) => ({ x: p.x, y: p.yLow }));
      const highPath = points.length === 0 ? "" : buildSmoothPath(highPts);
      const lowPath = points.length === 0 ? "" : buildSmoothPath(lowPts);

      let areaPath = "";
      if (points.length !== 0) {
        const lowReversed = [...points].reverse().map((p) => ({ x: p.x, y: p.yLow }));
        areaPath = `${continuePath(highPath, lowReversed)} Z`;
      }

      const gridLines = yTicks.map((tick) => ({
        value: tick,
        y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
      }));

      let xTickEntries: { x: number; label: string }[] = [];
      if (validData.length !== 0) {
        if (xDomain.kind === "ordinal") {
          xTickEntries = points.map((p, i) => ({ x: p.x, label: String(validData[i].x) }));
        } else {
          const target = Math.min(5, validData.length);
          const stride = Math.max(1, Math.round((validData.length - 1) / (target - 1 || 1)));
          for (let i = 0; i < validData.length; i += stride) {
            xTickEntries.push({ x: points[i].x, label: String(validData[i].x) });
          }
          const lastIdx = validData.length - 1;
          if (xTickEntries[xTickEntries.length - 1]?.label !== String(validData[lastIdx].x)) {
            xTickEntries.push({ x: points[lastIdx].x, label: String(validData[lastIdx].x) });
          }
        }
      }

      const gridChildren: ReturnType<typeof h>[] = [];
      for (const g of gridLines) {
        gridChildren.push(
          h("line", { key: `g${g.value}`, class: "st-areaSplineRangeChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: g.y, y2: g.y }),
          h(
            "text",
            { key: `t${g.value}`, class: "st-areaSplineRangeChart__tickLabel", x: MARGIN.left - 6, y: g.y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(g.value),
          ),
        );
      }

      const xLabels = xTickEntries.map((tick, i) =>
        h(
          "text",
          { key: `x${i}`, class: "st-areaSplineRangeChart__tickLabel", x: tick.x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
          tick.label,
        ),
      );

      const dots: ReturnType<typeof h>[] = [];
      for (const p of points) {
        dots.push(
          h("circle", { key: `h${p.index}`, class: "st-areaSplineRangeChart__dot", cx: p.x, cy: p.yHigh, r: "3.5", "data-chart-index": p.index }),
          h("circle", { key: `l${p.index}`, class: "st-areaSplineRangeChart__dot", cx: p.x, cy: p.yLow, r: "3.5", "data-chart-index": p.index }),
        );
      }

      const svgChildren: ReturnType<typeof h>[] = [
        h("defs", {}, [
          h("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
            h("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": "0.32" }),
            h("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0.12" }),
          ]),
        ]),
        ...gridChildren,
        h("line", { class: "st-areaSplineRangeChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-areaSplineRangeChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        ...xLabels,
      ];
      if (areaPath) {
        svgChildren.push(h("path", { class: "st-areaSplineRangeChart__area", d: areaPath, fill: `url(#${gradientId})` }));
      }
      if (highPath) {
        svgChildren.push(
          h("path", { class: "st-areaSplineRangeChart__line st-areaSplineRangeChart__line--high", d: highPath, fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        );
      }
      if (lowPath) {
        svgChildren.push(
          h("path", { class: "st-areaSplineRangeChart__line st-areaSplineRangeChart__line--low", d: lowPath, fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        );
      }
      svgChildren.push(...dots);

      const hoveredPoint = hoveredIndex.value !== null ? points[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-areaSplineRangeChart", `st-areaSplineRangeChart--${tone}`, props.class) }, [
        h(
          "div",
          {
            class: "st-areaSplineRangeChart__visual",
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
                class: "st-areaSplineRangeChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredPoint.x / width) * 100}%; top: ${(hoveredPoint.yHigh / height) * 100}%`,
              },
              [
                h("span", { class: "st-areaSplineRangeChart__tooltipLabel" }, String(hoveredPoint.datum.x)),
                h("span", { class: "st-areaSplineRangeChart__tooltipValue" }, `${hoveredPoint.range.lo} – ${hoveredPoint.range.hi}`),
              ],
            )
          : null,
      ]);
    };
  },
});
