import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type VariablePieChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VariablePieChartDatum = {
  label: string;
  value: number;
  z: number;
  tone?: VariablePieChartTone;
};

export type VariablePieChartProps = {
  data: VariablePieChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: VariablePieChartTone[] = [
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

function safeZ(z: number): number {
  return Number.isFinite(z) ? z : 0;
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

export const VariablePieChart = defineComponent({
  name: "VariablePieChart",
  props: {
    data: { type: Array as () => VariablePieChartDatum[], required: true },
    width: { type: Number, default: 360 },
    height: { type: Number, default: 360 },
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
      const width = props.width ?? 360;
      const height = props.height ?? 360;
      const label = props.label;

      const cx = width / 2;
      const cy = height / 2;
      const outerLimit = Math.max(Math.min(width, height) / 2 - 6, 1);
      const rMin = outerLimit * 0.35;
      const rMax = outerLimit;

      // Filtre les parts à value ≤ 0 ou non-finie (angle nul → invisibles).
      const visible = data.filter((datum) => safeValue(datum.value) > 0);
      const total = visible.reduce((sum, datum) => sum + safeValue(datum.value), 0);
      const zValues = visible.map((datum) => safeZ(datum.z));
      const zMin = zValues.length > 0 ? Math.min(...zValues) : 0;
      const zMax = zValues.length > 0 ? Math.max(...zValues) : 0;
      const zSpan = zMax - zMin;

      const TWO_PI = Math.PI * 2;
      let angle = -Math.PI / 2; // départ en haut

      const sectors =
        total > 0
          ? visible.map((datum, index) => {
              const value = safeValue(datum.value);
              const z = safeZ(datum.z);
              // rayon ∝ z, mappé linéairement entre rMin et rMax.
              const radius = zSpan > 0 ? rMin + ((z - zMin) / zSpan) * (rMax - rMin) : rMax;
              const span = Math.min((value / total) * TWO_PI, TWO_PI - 0.0001);
              const start = angle;
              const end = angle + span;
              angle = end;
              const midAngle = (start + end) / 2;
              const labelPoint = point(cx, cy, radius * 0.62, midAngle);
              return {
                datum,
                value,
                z,
                tone: datum.tone ?? TONES[index % TONES.length],
                radius,
                path: sectorPath(cx, cy, radius, start, end),
                labelX: labelPoint.x,
                labelY: labelPoint.y,
                showLabel: span > 0.25 && radius > outerLimit * 0.4,
              };
            })
          : [];

      const svgChildren: ReturnType<typeof h>[] = [];

      sectors.forEach((sector, i) => {
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        svgChildren.push(
          h("path", {
            key: `s${sector.datum.label}`,
            class: classNames(
              "st-variablePieChart__sector",
              `st-variablePieChart__sector--${sector.tone}`,
              isDim ? "st-variablePieChart__sector--dim" : undefined,
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
              class: "st-variablePieChart__label",
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

      const dataValueItems = data
        .filter((datum) => safeValue(datum.value) > 0)
        .map((datum) => `${datum.label}: ${formatNumber(safeValue(datum.value))}`);
      const hovered = hoveredIndex.value !== null ? sectors[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-variablePieChart", props.class) }, [
        h(
          "div",
          {
            class: "st-variablePieChart__visual",
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
                class: "st-variablePieChart__tooltip",
                role: "presentation",
                style: `left: ${(hovered.labelX / width) * 100}%; top: ${(hovered.labelY / height) * 100}%`,
              },
              [
                h("span", { class: "st-variablePieChart__tooltipLabel" }, hovered.datum.label),
                h(
                  "span",
                  { class: "st-variablePieChart__tooltipValue" },
                  `${formatNumber(hovered.value)} · ${formatNumber(hovered.z)}`,
                ),
              ],
            )
          : null,
      ]);
    };
  },
});
