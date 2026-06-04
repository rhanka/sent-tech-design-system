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

export type AreaChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type AreaChartDatum = {
  x: number | string;
  y: number;
};

export type AreaChartProps = {
  data: (number | AreaChartDatum)[];
  width?: number;
  height?: number;
  tone?: AreaChartTone;
  smooth?: boolean;
  label: string;
  class?: string;
};

const MARGIN = CHART_MARGIN;

let gradientCounter = 0;

export const AreaChart = defineComponent({
  name: "AreaChart",
  props: {
    data: { type: Array as () => (number | AreaChartDatum)[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    tone: { type: String as () => AreaChartTone, default: "category1" },
    smooth: { type: Boolean, default: false },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredIndex = ref<number | null>(null);
    const gradientId = `st-areachart-gradient-${(gradientCounter++).toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

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
      const label = props.label;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      const normalizedData: AreaChartDatum[] = (props.data ?? []).map((d, i) =>
        typeof d === "number" ? ({ x: i, y: d } as AreaChartDatum) : d,
      );

      const dataValueItems = normalizedData.map((d) => `${d.x}: ${d.y}`);

      let xDomain:
        | { kind: "ordinal"; values: (number | string)[] }
        | { kind: "numeric"; min: number; max: number };
      if (normalizedData.length === 0) {
        xDomain = { kind: "ordinal", values: [] };
      } else if (normalizedData.every((d) => isNumeric(d.x))) {
        const xs = normalizedData.map((d) => d.x as number);
        xDomain = { kind: "numeric", min: Math.min(...xs), max: Math.max(...xs) };
      } else {
        xDomain = { kind: "ordinal", values: normalizedData.map((d) => d.x) };
      }

      let yTicks: number[];
      const ys = normalizedData.map((d) => d.y);
      if (ys.length === 0) {
        yTicks = [0];
      } else {
        const yMin = Math.min(...ys);
        const yMax = Math.max(...ys);
        const padded = (yMax - yMin) * 0.08 || Math.max(Math.abs(yMax), 1) * 0.1;
        const minTickVal = Math.min(0, yMin - padded);
        yTicks = niceTicks(minTickVal, yMax + padded, 5);
      }
      const yDomain = yTicks.length === 0 ? { min: 0, max: 1 } : { min: yTicks[0], max: yTicks[yTicks.length - 1] };

      type Point = { x: number; y: number; datum: AreaChartDatum; index: number };
      let points: Point[] = [];
      if (normalizedData.length !== 0) {
        points = normalizedData.map((d, i) => {
          let x: number;
          if (xDomain.kind === "numeric") {
            x = scaleLinear(d.x as number, xDomain.min, xDomain.max, 0, plotWidth);
          } else {
            const denom = Math.max(normalizedData.length - 1, 1);
            x = normalizedData.length === 1 ? plotWidth / 2 : (i / denom) * plotWidth;
          }
          const y = scaleLinear(d.y, yDomain.min, yDomain.max, plotHeight, 0);
          return { x: MARGIN.left + x, y: MARGIN.top + y, datum: d, index: i };
        });
      }

      const linePath = points.length === 0 ? "" : smooth ? buildSmoothPath(points) : buildLinearPath(points);

      let areaPath = "";
      if (points.length !== 0) {
        const base = MARGIN.top + scaleLinear(Math.max(0, yDomain.min), yDomain.min, yDomain.max, plotHeight, 0);
        const first = points[0];
        const last = points[points.length - 1];
        areaPath = `${linePath} L${last.x.toFixed(2)},${base.toFixed(2)} L${first.x.toFixed(2)},${base.toFixed(2)} Z`;
      }

      const gridLines = yTicks.map((tick) => ({
        value: tick,
        y: MARGIN.top + scaleLinear(tick, yDomain.min, yDomain.max, plotHeight, 0),
      }));

      let xTickEntries: { x: number; label: string }[] = [];
      if (normalizedData.length !== 0) {
        if (xDomain.kind === "ordinal") {
          xTickEntries = points.map((p, i) => ({ x: p.x, label: String(normalizedData[i].x) }));
        } else {
          const target = Math.min(5, normalizedData.length);
          const stride = Math.max(1, Math.round((normalizedData.length - 1) / (target - 1 || 1)));
          for (let i = 0; i < normalizedData.length; i += stride) {
            xTickEntries.push({ x: points[i].x, label: String(normalizedData[i].x) });
          }
          const lastIdx = normalizedData.length - 1;
          if (xTickEntries[xTickEntries.length - 1]?.label !== String(normalizedData[lastIdx].x)) {
            xTickEntries.push({ x: points[lastIdx].x, label: String(normalizedData[lastIdx].x) });
          }
        }
      }

      const gridChildren: ReturnType<typeof h>[] = [];
      for (const g of gridLines) {
        gridChildren.push(
          h("line", { key: `g${g.value}`, class: "st-areaChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: g.y, y2: g.y }),
          h(
            "text",
            { key: `t${g.value}`, class: "st-areaChart__tickLabel", x: MARGIN.left - 6, y: g.y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(g.value),
          ),
        );
      }

      const xLabels = xTickEntries.map((tick, i) =>
        h(
          "text",
          { key: `x${i}`, class: "st-areaChart__tickLabel", x: tick.x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
          tick.label,
        ),
      );

      const dots = points.map((p) =>
        h("circle", { key: p.index, class: "st-areaChart__dot", cx: p.x, cy: p.y, r: "4", "data-chart-index": p.index }),
      );

      const svgChildren: ReturnType<typeof h>[] = [
        h("defs", {}, [
          h("linearGradient", { id: gradientId, x1: "0", y1: "0", x2: "0", y2: "1" }, [
            h("stop", { offset: "0%", "stop-color": "currentColor", "stop-opacity": "0.3" }),
            h("stop", { offset: "100%", "stop-color": "currentColor", "stop-opacity": "0.0" }),
          ]),
        ]),
        ...gridChildren,
        h("line", { class: "st-areaChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-areaChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        ...xLabels,
      ];
      if (areaPath) {
        svgChildren.push(h("path", { class: "st-areaChart__area", d: areaPath, fill: `url(#${gradientId})` }));
      }
      if (linePath) {
        svgChildren.push(
          h("path", { class: "st-areaChart__line", d: linePath, fill: "none", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        );
      }
      svgChildren.push(...dots);

      const hoveredPoint = hoveredIndex.value !== null ? points[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-areaChart", `st-areaChart--${tone}`, props.class) }, [
        h(
          "div",
          {
            class: "st-areaChart__visual",
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
                class: "st-areaChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredPoint.x / width) * 100}%; top: ${(hoveredPoint.y / height) * 100}%`,
              },
              [
                h("span", { class: "st-areaChart__tooltipLabel" }, String(hoveredPoint.datum.x)),
                h("span", { class: "st-areaChart__tooltipValue" }, String(hoveredPoint.datum.y)),
              ],
            )
          : null,
      ]);
    };
  },
});
