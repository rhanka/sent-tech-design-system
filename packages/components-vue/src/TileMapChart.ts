import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type TileMapChartTile = {
  label: string;
  col: number;
  row: number;
  value: number;
};

export type TileMapChartProps = {
  data: TileMapChartTile[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 44, left: 16 } as const;
const TONES = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
] as const;
const GAP = 4;

function toneForValue(value: number, min: number, max: number): (typeof TONES)[number] {
  if (!Number.isFinite(value) || max <= min) return "category1";
  const index = Math.max(0, Math.min(TONES.length - 1, Math.floor(((value - min) / (max - min)) * TONES.length)));
  return TONES[index];
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "0";
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.?0+$/, "");
}

export const TileMapChart = defineComponent({
  name: "TileMapChart",
  props: {
    data: { type: Array as () => TileMapChartTile[], required: true },
    width: { type: Number, default: 480 },
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
      const width = props.width ?? 480;
      const height = props.height ?? 360;
      const label = props.label;

      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      const valid = data.filter(
        (tile) => Number.isFinite(tile.col) && Number.isFinite(tile.row) && Number.isFinite(tile.value),
      );

      const tiles =
        valid.length > 0
          ? (() => {
              const cols = Math.max(...valid.map((t) => t.col)) + 1;
              const rows = Math.max(...valid.map((t) => t.row)) + 1;
              const values = valid.map((t) => t.value);
              const min = Math.min(...values);
              const max = Math.max(...values);

              const side = Math.max(Math.min(plotWidth / cols, plotHeight / rows) - GAP, 1);
              const gridW = cols * (side + GAP) - GAP;
              const gridH = rows * (side + GAP) - GAP;
              const offsetX = MARGIN.left + Math.max((plotWidth - gridW) / 2, 0);
              const offsetY = MARGIN.top + Math.max((plotHeight - gridH) / 2, 0);

              return valid.map((tile, index) => {
                const x = offsetX + tile.col * (side + GAP);
                const y = offsetY + tile.row * (side + GAP);
                return {
                  tile,
                  index,
                  tone: toneForValue(tile.value, min, max),
                  x,
                  y,
                  side,
                  cx: x + side / 2,
                  cy: y + side / 2,
                };
              });
            })()
          : [];

      const dataValueItems = valid.map((tile) => `${tile.label}: ${formatNumber(tile.value)}`);

      const svgChildren: ReturnType<typeof h>[] = [];

      tiles.forEach((tile, i) => {
        const isDim = hoveredIndex.value !== null && hoveredIndex.value !== i;
        const groupChildren: ReturnType<typeof h>[] = [
          h("rect", {
            class: classNames(
              "st-tileMapChart__tile",
              `st-tileMapChart__tile--${tile.tone}`,
              isDim ? "st-tileMapChart__tile--dim" : undefined,
            ),
            x: tile.x,
            y: tile.y,
            width: tile.side,
            height: tile.side,
            rx: "3",
            "data-chart-index": i,
          }),
        ];
        if (tile.side > 18) {
          groupChildren.push(
            h(
              "text",
              {
                class: "st-tileMapChart__tileLabel",
                x: tile.cx,
                y: tile.cy,
                "text-anchor": "middle",
                "dominant-baseline": "middle",
                "pointer-events": "none",
              },
              tile.tile.label,
            ),
          );
        }
        svgChildren.push(h("g", { key: `${tile.tile.label}-${i}` }, groupChildren));
      });

      const hovered = hoveredIndex.value !== null ? tiles[hoveredIndex.value] : undefined;

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-tileMapChart__visual",
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
              class: "st-tileMapChart__tooltip",
              role: "presentation",
              style: `left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`,
            },
            [
              h("span", { class: "st-tileMapChart__tooltipLabel" }, hovered.tile.label),
              h("span", { class: "st-tileMapChart__tooltipValue" }, formatNumber(hovered.tile.value)),
            ],
          ),
        );
      }

      children.push(
        h("div", { class: "st-tileMapChart__legend", "aria-hidden": "true" }, [
          h("span", { class: "st-tileMapChart__legendText" }, "Low"),
          h(
            "span",
            { class: "st-tileMapChart__legendRamp" },
            TONES.map((tone) =>
              h("span", { key: tone, class: `st-tileMapChart__legendSwatch st-tileMapChart__legendSwatch--${tone}` }),
            ),
          ),
          h("span", { class: "st-tileMapChart__legendText" }, "High"),
        ]),
      );

      return h("div", { ...attrs, class: classNames("st-tileMapChart", props.class) }, children);
    };
  },
});
