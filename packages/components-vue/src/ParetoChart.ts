import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ParetoChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ParetoChartDatum = {
  label: string;
  value: number;
  tone?: ParetoChartTone;
};

export type ParetoChartProps = {
  data: ParetoChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

// Right margin larger than BarChart's to host the % axis labels.
const MARGIN = { top: 12, right: 44, bottom: 32, left: 44 };
const DOT_RADIUS = 4;

export const ParetoChart = defineComponent({
  name: "ParetoChart",
  props: {
    data: { type: Array as () => ParetoChartDatum[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
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
      const label = props.label;
      const data = props.data ?? [];

      // Valid data: finite, non-negative value. Sorted descending by value.
      const sortedData = data
        .filter((d) => Number.isFinite(d.value) && d.value >= 0)
        .slice()
        .sort((a, b) => b.value - a.value);

      const total = sortedData.reduce((acc, d) => acc + d.value, 0);

      const values = sortedData.map((d) => d.value);
      const ticks = niceTicks(0, Math.max(0, ...values), 5);
      const domainMin = ticks[0];
      const domainMax = ticks[ticks.length - 1];
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      type ParetoEntry = {
        datum: ParetoChartDatum;
        tone: ParetoChartTone;
        x: number;
        y: number;
        width: number;
        height: number;
        cumPercent: number;
        cx: number;
        cy: number;
      };

      let entries: ParetoEntry[] = [];
      if (sortedData.length !== 0) {
        const band = plotWidth / sortedData.length;
        const barWidth = band * 0.62;
        const zeroY = scaleLinear(0, domainMin, domainMax, plotHeight, 0);
        let running = 0;
        entries = sortedData.map((d, i) => {
          running += d.value;
          const cumPercent = total > 0 ? (running / total) * 100 : 0;
          const valueY = scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
          const y = Math.min(valueY, zeroY);
          const hh = Math.abs(zeroY - valueY);
          const x = MARGIN.left + band * i + (band - barWidth) / 2;
          // The % axis maps [0,100] over the full plot height (100% at top).
          const cy = MARGIN.top + scaleLinear(cumPercent, 0, 100, plotHeight, 0);
          return {
            datum: d,
            tone: (d.tone ?? "category1") as ParetoChartTone,
            x,
            y: MARGIN.top + y,
            width: barWidth,
            height: Math.max(hh, 0.5),
            cumPercent,
            cx: MARGIN.left + band * (i + 0.5),
            cy,
          };
        });
      }

      const cumulativePath = entries
        .map((e, i) => `${i === 0 ? "M" : "L"} ${e.cx} ${e.cy}`)
        .join(" ");

      const dataValueItems = entries.map(
        (e) => `${e.datum.label}: ${e.datum.value} (${formatTick(e.cumPercent)}% cumulé)`,
      );

      const valueAxisTicks = ticks.map((tick) => ({
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + plotWidth,
        y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
      }));

      // Right (percentage) axis: fixed 0–100 in 25% steps.
      const percentAxisTicks = [0, 25, 50, 75, 100].map((pct) => ({
        value: pct,
        y: MARGIN.top + scaleLinear(pct, 0, 100, plotHeight, 0),
      }));

      const svgChildren: ReturnType<typeof h>[] = [];

      // value-axis gridlines + left tick labels
      for (const tick of valueAxisTicks) {
        svgChildren.push(
          h("line", {
            key: `v-${tick.value}`,
            class: "st-paretoChart__grid",
            x1: tick.x1,
            x2: tick.x2,
            y1: tick.y,
            y2: tick.y,
          }),
          h(
            "text",
            {
              key: `vt-${tick.value}`,
              class: "st-paretoChart__tickLabel",
              x: MARGIN.left - 6,
              y: tick.y,
              "text-anchor": "end",
              "dominant-baseline": "middle",
            },
            formatTick(tick.value),
          ),
        );
      }

      // right percentage-axis labels
      for (const tick of percentAxisTicks) {
        svgChildren.push(
          h(
            "text",
            {
              key: `p-${tick.value}`,
              class: "st-paretoChart__percentLabel",
              x: width - MARGIN.right + 6,
              y: tick.y,
              "text-anchor": "start",
              "dominant-baseline": "middle",
            },
            `${tick.value}%`,
          ),
        );
      }

      // axes
      svgChildren.push(
        h("line", {
          class: "st-paretoChart__axis",
          x1: MARGIN.left,
          x2: MARGIN.left,
          y1: MARGIN.top,
          y2: height - MARGIN.bottom,
        }),
        h("line", {
          class: "st-paretoChart__axis",
          x1: width - MARGIN.right,
          x2: width - MARGIN.right,
          y1: MARGIN.top,
          y2: height - MARGIN.bottom,
        }),
        h("line", {
          class: "st-paretoChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      );

      // category labels
      for (const e of entries) {
        svgChildren.push(
          h(
            "text",
            {
              key: `cat-${e.datum.label}`,
              class: "st-paretoChart__categoryLabel",
              x: e.x + e.width / 2,
              y: height - MARGIN.bottom + 16,
              "text-anchor": "middle",
            },
            e.datum.label,
          ),
        );
      }

      // bars (decorative, inside aria-hidden SVG)
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        svgChildren.push(
          h("rect", {
            key: `bar-${e.datum.label}`,
            class: `st-paretoChart__bar st-paretoChart__bar--${e.tone}`,
            x: e.x,
            y: e.y,
            width: e.width,
            height: e.height,
            rx: "2",
            "data-chart-index": i,
          }),
        );
      }

      // cumulative % line + dots
      if (entries.length > 0) {
        svgChildren.push(
          h("path", { class: "st-paretoChart__cumLine", d: cumulativePath, fill: "none" }),
        );
        for (let i = 0; i < entries.length; i++) {
          const e = entries[i];
          svgChildren.push(
            h("circle", {
              key: `dot-${e.datum.label}`,
              class: "st-paretoChart__cumDot",
              cx: e.cx,
              cy: e.cy,
              r: DOT_RADIUS,
              "data-chart-index": i,
            }),
          );
        }
      }

      const hovered = hoveredIndex.value !== null ? entries[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-paretoChart", props.class) }, [
        h(
          "div",
          {
            class: "st-paretoChart__visual",
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
                class: "st-paretoChart__tooltip",
                role: "presentation",
                style: `left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-paretoChart__tooltipLabel" }, hovered.datum.label),
                h(
                  "span",
                  { class: "st-paretoChart__tooltipValue" },
                  `${hovered.datum.value} · ${formatTick(hovered.cumPercent)}%`,
                ),
              ],
            )
          : null,
      ]);
    };
  },
});
