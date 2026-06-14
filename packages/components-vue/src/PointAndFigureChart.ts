import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type PointAndFigureChartMark = "x" | "o";

export type PointAndFigureChartDatum = {
  /** Position temporelle (timestamp ou index) — ignorée pour l'empilement. */
  date: number;
  /** Prix de clôture : pilote la formation des colonnes. */
  close: number;
};

export type PointAndFigureChartProps = {
  data: PointAndFigureChartDatum[];
  boxSize?: number;
  reversal?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 } as const;

export const PointAndFigureChart = defineComponent({
  name: "PointAndFigureChart",
  props: {
    data: { type: Array as () => PointAndFigureChartDatum[], default: () => [] },
    boxSize: { type: Number, default: undefined },
    reversal: { type: Number, default: 3 },
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
      const boxSize = props.boxSize;
      const reversal = props.reversal ?? 3;

      // Points valides : date et close finis.
      const validData = data.filter((d) => d && Number.isFinite(d.date) && Number.isFinite(d.close));

      const closes = validData.map((d) => d.close);
      const baseMin = closes.length ? Math.min(...closes) : 0;
      const effectiveBox =
        Number.isFinite(boxSize) && (boxSize as number) > 0
          ? (boxSize as number)
          : closes.length
            ? Math.max(...closes) - Math.min(...closes) > 0
              ? (Math.max(...closes) - Math.min(...closes)) / 20
              : 1
            : 1;

      const reversalBoxes = Math.max(1, Math.floor(Number.isFinite(reversal) ? reversal : 3));

      // Colonnes P&F : suite de X (hausse) ou de O (baisse), cases [low..high].
      const rawCols: { mark: PointAndFigureChartMark; low: number; high: number }[] = [];
      if (validData.length > 0 && effectiveBox > 0) {
        const boxIndex = (price: number) => Math.floor((price - baseMin) / effectiveBox + 1e-9);
        let mark: PointAndFigureChartMark | null = null;
        let low = 0;
        let high = 0;
        for (let i = 0; i < closes.length; i++) {
          const idx = boxIndex(closes[i]);
          if (mark === null) {
            mark = "x";
            low = idx;
            high = idx;
            continue;
          }
          if (mark === "x") {
            if (idx > high) {
              high = idx;
            } else if (idx <= high - reversalBoxes) {
              rawCols.push({ mark, low, high });
              mark = "o";
              high = high - 1;
              low = idx;
            }
          } else {
            if (idx < low) {
              low = idx;
            } else if (idx >= low + reversalBoxes) {
              rawCols.push({ mark, low, high });
              mark = "x";
              low = low + 1;
              high = idx;
            }
          }
        }
        if (mark !== null && high >= low) rawCols.push({ mark, low, high });
      }
      const pnfColumns = rawCols.map((c) => ({
        mark: c.mark,
        low: c.low,
        high: c.high,
        priceLow: baseMin + c.low * effectiveBox,
        priceHigh: baseMin + (c.high + 1) * effectiveBox,
      }));

      let priceMin: number;
      let priceMax: number;
      if (pnfColumns.length === 0) {
        priceMin = closes.length ? Math.min(...closes) : 0;
        priceMax = closes.length ? Math.max(...closes) : 0;
      } else {
        priceMin = Infinity;
        priceMax = -Infinity;
        for (const c of pnfColumns) {
          if (c.priceLow < priceMin) priceMin = c.priceLow;
          if (c.priceHigh > priceMax) priceMax = c.priceHigh;
        }
      }

      const yTicks = niceTicks(priceMin, priceMax);
      const yMin = yTicks[0];
      const yMax = yTicks[yTicks.length - 1];
      const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      const colW = pnfColumns.length > 0 ? plotW / pnfColumns.length : plotW;
      const glyph =
        Math.min(colW, scaleLinear(effectiveBox, 0, Math.max(yMax - yMin, effectiveBox), 0, plotH)) * 0.7;
      const marks: {
        key: string;
        mark: PointAndFigureChartMark;
        cx: number;
        cy: number;
        r: number;
        priceLow: number;
        priceHigh: number;
      }[] = [];
      pnfColumns.forEach((c, ci) => {
        const cx = MARGIN.left + colW * ci + colW / 2;
        for (let b = c.low; b <= c.high; b++) {
          const priceMid = baseMin + (b + 0.5) * effectiveBox;
          const cy = MARGIN.top + scaleLinear(priceMid, yMin, yMax, plotH, 0);
          marks.push({
            key: `${ci}-${b}`,
            mark: c.mark,
            cx,
            cy,
            r: Math.max(glyph / 2, 2),
            priceLow: c.priceLow,
            priceHigh: c.priceHigh,
          });
        }
      });

      const dataValueItems = pnfColumns.map(
        (c) => `${c.mark === "x" ? "X" : "O"} ${formatTick(c.priceLow)} → ${formatTick(c.priceHigh)}`,
      );

      const hoveredMark =
        hoveredKey.value === null ? null : marks.find((m) => m.key === hoveredKey.value) ?? null;

      const svgChildren: ReturnType<typeof h>[] = [];

      for (const t of yTicks) {
        const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
        svgChildren.push(
          h("line", {
            key: `gy${t}`,
            class: "st-pointAndFigureChart__grid",
            x1: MARGIN.left,
            x2: width - MARGIN.right,
            y1: y,
            y2: y,
          }),
          h(
            "text",
            {
              key: `ty${t}`,
              class: "st-pointAndFigureChart__tick",
              x: MARGIN.left - 6,
              y,
              "text-anchor": "end",
              "dominant-baseline": "middle",
            },
            formatTick(t),
          ),
        );
      }

      svgChildren.push(
        h("line", {
          class: "st-pointAndFigureChart__axis",
          x1: MARGIN.left,
          x2: MARGIN.left,
          y1: MARGIN.top,
          y2: height - MARGIN.bottom,
        }),
        h("line", {
          class: "st-pointAndFigureChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      );

      marks.forEach((m) => {
        if (m.mark === "x") {
          svgChildren.push(
            h(
              "g",
              {
                key: m.key,
                class: classNames(
                  "st-pointAndFigureChart__mark",
                  "st-pointAndFigureChart__mark--x",
                  hoveredKey.value !== null && hoveredKey.value !== m.key ? "st-pointAndFigureChart__mark--dim" : undefined,
                ),
                "data-chart-key": m.key,
              },
              [
                h("line", {
                  class: "st-pointAndFigureChart__glyph",
                  x1: m.cx - m.r,
                  y1: m.cy - m.r,
                  x2: m.cx + m.r,
                  y2: m.cy + m.r,
                  "data-chart-key": m.key,
                }),
                h("line", {
                  class: "st-pointAndFigureChart__glyph",
                  x1: m.cx - m.r,
                  y1: m.cy + m.r,
                  x2: m.cx + m.r,
                  y2: m.cy - m.r,
                  "data-chart-key": m.key,
                }),
              ],
            ),
          );
        } else {
          svgChildren.push(
            h("circle", {
              key: m.key,
              class: classNames(
                "st-pointAndFigureChart__mark",
                "st-pointAndFigureChart__mark--o",
                "st-pointAndFigureChart__glyph",
                hoveredKey.value !== null && hoveredKey.value !== m.key ? "st-pointAndFigureChart__mark--dim" : undefined,
              ),
              cx: m.cx,
              cy: m.cy,
              r: m.r,
              "data-chart-key": m.key,
            }),
          );
        }
      });

      const children: ReturnType<typeof h>[] = [
        h(
          "div",
          {
            class: "st-pointAndFigureChart__visual",
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

      const list = chartDataList(label ?? "point and figure", dataValueItems);
      if (list) children.push(list);

      if (hoveredMark) {
        children.push(
          h(
            "div",
            {
              class: "st-pointAndFigureChart__tooltip",
              role: "presentation",
              style: { left: `${(hoveredMark.cx / width) * 100}%`, top: `${(hoveredMark.cy / height) * 100}%` },
            },
            [
              h("span", { class: "st-pointAndFigureChart__tooltipLabel" }, hoveredMark.mark === "x" ? "X" : "O"),
              h(
                "span",
                { class: "st-pointAndFigureChart__tooltipValue" },
                `${formatTick(hoveredMark.priceLow)} → ${formatTick(hoveredMark.priceHigh)}`,
              ),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-pointAndFigureChart", props.class) }, children);
    };
  },
});
