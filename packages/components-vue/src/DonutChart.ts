import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type DonutChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DonutChartDatum = {
  label: string;
  value: number;
  tone?: DonutChartTone;
};

export type DonutChartProps = {
  data: DonutChartDatum[];
  size?: number;
  thickness?: number;
  centerLabel?: string | null;
  label: string;
  class?: string;
};

const TONES: DonutChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const fmtPct = (p: number) => `${p.toFixed(p < 10 ? 1 : 0)}%`;

type Slice = { d: DonutChartDatum; path: string; tone: DonutChartTone; pct: number };

export const DonutChart = defineComponent({
  name: "DonutChart",
  props: {
    data: { type: Array as () => DonutChartDatum[], required: true },
    size: { type: Number, default: 220 },
    thickness: { type: Number, default: 34 },
    centerLabel: { type: [String, null] as unknown as () => string | null, default: undefined },
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
      const size = props.size ?? 220;
      const thickness = props.thickness ?? 34;
      const centerLabel = props.centerLabel;
      const label = props.label;
      const data = props.data;

      const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
      let items: Slice[] = [];
      if (total > 0) {
        const cx = size / 2;
        const cy = size / 2;
        const rOuter = size / 2 - 2;
        const rInner = Math.max(rOuter - thickness, 1);
        const TWO_PI = Math.PI * 2;
        let angle = -Math.PI / 2;
        const polar = (r: number, a: number): [number, number] => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
        items = data.map((d, i) => {
          const frac = Math.max(d.value, 0) / total;
          const span = Math.min(frac * TWO_PI, TWO_PI - 0.0001);
          const a0 = angle;
          const a1 = angle + span;
          angle = a1;
          const large = span > Math.PI ? 1 : 0;
          const [x0o, y0o] = polar(rOuter, a0);
          const [x1o, y1o] = polar(rOuter, a1);
          const [x1i, y1i] = polar(rInner, a1);
          const [x0i, y0i] = polar(rInner, a0);
          const path = `M ${x0o} ${y0o} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${rInner} ${rInner} 0 ${large} 0 ${x0i} ${y0i} Z`;
          return { d, path, tone: d.tone ?? TONES[i % TONES.length], pct: frac * 100 };
        });
      }

      const dataValueItems = items.map((slice) => `${slice.d.label}: ${slice.d.value} (${fmtPct(slice.pct)})`);

      const svgChildren: ReturnType<typeof h>[] = [];
      if (total > 0) {
        for (let i = 0; i < items.length; i++) {
          const slice = items[i];
          svgChildren.push(
            h("path", {
              key: slice.d.label,
              class: classNames(
                "st-donutChart__slice",
                `st-donutChart__slice--${slice.tone}`,
                hoveredIndex.value !== null && hoveredIndex.value !== i && "st-donutChart__slice--dim",
              ),
              d: slice.path,
              "data-chart-index": i,
            }),
          );
        }
        if (centerLabel !== null) {
          svgChildren.push(
            h(
              "text",
              {
                class: "st-donutChart__center",
                x: size / 2,
                y: size / 2,
                "text-anchor": "middle",
                "dominant-baseline": "central",
              },
              String(centerLabel ?? total),
            ),
          );
        }
      }

      const hovered = hoveredIndex.value !== null ? items[hoveredIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-donutChart", props.class) }, [
        h(
          "div",
          {
            class: "st-donutChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handleVisualPointerMove,
            onPointerleave: handleLeave,
          },
          [
            h(
              "svg",
              {
                viewBox: `0 0 ${size} ${size}`,
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
          ? h("div", { class: "st-donutChart__tooltip", role: "presentation" }, [
              h("span", { class: "st-donutChart__tooltipLabel" }, hovered.d.label),
              h("span", { class: "st-donutChart__tooltipValue" }, `${hovered.d.value} · ${fmtPct(hovered.pct)}`),
            ])
          : null,
      ]);
    };
  },
});
