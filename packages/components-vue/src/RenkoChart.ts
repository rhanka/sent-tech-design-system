import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type RenkoChartDirection = "up" | "down";

export type RenkoChartDatum = {
  /** Position temporelle (timestamp ou index) — ignorée pour l'empilement. */
  date: number;
  /** Prix de clôture : pilote la formation des briques. */
  close: number;
};

export type RenkoChartProps = {
  data: RenkoChartDatum[];
  boxSize?: number;
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 52 } as const;

export const RenkoChart = defineComponent({
  name: "RenkoChart",
  props: {
    data: { type: Array as () => RenkoChartDatum[], default: () => [] },
    boxSize: { type: Number, default: undefined },
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

      // Points valides : date et close finis.
      const validData = data.filter((d) => d && Number.isFinite(d.date) && Number.isFinite(d.close));

      // Taille de brique effective : `boxSize` fini > 0, sinon auto ~ (max-min)/20.
      const closes = validData.map((d) => d.close);
      const effectiveBox =
        Number.isFinite(boxSize) && (boxSize as number) > 0
          ? (boxSize as number)
          : closes.length
            ? Math.max(...closes) - Math.min(...closes) > 0
              ? (Math.max(...closes) - Math.min(...closes)) / 20
              : 1
            : 1;

      // Briques Renko : une par franchissement de `box` ; inversion = 2×box
      // avec une première brique du nouveau sens décalée d'un cran.
      const bricks: { bottom: number; top: number; direction: RenkoChartDirection }[] = [];
      if (validData.length > 0 && effectiveBox > 0) {
        let base = validData[0].close;
        let direction: RenkoChartDirection | null = null;
        for (let i = 1; i < validData.length; i++) {
          const price = validData[i].close;

          if (direction !== "down") {
            while (price >= base + effectiveBox) {
              bricks.push({ bottom: base, top: base + effectiveBox, direction: "up" });
              base += effectiveBox;
              direction = "up";
            }
          }

          if (direction === "up") {
            if (price <= base - 2 * effectiveBox) {
              base -= effectiveBox;
              do {
                bricks.push({ bottom: base - effectiveBox, top: base, direction: "down" });
                base -= effectiveBox;
                direction = "down";
              } while (price <= base - effectiveBox);
            }
            continue;
          }

          while (price <= base - effectiveBox) {
            bricks.push({ bottom: base - effectiveBox, top: base, direction: "down" });
            base -= effectiveBox;
            direction = "down";
          }

          if (direction === "down" && price >= base + 2 * effectiveBox) {
            base += effectiveBox;
            do {
              bricks.push({ bottom: base, top: base + effectiveBox, direction: "up" });
              base += effectiveBox;
              direction = "up";
            } while (price >= base + effectiveBox);
          }
        }
      }

      let priceMin: number;
      let priceMax: number;
      if (bricks.length === 0) {
        priceMin = closes.length ? Math.min(...closes) : 0;
        priceMax = closes.length ? Math.max(...closes) : 0;
      } else {
        priceMin = Infinity;
        priceMax = -Infinity;
        for (const b of bricks) {
          if (b.bottom < priceMin) priceMin = b.bottom;
          if (b.top > priceMax) priceMax = b.top;
        }
      }

      const yTicks = niceTicks(priceMin, priceMax);
      const yMin = yTicks[0];
      const yMax = yTicks[yTicks.length - 1];
      const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

      const colW = bricks.length > 0 ? plotW / bricks.length : plotW;
      const brickW = colW * 0.86;
      const columns = bricks.map((b, i) => {
        const cx = MARGIN.left + colW * i + colW / 2;
        const top = MARGIN.top + scaleLinear(b.top, yMin, yMax, plotH, 0);
        const bottom = MARGIN.top + scaleLinear(b.bottom, yMin, yMax, plotH, 0);
        return {
          key: `${i}`,
          brick: b,
          x: cx - brickW / 2,
          y: Math.min(top, bottom),
          width: brickW,
          height: Math.max(Math.abs(bottom - top), 0.5),
          cx,
          cy: (top + bottom) / 2,
          direction: b.direction,
        };
      });

      const dataValueItems = columns.map(
        (c) => `${c.direction === "up" ? "▲" : "▼"} ${formatTick(c.brick.bottom)} → ${formatTick(c.brick.top)}`,
      );

      const hoveredColumn =
        hoveredKey.value === null ? null : columns.find((c) => c.key === hoveredKey.value) ?? null;

      const svgChildren: ReturnType<typeof h>[] = [];

      for (const t of yTicks) {
        const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
        svgChildren.push(
          h("line", { key: `gy${t}`, class: "st-renkoChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: y, y2: y }),
          h(
            "text",
            { key: `ty${t}`, class: "st-renkoChart__tick", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(t),
          ),
        );
      }

      svgChildren.push(
        h("line", { class: "st-renkoChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", {
          class: "st-renkoChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      );

      columns.forEach((c) => {
        svgChildren.push(
          h("rect", {
            key: c.key,
            class: classNames(
              "st-renkoChart__brick",
              `st-renkoChart__brick--${c.direction}`,
              hoveredKey.value !== null && hoveredKey.value !== c.key ? "st-renkoChart__brick--dim" : undefined,
            ),
            x: c.x,
            y: c.y,
            width: c.width,
            height: c.height,
            "data-chart-key": c.key,
          }),
        );
      });

      const children: ReturnType<typeof h>[] = [
        h(
          "div",
          {
            class: "st-renkoChart__visual",
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

      const list = chartDataList(label ?? "renko", dataValueItems);
      if (list) children.push(list);

      if (hoveredColumn) {
        children.push(
          h(
            "div",
            {
              class: "st-renkoChart__tooltip",
              role: "presentation",
              style: { left: `${(hoveredColumn.cx / width) * 100}%`, top: `${(hoveredColumn.cy / height) * 100}%` },
            },
            [
              h("span", { class: "st-renkoChart__tooltipLabel" }, hoveredColumn.direction === "up" ? "▲" : "▼"),
              h(
                "span",
                { class: "st-renkoChart__tooltipValue" },
                `${formatTick(hoveredColumn.brick.bottom)} → ${formatTick(hoveredColumn.brick.top)}`,
              ),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-renkoChart", props.class) }, children);
    };
  },
});
