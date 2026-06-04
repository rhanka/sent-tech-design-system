import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import {
  buildLinearPath,
  buildSmoothPath,
  CHART_MARGIN,
  chartDataList,
  formatTick,
  isNumeric,
  niceTicks,
  scaleLinear,
} from "./chartScale.js";

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
};

export type LineChartProps = {
  data: LineChartDatum[];
  width?: number;
  height?: number;
  tone?: LineChartTone;
  smooth?: boolean;
  area?: boolean;
  label: string;
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

      let yTicks: number[];
      const ys = data.map((d) => d.y);
      if (ys.length === 0) {
        yTicks = [0];
      } else {
        const yMin = Math.min(...ys);
        const yMax = Math.max(...ys);
        const padded = (yMax - yMin) * 0.08 || Math.max(Math.abs(yMax), 1) * 0.1;
        yTicks = niceTicks(yMin - padded, yMax + padded, 5);
      }
      const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

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
          const y = scaleLinear(d.y, yDomain.min, yDomain.max, plotHeight, 0);
          return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
        });
      }

      const dataValueItems = data.map((d) => `${d.x}: ${d.y}`);

      const linePath = points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points);

      let areaPath = "";
      if (area && points.length !== 0) {
        const base = MARGIN.top + plotHeight;
        const first = points[0];
        const last = points[points.length - 1];
        areaPath = `${linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
      }

      const gridLines = yTicks.map((tick) => ({
        value: tick,
        y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
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
        h("circle", { key: p.index, class: "st-lineChart__dot", cx: p.x, cy: p.y, r: "4", "data-chart-index": p.index }),
      );

      const svgChildren: ReturnType<typeof h>[] = [
        ...gridChildren,
        h("line", { class: "st-lineChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-lineChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        ...xLabels,
      ];
      if (area && areaPath) {
        svgChildren.push(h("path", { class: "st-lineChart__area", d: areaPath }));
      }
      if (linePath) {
        svgChildren.push(
          h("path", { class: "st-lineChart__line", d: linePath, fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        );
      }
      svgChildren.push(...dots);

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
