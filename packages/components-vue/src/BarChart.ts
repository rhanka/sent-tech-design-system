import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type BarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type BarChartDatum = {
  label: string;
  value: number;
  tone?: BarChartTone;
};

export type BarChartProps = {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  class?: string;
};

const MARGIN = CHART_MARGIN;

export const BarChart = defineComponent({
  name: "BarChart",
  props: {
    data: { type: Array as () => BarChartDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    orientation: { type: String as () => "vertical" | "horizontal", default: "vertical" },
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
      const orientation = props.orientation ?? "vertical";
      const label = props.label;
      const data = props.data;

      const values = data.map((d) => d.value);
      const minRaw = Math.min(0, ...values);
      const maxRaw = Math.max(0, ...values);
      const ticks = niceTicks(minRaw, maxRaw, 5);
      const domainMin = ticks[0];
      const domainMax = ticks[ticks.length - 1];
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      type Bar = {
        x: number;
        y: number;
        width: number;
        height: number;
        cx: number;
        cy: number;
        datum: BarChartDatum;
        tone: BarChartTone;
      };

      let bars: Bar[] = [];
      if (data.length !== 0) {
        if (orientation === "vertical") {
          const band = plotWidth / data.length;
          const barWidth = band * 0.62;
          const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
          bars = data.map((d, i) => {
            const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
            const y = Math.min(valueY, zeroY);
            const hh = Math.abs(zeroY - valueY);
            const x = MARGIN.left + band * i + (band - barWidth) / 2;
            return {
              x,
              y: MARGIN.top + y,
              width: barWidth,
              height: Math.max(hh, 0.5),
              cx: MARGIN.left + band * (i + 0.5),
              cy: MARGIN.top + valueY,
              datum: d,
              tone: (d.tone ?? "category1") as BarChartTone,
            };
          });
        } else {
          const band = plotHeight / data.length;
          const barHeight = band * 0.62;
          const zeroX = scaleLinear(0, domainMin, domainMax, 0, plotWidth);
          bars = data.map((d, i) => {
            const valueX = scaleLinear(d.value, domainMin, domainMax, 0, plotWidth);
            const x = Math.min(valueX, zeroX);
            const w = Math.abs(valueX - zeroX);
            const y = MARGIN.top + band * i + (band - barHeight) / 2;
            return {
              x: MARGIN.left + x,
              y,
              width: Math.max(w, 0.5),
              height: barHeight,
              cx: MARGIN.left + valueX,
              cy: MARGIN.top + band * (i + 0.5),
              datum: d,
              tone: (d.tone ?? "category1") as BarChartTone,
            };
          });
        }
      }

      const dataValueItems = data.map((d) => `${d.label}: ${d.value}`);

      const gridChildren: ReturnType<typeof h>[] = [];
      if (orientation === "vertical") {
        for (const tick of ticks) {
          const y = MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0);
          gridChildren.push(
            h("line", { key: `g${tick}`, class: "st-barChart__grid", x1: MARGIN.left, x2: MARGIN.left + plotWidth, y1: y, y2: y }),
            h(
              "text",
              { key: `t${tick}`, class: "st-barChart__tickLabel", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" },
              formatTick(tick),
            ),
          );
        }
      } else {
        for (const tick of ticks) {
          const x = MARGIN.left + scaleLinear(tick, domainMin, domainMax, 0, plotWidth);
          gridChildren.push(
            h("line", { key: `g${tick}`, class: "st-barChart__grid", x1: x, x2: x, y1: MARGIN.top, y2: MARGIN.top + plotHeight }),
            h(
              "text",
              { key: `t${tick}`, class: "st-barChart__tickLabel", x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
              formatTick(tick),
            ),
          );
        }
      }

      const categoryLabels = bars.map((bar) =>
        orientation === "vertical"
          ? h(
              "text",
              { key: `c${bar.datum.label}`, class: "st-barChart__categoryLabel", x: bar.x + bar.width / 2, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
              bar.datum.label,
            )
          : h(
              "text",
              { key: `c${bar.datum.label}`, class: "st-barChart__categoryLabel", x: MARGIN.left - 6, y: bar.y + bar.height / 2, "text-anchor": "end", "dominant-baseline": "middle" },
              bar.datum.label,
            ),
      );

      const barRects = bars.map((bar, i) =>
        h("rect", {
          key: `b${bar.datum.label}`,
          class: classNames("st-barChart__bar", `st-barChart__bar--${bar.tone}`),
          x: bar.x,
          y: bar.y,
          width: bar.width,
          height: bar.height,
          rx: "2",
          "data-chart-index": i,
        }),
      );

      const hoveredBar = hoveredIndex.value !== null ? bars[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-barChart", props.class) }, [
        h(
          "div",
          {
            class: "st-barChart__visual",
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
              [
                ...gridChildren,
                h("line", { class: "st-barChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
                h("line", { class: "st-barChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
                ...categoryLabels,
                ...barRects,
              ],
            ),
          ],
        ),
        chartDataList(label, dataValueItems),
        hoveredBar
          ? h(
              "div",
              {
                class: "st-barChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredBar.cx / width) * 100}%; top: ${(hoveredBar.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-barChart__tooltipLabel" }, hoveredBar.datum.label),
                h("span", { class: "st-barChart__tooltipValue" }, String(hoveredBar.datum.value)),
              ],
            )
          : null,
      ]);
    };
  },
});
