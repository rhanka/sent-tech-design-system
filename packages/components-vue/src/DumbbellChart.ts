import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { GraphLegend } from "./GraphLegend.js";

export type DumbbellChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DumbbellChartDatum = {
  category: string;
  low: number;
  high: number;
};

export type DumbbellChartProps = {
  data: DumbbellChartDatum[];
  width?: number;
  height?: number;
  lowTone?: DumbbellChartTone;
  highTone?: DumbbellChartTone;
  lowLabel?: string;
  highLabel?: string;
  label: string;
  class?: string;
};

// Categories sit on the vertical axis (one row each); the value axis is
// horizontal. A wider left margin holds the category labels.
const MARGIN = { ...CHART_MARGIN, left: 96, right: 20, top: 16 };
const DOT_RADIUS = 5;

// Normalise a datum: finite low/high, ordered (lo <= hi).
function normalize(d: DumbbellChartDatum): { lo: number; hi: number } | null {
  if (!Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  return { lo: Math.min(d.low, d.high), hi: Math.max(d.low, d.high) };
}

export const DumbbellChart = defineComponent({
  name: "DumbbellChart",
  props: {
    data: { type: Array as () => DumbbellChartDatum[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    lowTone: { type: String as () => DumbbellChartTone, default: "category1" },
    highTone: { type: String as () => DumbbellChartTone, default: "category2" },
    lowLabel: { type: String, default: "Bas" },
    highLabel: { type: String, default: "Haut" },
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
      const lowTone = props.lowTone ?? "category1";
      const highTone = props.highTone ?? "category2";
      const lowLabel = props.lowLabel ?? "Bas";
      const highLabel = props.highLabel ?? "Haut";
      const label = props.label;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Valid data: finite low + high.
      const validData = (props.data ?? []).filter((d) => normalize(d) !== null);

      const dataValueItems = validData.map((d) => {
        const r = normalize(d)!;
        return `${d.category}: ${r.lo} – ${r.hi}`;
      });

      // Shrink the category-label font when the reserved left margin is tighter
      // than the reference default, to avoid clipping (cf. lollipop fix).
      const categoryFontSize = Math.max(0.5, 0.6875 * Math.min(1, MARGIN.left / 96));

      let xTicks: number[];
      if (validData.length === 0) {
        xTicks = [0];
      } else {
        const lows = validData.map((d) => normalize(d)!.lo);
        const highs = validData.map((d) => normalize(d)!.hi);
        const minRaw = Math.min(...lows);
        const maxRaw = Math.max(...highs);
        const padded = (maxRaw - minRaw) * 0.08 || Math.max(Math.abs(maxRaw), 1) * 0.1;
        xTicks = niceTicks(minRaw - padded, maxRaw + padded, 5);
      }
      const xDomain = xTicks.length === 0 ? { min: 0, max: 1 } : { min: xTicks[0], max: xTicks[xTicks.length - 1] };

      type DumbbellRow = {
        datum: DumbbellChartDatum;
        range: { lo: number; hi: number };
        cy: number;
        xLow: number;
        xHigh: number;
        index: number;
      };
      let rows: DumbbellRow[] = [];
      if (validData.length !== 0) {
        const band = plotHeight / validData.length;
        rows = validData.map((d, i) => {
          const r = normalize(d)!;
          const cy = MARGIN.top + band * (i + 0.5);
          const xLow = MARGIN.left + scaleLinear(r.lo, xDomain.min, xDomain.max, 0, plotWidth);
          const xHigh = MARGIN.left + scaleLinear(r.hi, xDomain.min, xDomain.max, 0, plotWidth);
          return { datum: d, range: r, cy, xLow, xHigh, index: i };
        });
      }

      const gridLines = xTicks.map((tick) => ({
        value: tick,
        x: MARGIN.left + scaleLinear(tick, xDomain.min, xDomain.max, 0, plotWidth),
      }));

      const gridChildren: ReturnType<typeof h>[] = [];
      for (const g of gridLines) {
        gridChildren.push(
          h("line", { key: `g${g.value}`, class: "st-dumbbellChart__grid", x1: g.x, x2: g.x, y1: MARGIN.top, y2: height - MARGIN.bottom }),
          h(
            "text",
            { key: `t${g.value}`, class: "st-dumbbellChart__tickLabel", x: g.x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            formatTick(g.value),
          ),
        );
      }

      const rowChildren: ReturnType<typeof h>[] = [];
      for (const row of rows) {
        rowChildren.push(
          h(
            "text",
            {
              key: `c${row.index}`,
              class: "st-dumbbellChart__categoryLabel",
              x: MARGIN.left - 8,
              y: row.cy,
              "text-anchor": "end",
              "dominant-baseline": "middle",
              style: `font-size: ${categoryFontSize}rem`,
            },
            row.datum.category,
          ),
          h("line", { key: `n${row.index}`, class: "st-dumbbellChart__connector", x1: row.xLow, x2: row.xHigh, y1: row.cy, y2: row.cy }),
          h("circle", {
            key: `l${row.index}`,
            class: `st-dumbbellChart__dot st-dumbbellChart__dot--low st-dumbbellChart__dot--${lowTone}`,
            cx: row.xLow,
            cy: row.cy,
            r: DOT_RADIUS,
            "data-chart-index": row.index,
          }),
          h("circle", {
            key: `h${row.index}`,
            class: `st-dumbbellChart__dot st-dumbbellChart__dot--high st-dumbbellChart__dot--${highTone}`,
            cx: row.xHigh,
            cy: row.cy,
            r: DOT_RADIUS,
            "data-chart-index": row.index,
          }),
        );
      }

      const svgChildren: ReturnType<typeof h>[] = [
        ...gridChildren,
        h("line", { class: "st-dumbbellChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-dumbbellChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        ...rowChildren,
      ];

      const legendEntries = [
        { label: lowLabel, shape: "circle" as const, tone: lowTone },
        { label: highLabel, shape: "circle" as const, tone: highTone },
      ];

      const hoveredRow = hoveredIndex.value !== null ? rows[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-dumbbellChart", props.class) }, [
        h(
          "div",
          {
            class: "st-dumbbellChart__visual",
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
            h(GraphLegend, { class: "st-dumbbellChart__legend", entries: legendEntries }),
          ],
        ),
        chartDataList(label, dataValueItems),
        hoveredRow
          ? h(
              "div",
              {
                class: "st-dumbbellChart__tooltip",
                role: "presentation",
                style: `left: ${(((hoveredRow.xLow + hoveredRow.xHigh) / 2) / width) * 100}%; top: ${(hoveredRow.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-dumbbellChart__tooltipLabel" }, String(hoveredRow.datum.category)),
                h("span", { class: "st-dumbbellChart__tooltipValue" }, `${hoveredRow.range.lo} – ${hoveredRow.range.hi}`),
              ],
            )
          : null,
      ]);
    };
  },
});
