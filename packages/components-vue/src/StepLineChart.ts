import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import {
  CHART_MARGIN,
  chartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

export type StepLineChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type StepLineChartDatum = {
  x: number | string;
  y: number;
};

export type StepLineChartProps = {
  data: StepLineChartDatum[];
  width?: number;
  height?: number;
  tone?: StepLineChartTone;
  label: string;
  class?: string;
};

const MARGIN = CHART_MARGIN;

function isValidDatum(datum: StepLineChartDatum): boolean {
  return Number.isFinite(datum.y) && (typeof datum.x === "string" || isNumeric(datum.x));
}

function buildStepPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  let path = `M${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    const point = pts[i];
    path += ` H${point.x.toFixed(2)} V${point.y.toFixed(2)}`;
  }
  return path;
}

export const StepLineChart = defineComponent({
  name: "StepLineChart",
  props: {
    data: { type: Array as () => StepLineChartDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    tone: { type: String as () => StepLineChartTone, default: "category1" },
    label: { type: String, required: true },
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
      const label = props.label;
      const safeData = props.data.filter(isValidDatum);
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      let xDomain:
        | { kind: "ordinal"; values: (number | string)[] }
        | { kind: "numeric"; min: number; max: number };
      if (safeData.length === 0) {
        xDomain = { kind: "ordinal", values: [] };
      } else if (safeData.every((d) => isNumeric(d.x))) {
        const xs = safeData.map((d) => d.x as number);
        xDomain = { kind: "numeric", min: Math.min(...xs), max: Math.max(...xs) };
      } else {
        xDomain = { kind: "ordinal", values: safeData.map((d) => d.x) };
      }

      const ys = safeData.map((d) => d.y);
      let yTicks: number[];
      if (ys.length === 0) {
        yTicks = [0];
      } else {
        const minRaw = Math.min(...ys);
        const maxRaw = Math.max(...ys);
        const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
        yTicks = niceTicks(minRaw - padded, maxRaw + padded, 5);
      }
      const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

      type Point = { x: number; y: number; datum: StepLineChartDatum; index: number };
      let points: Point[] = [];
      if (safeData.length !== 0) {
        points = safeData.map((d, i) => {
          let x: number;
          if (xDomain.kind === "numeric") {
            x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
          } else {
            const denom = Math.max(safeData.length - 1, 1);
            x = safeData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
          }
          const y = scaleLinear(d.y, yDomain.min, yDomain.max, plotHeight, 0);
          return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
        });
      }

      const dataValueItems = safeData.map((d) => `${d.x}: ${d.y}`);
      const linePath = buildStepPath(points);
      const gridLines = yTicks.map((tick) => ({
        value: tick,
        y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
      }));

      let xTickEntries: { x: number; label: string }[] = [];
      if (safeData.length !== 0) {
        if (xDomain.kind === "ordinal") {
          xTickEntries = points.map((p, i) => ({ x: p.x, label: String(safeData[i].x) }));
        } else {
          const target = Math.min(5, safeData.length);
          const stride = Math.max(1, Math.round((safeData.length - 1) / (target - 1 || 1)));
          for (let i = 0; i < safeData.length; i += stride) {
            xTickEntries.push({ x: points[i].x, label: String(safeData[i].x) });
          }
          const lastIdx = safeData.length - 1;
          if (xTickEntries[xTickEntries.length - 1]?.label !== String(safeData[lastIdx].x)) {
            xTickEntries.push({ x: points[lastIdx].x, label: String(safeData[lastIdx].x) });
          }
        }
      }

      const gridChildren: ReturnType<typeof h>[] = [];
      for (const g of gridLines) {
        gridChildren.push(
          h("line", { key: `g${g.value}`, class: "st-stepLineChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: g.y, y2: g.y }),
          h(
            "text",
            { key: `t${g.value}`, class: "st-stepLineChart__tickLabel", x: MARGIN.left - 6, y: g.y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(g.value),
          ),
        );
      }

      const xLabels = xTickEntries.map((tick, i) =>
        h(
          "text",
          { key: `x${i}`, class: "st-stepLineChart__tickLabel", x: tick.x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
          tick.label,
        ),
      );

      const svgChildren: ReturnType<typeof h>[] = [
        ...gridChildren,
        h("line", { class: "st-stepLineChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-stepLineChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        ...xLabels,
      ];
      if (linePath) {
        svgChildren.push(
          h("path", { class: "st-stepLineChart__line", d: linePath, fill: "none", "stroke-width": "2", "stroke-linecap": "butt", "stroke-linejoin": "round" }),
        );
      }
      svgChildren.push(
        ...points.map((p) =>
          h("circle", { key: p.index, class: "st-stepLineChart__dot", cx: p.x, cy: p.y, r: "4", "data-chart-index": p.index }),
        ),
      );

      const hoveredPoint = hoveredIndex.value !== null ? points[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-stepLineChart", `st-stepLineChart--${tone}`, props.class) }, [
        h(
          "div",
          {
            class: "st-stepLineChart__visual",
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
                class: "st-stepLineChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredPoint.x / width) * 100}%; top: ${(hoveredPoint.y / height) * 100}%`,
              },
              [
                h("span", { class: "st-stepLineChart__tooltipLabel" }, String(hoveredPoint.datum.x)),
                h("span", { class: "st-stepLineChart__tooltipValue" }, String(hoveredPoint.datum.y)),
              ],
            )
          : null,
      ]);
    };
  },
});
