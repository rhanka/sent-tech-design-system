import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type ContourChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ContourChartScale = "categorical" | "sequential";

export type ContourChartDatum = {
  x: number;
  y: number;
  /** Valeur scalaire de la cellule : pilote la bande de couleur. */
  value: number;
};

export type ContourChartProps = {
  data: ContourChartDatum[];
  levels?: number;
  scale?: ContourChartScale;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 } as const;

const TONES: ContourChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function normalizedScale(value: ContourChartScale | undefined): ContourChartScale {
  return value === "categorical" ? "categorical" : "sequential";
}

export const ContourChart = defineComponent({
  name: "ContourChart",
  props: {
    data: { type: Array as () => ContourChartDatum[], default: () => [] },
    levels: { type: Number, default: 6 },
    scale: { type: String as () => ContourChartScale, default: "sequential" },
    label: { type: String, default: undefined },
    width: { type: Number, default: 640 },
    height: { type: Number, default: 320 },
    size: { type: Number, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredKey = ref<string | null>(null);

    function handlePointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hoveredKey.value = null;
        return;
      }
      hoveredKey.value = target.getAttribute("data-chart-key");
    }

    return () => {
      const data = props.data ?? [];
      const label = props.label;
      const width = props.width ?? 640;
      const height = props.height ?? 320;
      const levels = props.levels ?? 6;
      const resolvedScale = normalizedScale(props.scale);

      // Points valides : coordonnées finies, valeur finie.
      const validData = data.filter(
        (d) => d && Number.isFinite(d.x) && Number.isFinite(d.y) && Number.isFinite(d.value),
      );

      // Nombre de paliers effectif : entier ≥ 1, plafonné à 8 (les tons disponibles).
      const levelCount = Math.max(1, Math.min(TONES.length, Math.floor(Number.isFinite(levels) ? levels : 6)));

      const vals = validData.map((d) => d.value);
      const valueMin = vals.length ? Math.min(...vals) : 0;
      const valueMax = vals.length ? Math.max(...vals) : 0;

      const toneForBand = (band: number): ContourChartTone => {
        const toneIndex = Math.max(
          0,
          Math.min(TONES.length - 1, Math.floor((band / Math.max(levelCount - 1, 1)) * (TONES.length - 1))),
        );
        return TONES[toneIndex];
      };

      const bandOf = (value: number): { band: number; tone: ContourChartTone } => {
        const ratio = valueMax > valueMin ? (value - valueMin) / (valueMax - valueMin) : 0;
        const band = Math.max(0, Math.min(levelCount - 1, Math.floor(ratio * levelCount)));
        return { band, tone: toneForBand(band) };
      };

      const xs = validData.map((d) => d.x);
      const ys = validData.map((d) => d.y);
      const xValues = Array.from(new Set(xs)).sort((a, b) => a - b);
      const yValues = Array.from(new Set(ys)).sort((a, b) => a - b);
      const xIndexByValue = new Map(xValues.map((value, index) => [value, index]));
      const yIndexByValue = new Map(yValues.map((value, index) => [value, index]));
      const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
      const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
      const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
      const xMin = xTicks[0];
      const xMax = xTicks[xTicks.length - 1];
      const yMin = yTicks[0];
      const yMax = yTicks[yTicks.length - 1];

      const dx = xValues.length > 1 ? xValues[1] - xValues[0] : 1;
      const dy = yValues.length > 1 ? yValues[1] - yValues[0] : 1;

      // Une bande rectangulaire par cellule de grille, peinte selon sa value.
      const cells = validData.map((d, i) => {
        const left = MARGIN.left + scaleLinear(d.x - dx / 2, xMin, xMax, 0, plotW);
        const right = MARGIN.left + scaleLinear(d.x + dx / 2, xMin, xMax, 0, plotW);
        const top = MARGIN.top + scaleLinear(d.y + dy / 2, yMin, yMax, plotH, 0);
        const bottom = MARGIN.top + scaleLinear(d.y - dy / 2, yMin, yMax, plotH, 0);
        const { band, tone } = bandOf(d.value);
        return {
          key: `${i}`,
          datum: d,
          band,
          col: xIndexByValue.get(d.x) ?? 0,
          row: yIndexByValue.get(d.y) ?? 0,
          x: Math.min(left, right),
          y: Math.min(top, bottom),
          width: Math.abs(right - left),
          height: Math.abs(bottom - top),
          cx: (left + right) / 2,
          cy: (top + bottom) / 2,
          tone,
        };
      });

      const cellByGridKey = new Map(cells.map((cell) => [`${cell.col}:${cell.row}`, cell] as const));
      const contourSegments = cells.flatMap((cell) => {
        const segments = [];
        const right = cellByGridKey.get(`${cell.col + 1}:${cell.row}`);
        if (right && right.band !== cell.band) {
          segments.push({
            key: `${cell.key}:right`,
            x1: cell.x + cell.width,
            y1: cell.y,
            x2: cell.x + cell.width,
            y2: cell.y + cell.height,
          });
        }
        const upper = cellByGridKey.get(`${cell.col}:${cell.row + 1}`);
        if (upper && upper.band !== cell.band) {
          segments.push({
            key: `${cell.key}:top`,
            x1: cell.x,
            y1: cell.y,
            x2: cell.x + cell.width,
            y2: cell.y,
          });
        }
        return segments;
      });

      const dataValueItems = validData.map((d) => `x ${d.x}, y ${d.y} · ${formatTick(d.value)}`);

      const legendItems = Array.from({ length: levelCount }, (_, band) => ({ band, tone: toneForBand(band) }));
      const hasLegend = validData.length > 0;

      const hoveredCell =
        hoveredKey.value === null ? null : cells.find((c) => c.key === hoveredKey.value) ?? null;

      const svgChildren: ReturnType<typeof h>[] = [];

      cells.forEach((cell) => {
        svgChildren.push(
          h("rect", {
            key: cell.key,
            class: classNames(
              "st-contourChart__cell",
              `st-contourChart__cell--${cell.tone}`,
              hoveredKey.value !== null && hoveredKey.value !== cell.key ? "st-contourChart__cell--dim" : undefined,
            ),
            x: cell.x,
            y: cell.y,
            width: cell.width,
            height: cell.height,
            "data-chart-key": cell.key,
          }),
        );
      });

      contourSegments.forEach((segment) => {
        svgChildren.push(
          h("line", {
            key: segment.key,
            class: "st-contourChart__isoline",
            x1: segment.x1,
            y1: segment.y1,
            x2: segment.x2,
            y2: segment.y2,
          }),
        );
      });

      for (const t of yTicks) {
        const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
        svgChildren.push(
          h("line", { key: `gy${t}`, class: "st-contourChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: y, y2: y }),
          h(
            "text",
            { key: `ty${t}`, class: "st-contourChart__tick", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(t),
          ),
        );
      }
      for (const t of xTicks) {
        const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
        svgChildren.push(
          h(
            "text",
            { key: `tx${t}`, class: "st-contourChart__tick", x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            formatTick(t),
          ),
        );
      }

      svgChildren.push(
        h("line", { class: "st-contourChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", {
          class: "st-contourChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      );

      const children: ReturnType<typeof h>[] = [
        h(
          "div",
          {
            class: "st-contourChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handlePointerMove,
            onPointerleave: () => (hoveredKey.value = null),
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
      ];

      if (hasLegend) {
        children.push(
          h("div", { class: "st-contourChart__legend", "aria-hidden": "true" }, [
            h("span", { class: "st-contourChart__legendText" }, "Low"),
            h(
              "span",
              { class: "st-contourChart__legendRamp" },
              legendItems.map((item) =>
                h("span", {
                  key: item.band,
                  class: classNames("st-contourChart__legendSwatch", `st-contourChart__legendSwatch--${item.tone}`),
                }),
              ),
            ),
            h("span", { class: "st-contourChart__legendText" }, "High"),
          ]),
        );
      }

      const list = chartDataList(label ?? "contour", dataValueItems);
      if (list) children.push(list);

      if (hoveredCell) {
        children.push(
          h(
            "div",
            {
              class: "st-contourChart__tooltip",
              role: "presentation",
              style: { left: `${(hoveredCell.cx / width) * 100}%`, top: `${(hoveredCell.cy / height) * 100}%` },
            },
            [
              h("span", { class: "st-contourChart__tooltipLabel" }, `x ${hoveredCell.datum.x} · y ${hoveredCell.datum.y}`),
              h("span", { class: "st-contourChart__tooltipValue" }, `${formatTick(hoveredCell.datum.value)}`),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-contourChart", `st-contourChart--${resolvedScale}`, props.class) }, children);
    };
  },
});
