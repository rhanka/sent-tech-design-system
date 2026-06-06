import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";

export type PackedBubblesChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type PackedBubblesChartDatum = {
  label: string;
  value: number;
  tone?: PackedBubblesChartTone;
};

export type PackedBubblesChartProps = {
  data: PackedBubblesChartDatum[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: PackedBubblesChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const PADDING = 2;
const LABEL_MIN_RADIUS = 18;

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

type Bubble = {
  label: string;
  value: number;
  tone: PackedBubblesChartTone;
  textColor: string;
  cx: number;
  cy: number;
  r: number;
  index: number;
};

export const PackedBubblesChart = defineComponent({
  name: "PackedBubblesChart",
  props: {
    data: { type: Array as () => PackedBubblesChartDatum[], required: true },
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
      const data = props.data;
      const width = props.width ?? 360;
      const height = props.height ?? 360;
      const label = props.label;

      const cx = width / 2;
      const cy = height / 2;

      const valid = data
        .map((datum, index) => ({ datum, index, value: magnitude(datum.value) }))
        .filter((entry) => entry.value > 0)
        .sort((a, b) => b.value - a.value);

      const bubbles: Bubble[] = [];

      if (valid.length > 0) {
        const maxValue = Math.max(...valid.map((entry) => entry.value));
        const limit = Math.max(Math.min(width, height) / 2 - 4, 1);
        const baseMax = Math.sqrt(maxValue);
        const targetMax = Math.min(limit * 0.42, limit);
        const radiusOf = (value: number) => Math.max((Math.sqrt(value) / baseMax) * targetMax, 3);

        const placed: Array<{ cx: number; cy: number; r: number }> = [];
        const collides = (x: number, y: number, r: number): boolean => {
          for (const p of placed) {
            const dx = x - p.cx;
            const dy = y - p.cy;
            const minDist = r + p.r + PADDING;
            if (dx * dx + dy * dy < minDist * minDist) return true;
          }
          return false;
        };

        valid.forEach((entry, order) => {
          const r = radiusOf(entry.value);
          let x = cx;
          let y = cy;

          if (placed.length > 0) {
            const step = Math.max(r * 0.5, 2);
            let angle = order * 2.399963;
            let radius = step;
            let found = false;
            for (let i = 0; i < 4000; i += 1) {
              x = cx + radius * Math.cos(angle);
              y = cy + radius * Math.sin(angle);
              if (!collides(x, y, r)) {
                found = true;
                break;
              }
              angle += 0.5;
              radius += step * 0.06;
            }
            if (!found) {
              x = cx + radius * Math.cos(angle);
              y = cy + radius * Math.sin(angle);
            }
          }

          placed.push({ cx: x, cy: y, r });
          const tone = entry.datum.tone ?? TONES[entry.index % TONES.length];
          bubbles.push({
            label: entry.datum.label,
            value: entry.value,
            tone,
            textColor: contrastTextForTone(tone),
            cx: x,
            cy: y,
            r,
            index: entry.index,
          });
        });
      }

      const bubbleNodes = bubbles.map((bubble) => {
        const inner: ReturnType<typeof h>[] = [
          h("circle", {
            class: classNames(
              "st-packedBubblesChart__circle",
              `st-packedBubblesChart__circle--${bubble.tone}`,
              hoveredIndex.value !== null && hoveredIndex.value !== bubble.index
                ? "st-packedBubblesChart__circle--dim"
                : undefined,
            ),
            cx: bubble.cx,
            cy: bubble.cy,
            r: bubble.r,
            "data-chart-index": bubble.index,
          }),
        ];
        if (bubble.r >= LABEL_MIN_RADIUS) {
          inner.push(
            h(
              "text",
              {
                class: "st-packedBubblesChart__label",
                x: bubble.cx,
                y: bubble.cy,
                "text-anchor": "middle",
                "dominant-baseline": "middle",
                fill: bubble.textColor,
                "data-chart-index": bubble.index,
              },
              bubble.label,
            ),
          );
        }
        return h(
          "g",
          { key: bubble.index, class: "st-packedBubblesChart__bubble", "data-chart-index": bubble.index },
          inner,
        );
      });

      const dataValueItems = data
        .filter((datum) => magnitude(datum.value) > 0)
        .map((datum) => `${datum.label}: ${datum.value}`);

      const hovered = hoveredIndex.value !== null ? bubbles.find((b) => b.index === hoveredIndex.value) : undefined;

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-packedBubblesChart__visual",
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
              bubbleNodes,
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
              class: "st-packedBubblesChart__tooltip",
              role: "presentation",
              style: `left: ${(hovered.cx / width) * 100}%; top: ${((hovered.cy - hovered.r) / height) * 100}%`,
            },
            [
              h("span", { class: "st-packedBubblesChart__tooltipLabel" }, hovered.label),
              h("span", { class: "st-packedBubblesChart__tooltipValue" }, String(hovered.value)),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-packedBubblesChart", props.class) }, children);
    };
  },
});
