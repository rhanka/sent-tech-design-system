import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks } from "./chartScale.js";

export type ColumnRangeChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ColumnRangeChartDatum = {
  category: string;
  low: number;
  high: number;
  tone?: ColumnRangeChartTone;
};

export type ColumnRangeChartProps = {
  data: ColumnRangeChartDatum[];
  width?: number;
  height?: number;
  orientation?: "vertical" | "horizontal";
  label: string;
  /**
   * Fixed value-axis domain `[min, max]`. When provided (and finite), the value
   * scale uses it instead of the data-derived min/max — letting several
   * ColumnRangeCharts in a grid share one scale. When absent or invalid, the
   * scale falls back to the auto data range (unchanged).
   */
  domain?: [number, number];
  class?: string;
};

const MARGIN = { top: 12, right: 16, bottom: 32, left: 44 };

// Normalise a datum: finite low/high, ordered (lo <= hi).
function normalize(d: ColumnRangeChartDatum): { lo: number; hi: number } | null {
  if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
}

export const ColumnRangeChart = defineComponent({
  name: "ColumnRangeChart",
  props: {
    data: { type: Array as () => ColumnRangeChartDatum[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    orientation: { type: String as () => "vertical" | "horizontal", default: "vertical" },
    label: { type: String, required: true },
    domain: { type: Array as unknown as () => [number, number], default: undefined },
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
      const data = props.data ?? [];

      // Valid data: finite low + high.
      const validData = data.filter((d) => normalize(d) !== null);

      // A domain is honoured only when finite and ordered (min < max).
      const domain = props.domain;
      const validDomain: [number, number] | null =
        domain && Number.isFinite(domain[0]) && Number.isFinite(domain[1]) && domain[0] < domain[1]
          ? [domain[0], domain[1]]
          : null;

      const lows = validData.map((d) => Math.min(d.low, d.high));
      const highs = validData.map((d) => Math.max(d.low, d.high));
      const minRaw = validDomain ? validDomain[0] : Math.min(...lows, ...highs);
      const maxRaw = validDomain ? validDomain[1] : Math.max(...lows, ...highs);
      const ticks = niceTicks(minRaw, maxRaw, 5);
      const domainMin = ticks[0];
      const domainMax = ticks[ticks.length - 1];
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Fraction [0,1] of a value along the value axis.
      const valueFraction = (v: number) => {
        if (domainMax === domainMin) return 0;
        const f = (v - domainMin) / (domainMax - domainMin);
        return Math.min(1, Math.max(0, f));
      };

      type Bar = {
        x: number;
        y: number;
        width: number;
        height: number;
        cx: number;
        cy: number;
        datum: ColumnRangeChartDatum;
        range: { lo: number; hi: number };
        tone: ColumnRangeChartTone;
      };

      let bars: Bar[] = [];
      if (validData.length !== 0) {
        if (orientation === "vertical") {
          const band = plotWidth / validData.length;
          const barWidth = band * 0.62;
          const yOf = (v: number) => plotHeight * (1 - valueFraction(v));
          bars = validData.map((d, i) => {
            const range = normalize(d)!;
            const yLow = yOf(range.lo);
            const yHigh = yOf(range.hi);
            const y = Math.min(yLow, yHigh);
            const hh = Math.abs(yLow - yHigh);
            const x = MARGIN.left + band * i + (band - barWidth) / 2;
            return {
              x,
              y: MARGIN.top + y,
              width: barWidth,
              height: Math.max(hh, 0.5),
              cx: MARGIN.left + band * (i + 0.5),
              cy: MARGIN.top + (yLow + yHigh) / 2,
              datum: d,
              range,
              tone: (d.tone ?? "category1") as ColumnRangeChartTone,
            };
          });
        } else {
          const band = plotHeight / validData.length;
          const barHeight = band * 0.62;
          const xOf = (v: number) => plotWidth * valueFraction(v);
          bars = validData.map((d, i) => {
            const range = normalize(d)!;
            const xLow = xOf(range.lo);
            const xHigh = xOf(range.hi);
            const x = Math.min(xLow, xHigh);
            const w = Math.abs(xHigh - xLow);
            const y = MARGIN.top + band * i + (band - barHeight) / 2;
            return {
              x: MARGIN.left + x,
              y,
              width: Math.max(w, 0.5),
              height: barHeight,
              cx: MARGIN.left + (xLow + xHigh) / 2,
              cy: MARGIN.top + band * (i + 0.5),
              datum: d,
              range,
              tone: (d.tone ?? "category1") as ColumnRangeChartTone,
            };
          });
        }
      }

      const dataValueItems = bars.map((bar) => `${bar.datum.category}: ${bar.range.lo} – ${bar.range.hi}`);

      const valueAxisTicks = ticks.map((tick) => {
        if (orientation === "vertical") {
          return {
            value: tick,
            x1: MARGIN.left,
            x2: MARGIN.left + plotWidth,
            y: MARGIN.top + plotHeight * (1 - valueFraction(tick)),
            x: undefined as number | undefined,
            y1: undefined as number | undefined,
            y2: undefined as number | undefined,
          };
        }
        return {
          value: tick,
          x: MARGIN.left + plotWidth * valueFraction(tick),
          y1: MARGIN.top,
          y2: MARGIN.top + plotHeight,
          x1: undefined as number | undefined,
          x2: undefined as number | undefined,
          y: undefined as number | undefined,
        };
      });

      const svgChildren: ReturnType<typeof h>[] = [];

      // gridlines + value axis ticks
      for (const tick of valueAxisTicks) {
        if (orientation === "vertical") {
          svgChildren.push(
            h("line", {
              key: `g${tick.value}`,
              class: "st-columnRangeChart__grid",
              x1: tick.x1,
              x2: tick.x2,
              y1: tick.y,
              y2: tick.y,
            }),
            h(
              "text",
              {
                key: `t${tick.value}`,
                class: "st-columnRangeChart__tickLabel",
                x: MARGIN.left - 6,
                y: tick.y,
                "text-anchor": "end",
                "dominant-baseline": "middle",
              },
              formatTick(tick.value),
            ),
          );
        } else {
          svgChildren.push(
            h("line", {
              key: `g${tick.value}`,
              class: "st-columnRangeChart__grid",
              x1: tick.x,
              x2: tick.x,
              y1: tick.y1,
              y2: tick.y2,
            }),
            h(
              "text",
              {
                key: `t${tick.value}`,
                class: "st-columnRangeChart__tickLabel",
                x: tick.x,
                y: height - MARGIN.bottom + 16,
                "text-anchor": "middle",
              },
              formatTick(tick.value),
            ),
          );
        }
      }

      // axes
      svgChildren.push(
        h("line", {
          class: "st-columnRangeChart__axis",
          x1: MARGIN.left,
          x2: MARGIN.left,
          y1: MARGIN.top,
          y2: height - MARGIN.bottom,
        }),
        h("line", {
          class: "st-columnRangeChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      );

      // category labels
      for (const bar of bars) {
        if (orientation === "vertical") {
          svgChildren.push(
            h(
              "text",
              {
                key: `cat-${bar.datum.category}`,
                class: "st-columnRangeChart__categoryLabel",
                x: bar.x + bar.width / 2,
                y: height - MARGIN.bottom + 16,
                "text-anchor": "middle",
              },
              bar.datum.category,
            ),
          );
        } else {
          svgChildren.push(
            h(
              "text",
              {
                key: `cat-${bar.datum.category}`,
                class: "st-columnRangeChart__categoryLabel",
                x: MARGIN.left - 6,
                y: bar.y + bar.height / 2,
                "text-anchor": "end",
                "dominant-baseline": "middle",
              },
              bar.datum.category,
            ),
          );
        }
      }

      // range bars (decorative, inside aria-hidden SVG)
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        svgChildren.push(
          h("rect", {
            key: `bar-${bar.datum.category}`,
            class: `st-columnRangeChart__bar st-columnRangeChart__bar--${bar.tone}`,
            x: bar.x,
            y: bar.y,
            width: bar.width,
            height: bar.height,
            rx: "2",
            "data-chart-index": i,
          }),
        );
      }

      const hovered = hoveredIndex.value !== null ? bars[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-columnRangeChart", props.class) }, [
        h(
          "div",
          {
            class: "st-columnRangeChart__visual",
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
                class: "st-columnRangeChart__tooltip",
                role: "presentation",
                style: `left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-columnRangeChart__tooltipLabel" }, hovered.datum.category),
                h("span", { class: "st-columnRangeChart__tooltipValue" }, `${hovered.range.lo} – ${hovered.range.hi}`),
              ],
            )
          : null,
      ]);
    };
  },
});
