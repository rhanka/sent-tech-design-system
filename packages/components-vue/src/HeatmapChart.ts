import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type HeatmapChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type HeatmapChartDatum = {
  x: string;
  y: string;
  value: number;
  tone?: HeatmapChartTone;
};

export type HeatmapChartProps = {
  data: HeatmapChartDatum[];
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

const MARGIN = { top: 28, right: 18, bottom: 44, left: 64 } as const;
const TONES: HeatmapChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

function toneForValue(value: number, min: number, max: number): HeatmapChartTone {
  if (!Number.isFinite(value) || max <= min) return "category1";
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
  return TONES[index];
}

export const HeatmapChart = defineComponent({
  name: "HeatmapChart",
  props: {
    data: { type: Array as () => HeatmapChartDatum[], required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 300 },
    legend: { type: Boolean, default: false },
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
      const data = props.data ?? [];
      const width = props.width ?? 480;
      const height = props.height ?? 300;
      const legend = props.legend ?? false;
      const label = props.label;

      const xLabels = uniqueInOrder(data.map((d) => d.x));
      const yLabels = uniqueInOrder(data.map((d) => d.y));
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
      const cellWidth = xLabels.length > 0 ? plotWidth / xLabels.length : plotWidth;
      const cellHeight = yLabels.length > 0 ? plotHeight / yLabels.length : plotHeight;
      const values = data.map((d) => d.value).filter(Number.isFinite);
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 1;

      const cells = data.map((d, i) => {
        const xIndex = Math.max(0, xLabels.indexOf(d.x));
        const yIndex = Math.max(0, yLabels.indexOf(d.y));
        return {
          datum: d,
          tone: d.tone ?? toneForValue(d.value, min, max),
          x: MARGIN.left + xIndex * cellWidth,
          y: MARGIN.top + yIndex * cellHeight,
          cellWidth,
          cellHeight,
          cx: MARGIN.left + xIndex * cellWidth + cellWidth / 2,
          cy: MARGIN.top + yIndex * cellHeight + cellHeight / 2,
          index: i,
        };
      });

      const svgChildren: ReturnType<typeof h>[] = [];

      yLabels.forEach((yLabel, row) => {
        svgChildren.push(
          h(
            "text",
            {
              key: `y${yLabel}`,
              class: "st-heatmapChart__axisLabel st-heatmapChart__axisLabel--y",
              x: MARGIN.left - 8,
              y: MARGIN.top + (row + 0.5) * (plotHeight / Math.max(yLabels.length, 1)),
              "text-anchor": "end",
              "dominant-baseline": "middle",
            },
            yLabel,
          ),
        );
      });

      xLabels.forEach((xLabel, column) => {
        svgChildren.push(
          h(
            "text",
            {
              key: `x${xLabel}`,
              class: "st-heatmapChart__axisLabel st-heatmapChart__axisLabel--x",
              x: MARGIN.left + (column + 0.5) * (plotWidth / Math.max(xLabels.length, 1)),
              y: height - MARGIN.bottom + 20,
              "text-anchor": "middle",
            },
            xLabel,
          ),
        );
      });

      svgChildren.push(
        h("rect", {
          class: "st-heatmapChart__plot",
          x: MARGIN.left,
          y: MARGIN.top,
          width: plotWidth,
          height: plotHeight,
        }),
      );

      cells.forEach((cell, i) => {
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(
          h("rect", {
            key: `${cell.datum.y}-${cell.datum.x}-${i}`,
            class: classNames(
              "st-heatmapChart__cell",
              `st-heatmapChart__cell--${cell.tone}`,
              isDim ? "st-heatmapChart__cell--dim" : undefined,
            ),
            x: cell.x,
            y: cell.y,
            width: Math.max(cell.cellWidth - 2, 1),
            height: Math.max(cell.cellHeight - 2, 1),
            rx: "2",
            "data-chart-index": i,
          }),
        );
      });

      const dataValueItems = data.map((d) => `${d.y}, ${d.x}: ${d.value}`);
      const hovered = hoveredIndex.value !== null ? cells[hoveredIndex.value] : undefined;

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-heatmapChart__visual",
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
      ];

      if (hovered) {
        children.push(
          h(
            "div",
            {
              class: "st-heatmapChart__tooltip",
              role: "presentation",
              style: `left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`,
            },
            [
              h("span", { class: "st-heatmapChart__tooltipLabel" }, `${hovered.datum.y}, ${hovered.datum.x}`),
              h("span", { class: "st-heatmapChart__tooltipValue" }, String(hovered.datum.value)),
            ],
          ),
        );
      }

      if (legend) {
        children.push(
          h("div", { class: "st-heatmapChart__legend", "aria-hidden": "true" }, [
            h("span", { class: "st-heatmapChart__legendText" }, "Low"),
            h(
              "span",
              { class: "st-heatmapChart__legendRamp" },
              TONES.map((tone) =>
                h("span", { key: tone, class: `st-heatmapChart__legendSwatch st-heatmapChart__legendSwatch--${tone}` }),
              ),
            ),
            h("span", { class: "st-heatmapChart__legendText" }, "High"),
          ]),
        );
      }

      return h("div", { ...attrs, class: classNames("st-heatmapChart", props.class) }, children);
    };
  },
});
