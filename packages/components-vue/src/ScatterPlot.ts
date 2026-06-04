import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

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
};

export type ScatterPlotProps = {
  data: ScatterPlotDatum[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  radius?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 } as const;

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

export const ScatterPlot = defineComponent({
  name: "ScatterPlot",
  props: {
    data: { type: Array as () => ScatterPlotDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
    xLabel: { type: String, default: undefined },
    yLabel: { type: String, default: undefined },
    radius: { type: Number, default: 5 },
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
      const height = props.height ?? 280;
      const radius = props.radius ?? 5;
      const label = props.label;
      const data = props.data;

      const xs = data.map((d) => d.x);
      const ys = data.map((d) => d.y);
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
        datum: d,
        tone: (d.tone ?? TONES[i % TONES.length]) as ScatterPlotTone,
      }));

      const dataValueItems = data.map((d) => (d.label ? `${d.label}: x ${d.x}, y ${d.y}` : `x ${d.x}, y ${d.y}`));

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

      points.forEach((p, i) => {
        svgChildren.push(
          h("circle", {
            key: `p${i}`,
            class: classNames("st-scatterPlot__point", `st-scatterPlot__point--${p.tone}`),
            cx: p.cx,
            cy: p.cy,
            r: radius,
            "data-chart-index": i,
          }),
        );
      });

      const hovered = hoveredIndex.value !== null ? points[hoveredIndex.value] : undefined;

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
