import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ColumnPyramidChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ColumnPyramidChartDatum = {
  category: string;
  value: number;
  tone?: ColumnPyramidChartTone;
};

export type ColumnPyramidChartProps = {
  data: ColumnPyramidChartDatum[];
  width?: number;
  height?: number;
  label: string;
  /** Default tone for columns whose datum has no `tone`. */
  tone?: ColumnPyramidChartTone;
  class?: string;
};

const MARGIN = { top: 24, right: 16, bottom: 32, left: 44 };

export const ColumnPyramidChart = defineComponent({
  name: "ColumnPyramidChart",
  props: {
    data: { type: Array as () => ColumnPyramidChartDatum[], default: () => [] },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
    label: { type: String, required: true },
    tone: { type: String as () => ColumnPyramidChartTone, default: "category1" },
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
      const label = props.label;
      const data = props.data ?? [];
      const defaultTone = props.tone ?? "category1";

      // Valid data: finite, strictly-positive value (a triangle sitting on the X
      // axis is only meaningful for a value > 0).
      const validData = data.filter((d) => Number.isFinite(d.value) && d.value > 0);

      const values = validData.map((d) => d.value);
      const minRaw = 0;
      const maxRaw = Math.max(0, ...values);
      const ticks = niceTicks(minRaw, maxRaw, 5);
      const domainMin = ticks[0];
      const domainMax = ticks[ticks.length - 1];
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      type Column = {
        datum: ColumnPyramidChartDatum;
        tone: ColumnPyramidChartTone;
        points: string;
        cx: number;
        cy: number;
        labelX: number;
        labelY: number;
      };

      let columns: Column[] = [];
      if (validData.length !== 0) {
        const band = plotWidth / validData.length;
        const baseWidth = band * 0.7;
        const zeroY = MARGIN.top + scaleLinear(0, domainMin, domainMax, plotHeight, 0);
        columns = validData.map((d, i) => {
          const apexY = MARGIN.top + scaleLinear(d.value, domainMin, domainMax, plotHeight, 0);
          const cx = MARGIN.left + band * (i + 0.5);
          const leftX = cx - baseWidth / 2;
          const rightX = cx + baseWidth / 2;
          // Triangle: wide base on the X axis, apex centred at the value height.
          const points = `${leftX},${zeroY} ${rightX},${zeroY} ${cx},${apexY}`;
          return {
            datum: d,
            tone: (d.tone ?? defaultTone) as ColumnPyramidChartTone,
            points,
            cx,
            cy: apexY,
            labelX: cx,
            labelY: height - MARGIN.bottom + 16,
          };
        });
      }

      const dataValueItems = validData.map((d) => `${d.category}: ${d.value}`);

      const valueAxisTicks = ticks.map((tick) => ({
        value: tick,
        x1: MARGIN.left,
        x2: MARGIN.left + plotWidth,
        y: MARGIN.top + scaleLinear(tick, domainMin, domainMax, plotHeight, 0),
      }));

      const svgChildren: ReturnType<typeof h>[] = [];

      // gridlines + value axis ticks
      for (const tick of valueAxisTicks) {
        svgChildren.push(
          h("line", {
            key: `g${tick.value}`,
            class: "st-columnPyramidChart__grid",
            x1: tick.x1,
            x2: tick.x2,
            y1: tick.y,
            y2: tick.y,
          }),
          h(
            "text",
            {
              key: `t${tick.value}`,
              class: "st-columnPyramidChart__tickLabel",
              x: MARGIN.left - 6,
              y: tick.y,
              "text-anchor": "end",
              "dominant-baseline": "middle",
            },
            formatTick(tick.value),
          ),
        );
      }

      // axes
      svgChildren.push(
        h("line", {
          class: "st-columnPyramidChart__axis",
          x1: MARGIN.left,
          x2: MARGIN.left,
          y1: MARGIN.top,
          y2: height - MARGIN.bottom,
        }),
        h("line", {
          class: "st-columnPyramidChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      );

      // category labels
      for (const col of columns) {
        svgChildren.push(
          h(
            "text",
            {
              key: `cat-${col.datum.category}`,
              class: "st-columnPyramidChart__categoryLabel",
              x: col.labelX,
              y: col.labelY,
              "text-anchor": "middle",
            },
            col.datum.category,
          ),
        );
      }

      // pyramid columns (decorative, inside aria-hidden SVG)
      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        svgChildren.push(
          h("polygon", {
            key: `col-${col.datum.category}`,
            class: `st-columnPyramidChart__column st-columnPyramidChart__column--${col.tone}`,
            points: col.points,
            "data-chart-index": i,
          }),
        );
      }

      const hovered = hoveredIndex.value !== null ? columns[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-columnPyramidChart", props.class) }, [
        h(
          "div",
          {
            class: "st-columnPyramidChart__visual",
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
                class: "st-columnPyramidChart__tooltip",
                role: "presentation",
                style: `left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`,
              },
              [
                h("span", { class: "st-columnPyramidChart__tooltipLabel" }, hovered.datum.category),
                h("span", { class: "st-columnPyramidChart__tooltipValue" }, String(hovered.datum.value)),
              ],
            )
          : null,
      ]);
    };
  },
});
