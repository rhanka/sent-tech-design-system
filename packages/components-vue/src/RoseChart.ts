import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type RoseChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type RoseChartDatum = {
  label: string;
  value: number;
  tone?: RoseChartTone;
};

export type RoseChartProps = {
  data: RoseChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: RoseChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function safeValue(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function point(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function sectorPath(cx: number, cy: number, radius: number, start: number, end: number): string {
  const safeEnd = Math.min(end, start + Math.PI * 2 - 0.0001);
  const large = safeEnd - start > Math.PI ? 1 : 0;
  const outerStart = point(cx, cy, radius, start);
  const outerEnd = point(cx, cy, radius, safeEnd);
  return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${radius} ${radius} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} Z`;
}

export const RoseChart = defineComponent({
  name: "RoseChart",
  props: {
    data: { type: Array as () => RoseChartDatum[], required: true },
    width: { type: Number, default: 320 },
    height: { type: Number, default: 320 },
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
      const width = props.width ?? 320;
      const height = props.height ?? 320;
      const label = props.label;

      const cx = width / 2;
      const cy = height / 2;
      const outerLimit = Math.max(Math.min(width, height) / 2 - 6, 1);
      const count = data.length;
      const maxValue = Math.max(0, ...data.map((datum) => safeValue(datum.value)));
      const safeMax = maxValue > 0 ? maxValue : 1;
      const sweep = count > 0 ? (Math.PI * 2) / count : Math.PI * 2;

      const sectors = data.map((datum, index) => {
        const value = safeValue(datum.value);
        // sqrt → aire du secteur ∝ value (honnête perceptuellement)
        const radius = Math.sqrt(value / safeMax) * outerLimit;
        const start = -Math.PI / 2 + sweep * index;
        const end = start + sweep;
        const midAngle = (start + end) / 2;
        const labelPoint = point(cx, cy, radius * 0.62, midAngle);
        return {
          datum,
          value,
          tone: datum.tone ?? TONES[index % TONES.length],
          radius,
          path: value > 0 ? sectorPath(cx, cy, radius, start, end) : "",
          labelX: labelPoint.x,
          labelY: labelPoint.y,
          showLabel: value > 0 && radius > outerLimit * 0.4,
        };
      });

      const svgChildren: ReturnType<typeof h>[] = [];

      sectors.forEach((sector, i) => {
        if (!sector.path) return;
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(
          h("path", {
            key: `s${sector.datum.label}`,
            class: classNames(
              "st-roseChart__sector",
              `st-roseChart__sector--${sector.tone}`,
              isDim ? "st-roseChart__sector--dim" : undefined,
            ),
            d: sector.path,
            "data-chart-index": i,
          }),
        );
      });

      sectors.forEach((sector) => {
        if (!sector.showLabel) return;
        svgChildren.push(
          h(
            "text",
            {
              key: `t${sector.datum.label}`,
              class: "st-roseChart__label",
              x: sector.labelX,
              y: sector.labelY,
              "text-anchor": "middle",
              "dominant-baseline": "middle",
              fill: contrastTextForTone(sector.tone),
            },
            sector.datum.label,
          ),
        );
      });

      const dataValueItems = data.map((datum) => `${datum.label}: ${formatNumber(safeValue(datum.value))}`);
      const hovered = hoveredIndex.value !== null ? sectors[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-roseChart", props.class) }, [
        h(
          "div",
          {
            class: "st-roseChart__visual",
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
        hovered && hovered.value > 0
          ? h(
              "div",
              {
                class: "st-roseChart__tooltip",
                role: "presentation",
                style: `left: ${(hovered.labelX / width) * 100}%; top: ${(hovered.labelY / height) * 100}%`,
              },
              [
                h("span", { class: "st-roseChart__tooltipLabel" }, hovered.datum.label),
                h("span", { class: "st-roseChart__tooltipValue" }, formatNumber(hovered.value)),
              ],
            )
          : null,
      ]);
    };
  },
});
