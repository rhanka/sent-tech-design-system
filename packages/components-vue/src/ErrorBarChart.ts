import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { CHART_MARGIN, chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";
import { GraphLegend } from "./GraphLegend.js";

export type ErrorBarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ErrorBarChartDatum = {
  category: string;
  value: number;
  low: number;
  high: number;
};

export type ErrorBarChartProps = {
  data: ErrorBarChartDatum[];
  width?: number;
  height?: number;
  tone?: ErrorBarChartTone;
  label: string;
  class?: string;
};

// Categories sit on the vertical axis (one row each); the value axis is
// horizontal. A wider left margin holds the category labels.
const MARGIN = { ...CHART_MARGIN, left: 96, right: 20, top: 16 };
const MARKER_RADIUS = 4;
const CAP_HALF = 5; // half-height of the perpendicular cap

// Normalise a datum: finite value/low/high, ordered (lo <= value <= hi).
function normalize(d: ErrorBarChartDatum): { lo: number; mid: number; hi: number } | null {
  if (!Number.isFinite(d.value) || !Number.isFinite(d.low) || !Number.isFinite(d.high)) return null;
  const lo = Math.min(d.low, d.high);
  const hi = Math.max(d.low, d.high);
  const mid = Math.min(hi, Math.max(lo, d.value));
  return { lo, mid, hi };
}

export const ErrorBarChart = defineComponent({
  name: "ErrorBarChart",
  props: {
    data: { type: Array as () => ErrorBarChartDatum[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    tone: { type: String as () => ErrorBarChartTone, default: "category1" },
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

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      // Valid data: finite value + low + high.
      const validData = (props.data ?? []).filter((d) => normalize(d) !== null);

      const dataValueItems = validData.map((d) => {
        const r = normalize(d)!;
        return `${d.category}: ${r.mid} (${r.lo} – ${r.hi})`;
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

      type ErrorBarRow = {
        datum: ErrorBarChartDatum;
        range: { lo: number; mid: number; hi: number };
        cy: number;
        xLow: number;
        xMid: number;
        xHigh: number;
        index: number;
      };
      let rows: ErrorBarRow[] = [];
      if (validData.length !== 0) {
        const band = plotHeight / validData.length;
        rows = validData.map((d, i) => {
          const r = normalize(d)!;
          const cy = MARGIN.top + band * (i + 0.5);
          const xLow = MARGIN.left + scaleLinear(r.lo, xDomain.min, xDomain.max, 0, plotWidth);
          const xMid = MARGIN.left + scaleLinear(r.mid, xDomain.min, xDomain.max, 0, plotWidth);
          const xHigh = MARGIN.left + scaleLinear(r.hi, xDomain.min, xDomain.max, 0, plotWidth);
          return { datum: d, range: r, cy, xLow, xMid, xHigh, index: i };
        });
      }

      const gridLines = xTicks.map((tick) => ({
        value: tick,
        x: MARGIN.left + scaleLinear(tick, xDomain.min, xDomain.max, 0, plotWidth),
      }));

      const gridChildren: ReturnType<typeof h>[] = [];
      for (const g of gridLines) {
        gridChildren.push(
          h("line", { key: `g${g.value}`, class: "st-errorBarChart__grid", x1: g.x, x2: g.x, y1: MARGIN.top, y2: height - MARGIN.bottom }),
          h(
            "text",
            { key: `t${g.value}`, class: "st-errorBarChart__tickLabel", x: g.x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
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
              class: "st-errorBarChart__categoryLabel",
              x: MARGIN.left - 8,
              y: row.cy,
              "text-anchor": "end",
              "dominant-baseline": "middle",
              style: `font-size: ${categoryFontSize}rem`,
            },
            row.datum.category,
          ),
          h("line", {
            key: `w${row.index}`,
            class: `st-errorBarChart__whisker st-errorBarChart__whisker--${tone}`,
            x1: row.xLow,
            x2: row.xHigh,
            y1: row.cy,
            y2: row.cy,
          }),
          h("line", {
            key: `cl${row.index}`,
            class: `st-errorBarChart__cap st-errorBarChart__cap--low st-errorBarChart__cap--${tone}`,
            x1: row.xLow,
            x2: row.xLow,
            y1: row.cy - CAP_HALF,
            y2: row.cy + CAP_HALF,
          }),
          h("line", {
            key: `ch${row.index}`,
            class: `st-errorBarChart__cap st-errorBarChart__cap--high st-errorBarChart__cap--${tone}`,
            x1: row.xHigh,
            x2: row.xHigh,
            y1: row.cy - CAP_HALF,
            y2: row.cy + CAP_HALF,
          }),
          h("circle", {
            key: `m${row.index}`,
            class: `st-errorBarChart__marker st-errorBarChart__marker--${tone}`,
            cx: row.xMid,
            cy: row.cy,
            r: MARKER_RADIUS,
            "data-chart-index": row.index,
          }),
        );
      }

      const svgChildren: ReturnType<typeof h>[] = [
        ...gridChildren,
        h("line", { class: "st-errorBarChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-errorBarChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
        ...rowChildren,
      ];

      const legendEntries = [{ label, shape: "circle" as const, tone }];

      const hoveredRow = hoveredIndex.value !== null ? rows[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-errorBarChart", props.class) }, [
        h(
          "div",
          {
            class: "st-errorBarChart__visual",
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
            h(GraphLegend, { class: "st-errorBarChart__legend", entries: legendEntries }),
          ],
        ),
        chartDataList(label, dataValueItems),
        hoveredRow
          ? h(
              "div",
              {
                class: "st-errorBarChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredRow.xMid / width) * 100}%; top: ${(hoveredRow.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-errorBarChart__tooltipLabel" }, String(hoveredRow.datum.category)),
                h("span", { class: "st-errorBarChart__tooltipValue" }, `${hoveredRow.range.mid} (${hoveredRow.range.lo} – ${hoveredRow.range.hi})`),
              ],
            )
          : null,
      ]);
    };
  },
});
