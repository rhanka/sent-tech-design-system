import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, formatTick, niceTicks, scaleLinear } from "./chartScale.js";

export type VectorFieldChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type VectorFieldChartDatum = {
  x: number;
  y: number;
  /** Magnitude (≥ 0) : pilote la longueur normalisée et la couleur. */
  length: number;
  /** Direction en DEGRÉS (0° = +X, sens trigonométrique). */
  direction: number;
};

export type VectorFieldChartProps = {
  data: VectorFieldChartDatum[];
  label?: string;
  width?: number;
  height?: number;
  size?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 18, bottom: 36, left: 48 } as const;

const TONES: VectorFieldChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

export const VectorFieldChart = defineComponent({
  name: "VectorFieldChart",
  props: {
    data: { type: Array as () => VectorFieldChartDatum[], default: () => [] },
    label: { type: String, default: undefined },
    width: { type: Number, default: 640 },
    height: { type: Number, default: 320 },
    size: { type: Number, default: 26 },
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
      const size = props.size ?? 26;

      // Points valides : coordonnées finies, magnitude finie ≥ 0.
      const validData = data.filter(
        (d) =>
          d &&
          Number.isFinite(d.x) &&
          Number.isFinite(d.y) &&
          Number.isFinite(d.length) &&
          d.length >= 0 &&
          Number.isFinite(d.direction),
      );

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

      const maxLength = validData.reduce((max, d) => (d.length > max ? d.length : max), 0);

      // Une flèche par point : segment (base → pointe) + 2 traits de pointe.
      const arrows = validData.map((d, i) => {
        const cx = MARGIN.left + scaleLinear(d.x, xMin, xMax, 0, plotW);
        const cy = MARGIN.top + scaleLinear(d.y, yMin, yMax, plotH, 0);
        const max = maxLength > 0 ? maxLength : 1;
        const len = (d.length / max) * size;
        const rad = (d.direction * Math.PI) / 180;
        const dx = Math.cos(rad) * len;
        const dy = -Math.sin(rad) * len;
        const x1 = cx - dx / 2;
        const y1 = cy - dy / 2;
        const x2 = cx + dx / 2;
        const y2 = cy + dy / 2;
        const head = Math.min(Math.max(len * 0.28, 3), 8);
        const headAngle = (28 * Math.PI) / 180;
        const baseAngle = Math.atan2(y2 - y1, x2 - x1);
        const hx1 = x2 - head * Math.cos(baseAngle - headAngle);
        const hy1 = y2 - head * Math.sin(baseAngle - headAngle);
        const hx2 = x2 - head * Math.cos(baseAngle + headAngle);
        const hy2 = y2 - head * Math.sin(baseAngle + headAngle);
        const bin = Math.min(Math.floor((d.length / max) * TONES.length), TONES.length - 1);
        return {
          key: `${i}`,
          datum: d,
          cx,
          cy,
          x1,
          y1,
          x2,
          y2,
          hx1,
          hy1,
          hx2,
          hy2,
          tone: TONES[Math.max(0, bin)],
        };
      });

      const dataValueItems = validData.map(
        (d) => `x ${d.x}, y ${d.y} · |v| ${formatTick(d.length)} @ ${formatTick(d.direction)}°`,
      );

      const hoveredArrow =
        hoveredKey.value === null ? null : arrows.find((a) => a.key === hoveredKey.value) ?? null;

      const svgChildren: ReturnType<typeof h>[] = [];
      for (const t of yTicks) {
        const y = MARGIN.top + scaleLinear(t, yMin, yMax, plotH, 0);
        svgChildren.push(
          h("line", { key: `gy${t}`, class: "st-vectorFieldChart__grid", x1: MARGIN.left, x2: width - MARGIN.right, y1: y, y2: y }),
          h(
            "text",
            { key: `ty${t}`, class: "st-vectorFieldChart__tick", x: MARGIN.left - 6, y, "text-anchor": "end", "dominant-baseline": "middle" },
            formatTick(t),
          ),
        );
      }
      for (const t of xTicks) {
        const x = MARGIN.left + scaleLinear(t, xMin, xMax, 0, plotW);
        svgChildren.push(
          h(
            "text",
            { key: `tx${t}`, class: "st-vectorFieldChart__tick", x, y: height - MARGIN.bottom + 16, "text-anchor": "middle" },
            formatTick(t),
          ),
        );
      }

      svgChildren.push(
        h("line", { class: "st-vectorFieldChart__axis", x1: MARGIN.left, x2: MARGIN.left, y1: MARGIN.top, y2: height - MARGIN.bottom }),
        h("line", {
          class: "st-vectorFieldChart__axis",
          x1: MARGIN.left,
          x2: width - MARGIN.right,
          y1: height - MARGIN.bottom,
          y2: height - MARGIN.bottom,
        }),
      );

      arrows.forEach((a) => {
        svgChildren.push(
          h(
            "g",
            {
              key: a.key,
              class: classNames(
                "st-vectorFieldChart__arrow",
                `st-vectorFieldChart__arrow--${a.tone}`,
                hoveredKey.value !== null && hoveredKey.value !== a.key ? "st-vectorFieldChart__arrow--dim" : undefined,
              ),
            },
            [
              h("line", { class: "st-vectorFieldChart__shaft", x1: a.x1, y1: a.y1, x2: a.x2, y2: a.y2, "data-chart-key": a.key }),
              h("line", { class: "st-vectorFieldChart__head", x1: a.x2, y1: a.y2, x2: a.hx1, y2: a.hy1 }),
              h("line", { class: "st-vectorFieldChart__head", x1: a.x2, y1: a.y2, x2: a.hx2, y2: a.hy2 }),
            ],
          ),
        );
      });

      const children: ReturnType<typeof h>[] = [
        h(
          "div",
          {
            class: "st-vectorFieldChart__visual",
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

      const list = chartDataList(label ?? "vector field", dataValueItems);
      if (list) children.push(list);

      if (hoveredArrow) {
        children.push(
          h(
            "div",
            {
              class: "st-vectorFieldChart__tooltip",
              role: "presentation",
              style: { left: `${(hoveredArrow.cx / width) * 100}%`, top: `${(hoveredArrow.cy / height) * 100}%` },
            },
            [
              h("span", { class: "st-vectorFieldChart__tooltipLabel" }, `x ${hoveredArrow.datum.x} · y ${hoveredArrow.datum.y}`),
              h(
                "span",
                { class: "st-vectorFieldChart__tooltipValue" },
                `|v| ${formatTick(hoveredArrow.datum.length)} @ ${formatTick(hoveredArrow.datum.direction)}°`,
              ),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-vectorFieldChart", props.class) }, children);
    };
  },
});
