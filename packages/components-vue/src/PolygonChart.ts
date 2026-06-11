import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type PolygonChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type PolygonChartPoint = {
  x: number;
  y: number;
};

export type PolygonChartProps = {
  data: PolygonChartPoint[];
  label: string;
  tone?: PolygonChartTone;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 14, right: 18, bottom: 36, left: 48 } as const;

export const PolygonChart = defineComponent({
  name: "PolygonChart",
  props: {
    data: { type: Array as () => PolygonChartPoint[], required: true },
    label: { type: String, required: true },
    tone: { type: String as () => PolygonChartTone, default: "category1" },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 360 },
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
      const height = props.height ?? 360;
      const tone = props.tone ?? "category1";
      const label = props.label;

      // Non-finite coordinates are dropped before anything else.
      const validData = (props.data ?? []).filter((d) => Number.isFinite(d.x) && Number.isFinite(d.y));

      const xs = validData.map((d) => d.x);
      const ys = validData.map((d) => d.y);
      const xTicks = niceTicks(Math.min(...xs), Math.max(...xs));
      const yTicks = niceTicks(Math.min(...ys), Math.max(...ys));
      const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
      const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
      const xMin = xTicks[0];
      const xMax = xTicks[xTicks.length - 1];
      const yMin = yTicks[0];
      const yMax = yTicks[yTicks.length - 1];

      const points = validData.map((d) => ({
        cx: MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW),
        cy: MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0),
        datum: d,
      }));

      const polygonPoints = points.map((p) => `${p.cx},${p.cy}`).join(" ");

      const dataValueItems = validData.map((d) => `x ${d.x}, y ${d.y}`);

      const svgChildren: ReturnType<typeof h>[] = [];
      for (const t of yTicks) {
        const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
        svgChildren.push(
          h("line", { key: `gy${t}`, class: "st-polygonChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: y, y2: y }),
          h(
            "text",
            { key: `ty${t}`, class: "st-polygonChart__tick", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(t),
          ),
        );
      }
      for (const t of xTicks) {
        const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
        svgChildren.push(
          h(
            "text",
            { key: `tx${t}`, class: "st-polygonChart__tick", x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            formatTick(t),
          ),
        );
      }

      svgChildren.push(
        h("line", { class: "st-polygonChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", { class: "st-polygonChart__axis", x1: MARGIN.left, x2: width - MARGIN.right, y1: height - MARGIN.bottom, y2: height - MARGIN.bottom }),
      );

      if (points.length >= 2) {
        svgChildren.push(
          h("polygon", {
            class: classNames("st-polygonChart__polygon", `st-polygonChart__polygon--${tone}`),
            points: polygonPoints,
          }),
        );
      }

      points.forEach((p, i) => {
        svgChildren.push(
          h("circle", {
            key: `v${i}`,
            class: classNames("st-polygonChart__vertex", `st-polygonChart__vertex--${tone}`),
            cx: p.cx,
            cy: p.cy,
            r: 3.5,
            "data-chart-index": i,
          }),
        );
      });

      const hovered = hoveredIndex.value !== null ? points[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-polygonChart", props.class) }, [
        h(
          "div",
          {
            class: "st-polygonChart__visual",
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
                class: "st-polygonChart__tooltip",
                role: "presentation",
                style: `left: ${(hovered.cx / width) * 100}%; top: ${(hovered.cy / height) * 100}%`,
              },
              [h("span", { class: "st-polygonChart__tooltipValue" }, `x ${hovered.datum.x} · y ${hovered.datum.y}`)],
            )
          : null,
      ]);
    };
  },
});
