import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type RadarChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type RadarChartSeries = {
  label: string;
  values: number[];
  tone?: RadarChartTone;
};

export type RadarChartProps = {
  axes: string[];
  series: RadarChartSeries[];
  maxValue?: number;
  levels?: number;
  width?: number;
  height?: number;
  legend?: boolean;
  label: string;
  class?: string;
};

const TONES: RadarChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function pointAt(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

export const RadarChart = defineComponent({
  name: "RadarChart",
  props: {
    axes: { type: Array as () => string[], required: true },
    series: { type: Array as () => RadarChartSeries[], required: true },
    maxValue: { type: Number, default: undefined },
    levels: { type: Number, default: 4 },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 320 },
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
      const axes = props.axes ?? [];
      const series = props.series ?? [];
      const width = props.width ?? 360;
      const height = props.height ?? 320;
      const legend = props.legend ?? false;
      const label = props.label;
      const safeLevelCount = Math.max(1, Math.floor(props.levels ?? 4));

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(Math.min(width, height) / 2 - 42, 1);

      // domainMax: respect maxValue if provided, otherwise derive from data - NO floor at 100
      const allValues = series.flatMap((item) => item.values).filter(Number.isFinite);
      const domainMax =
        Number.isFinite(props.maxValue) && (props.maxValue ?? 0) > 0
          ? (props.maxValue as number)
          : Math.max(1, ...allValues);

      const axisEntries = axes.map((axis, i) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i) / Math.max(axes.length, 1);
        const [x, y] = pointAt(centerX, centerY, radius, angle);
        const [labelX, labelY] = pointAt(centerX, centerY, radius + 22, angle);
        return { axis, x, y, labelX, labelY, angle };
      });

      const polygons = series.map((item, seriesIndex) => {
        const tone = item.tone ?? TONES[seriesIndex % TONES.length];
        const points = axes.map((_, axisIndex) => {
          const value = Math.max(0, item.values[axisIndex] ?? 0);
          const scaled = Math.min(value / domainMax, 1) * radius;
          const angle = -Math.PI / 2 + (Math.PI * 2 * axisIndex) / Math.max(axes.length, 1);
          const [x, y] = pointAt(centerX, centerY, scaled, angle);
          return { x, y };
        });
        return { item, tone, points, pointString: points.map((p) => `${p.x},${p.y}`).join(" ") };
      });

      const svgChildren: ReturnType<typeof h>[] = [];

      // Grid rings (using levels prop, not hardcoded 4)
      Array.from({ length: safeLevelCount }, (_, ringIndex) => {
        const ringRadius = (radius * (ringIndex + 1)) / safeLevelCount;
        const ringPoints = axisEntries.map((a) => pointAt(centerX, centerY, ringRadius, a.angle)).map(([x, y]) => `${x},${y}`).join(" ");
        svgChildren.push(h("polygon", { key: `ring${ringIndex}`, class: "st-radarChart__ring", points: ringPoints }));
      });

      // Axes and labels
      axisEntries.forEach((axisEntry) => {
        svgChildren.push(
          h("line", { key: `a${axisEntry.axis}`, class: "st-radarChart__axis", x1: centerX, x2: axisEntry.x, y1: centerY, y2: axisEntry.y }),
          h(
            "text",
            {
              key: `l${axisEntry.axis}`,
              class: "st-radarChart__axisLabel",
              x: axisEntry.labelX,
              y: axisEntry.labelY,
              "text-anchor": "middle",
              "dominant-baseline": "middle",
            },
            axisEntry.axis,
          ),
        );
      });

      // Polygons + points
      polygons.forEach((polygon, i) => {
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(
          h("polygon", {
            key: polygon.item.label,
            class: classNames(
              "st-radarChart__polygon",
              `st-radarChart__polygon--${polygon.tone}`,
              isDim ? "st-radarChart__polygon--dim" : undefined,
            ),
            points: polygon.pointString,
            "data-chart-index": i,
          }),
        );
        polygon.points.forEach((point, pointIndex) => {
          svgChildren.push(
            h("circle", {
              key: `${polygon.item.label}-p${pointIndex}`,
              class: classNames("st-radarChart__point", `st-radarChart__point--${polygon.tone}`),
              cx: point.x,
              cy: point.y,
              r: "3",
              "data-chart-index": i,
            }),
          );
        });
      });

      const dataValueItems = series.flatMap((item) =>
        axes.map((axis, i) => `${item.label}, ${axis}: ${item.values[i] ?? 0}`),
      );
      const hovered = hoveredIndex.value !== null ? polygons[hoveredIndex.value] : undefined;

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-radarChart__visual",
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
          h("div", { class: "st-radarChart__tooltip", role: "presentation" }, [
            h("span", { class: "st-radarChart__tooltipLabel" }, hovered.item.label),
          ]),
        );
      }

      if (legend) {
        children.push(
          h(
            "ul",
            { class: "st-radarChart__legend", "aria-hidden": "true" },
            polygons.map((polygon) =>
              h("li", { key: polygon.item.label, class: "st-radarChart__legendItem" }, [
                h("span", { class: `st-radarChart__legendSwatch st-radarChart__legendSwatch--${polygon.tone}`, "aria-hidden": "true" }),
                ` ${polygon.item.label}`,
              ]),
            ),
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-radarChart", props.class) }, children);
    };
  },
});
