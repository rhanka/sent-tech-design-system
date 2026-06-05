import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList, labelColorForTone } from "./chartScale.js";

export type FunnelChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type FunnelChartDatum = {
  label: string;
  value: number;
  tone?: FunnelChartTone;
};

export type FunnelChartProps = {
  data: FunnelChartDatum[];
  orientation?: "vertical" | "horizontal";
  showPercentages?: boolean;
  percentMode?: "ofFirst" | "ofPrevious";
  legend?: boolean;
  label: string;
  width?: number;
  height?: number;
  class?: string;
};

const MARGIN = { top: 16, right: 16, bottom: 16, left: 16 };
const GAP = 6;
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

/**
 * Magnitude normalisée d'une étape : un entonnoir ne représente que des
 * grandeurs positives. Les valeurs non finies ou négatives sont ramenées à 0.
 */
function magnitude(v: number): number {
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function formatPercent(p: number): string {
  if (!Number.isFinite(p)) return "0%";
  return `${p % 1 === 0 ? p.toFixed(0) : p.toFixed(1)}%`;
}

export const FunnelChart = defineComponent({
  name: "FunnelChart",
  props: {
    data: { type: Array as () => FunnelChartDatum[], required: true },
    orientation: { type: String as () => "vertical" | "horizontal", default: "vertical" },
    showPercentages: { type: Boolean, default: true },
    percentMode: { type: String as () => "ofFirst" | "ofPrevious", default: "ofFirst" },
    legend: { type: Boolean, default: false },
    label: { type: String, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
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
      const orientation = props.orientation ?? "vertical";
      const showPercentages = props.showPercentages ?? true;
      const percentMode = props.percentMode ?? "ofFirst";
      const legend = props.legend ?? false;
      const label = props.label;
      const width = props.width ?? 480;
      const height = props.height ?? 280;

      const first = magnitude(data[0]?.value ?? 0);
      const percents = data.map((d, i) => {
        const value = magnitude(d.value);
        const ref0 = percentMode === "ofPrevious" ? magnitude(data[i - 1]?.value ?? d.value) : first;
        return ref0 === 0 ? 0 : (value / ref0) * 100;
      });

      type Segment = {
        points: string;
        datum: FunnelChartDatum;
        tone: string;
        textColor: string;
        cx: number;
        cy: number;
        labelX: number;
        labelY: number;
        percent: number;
      };

      let segments: Segment[] = [];
      if (data.length !== 0) {
        const maxValue = Math.max(0, ...data.map((d) => magnitude(d.value)));
        const safeMax = maxValue === 0 ? 1 : maxValue;
        const plotW = Math.max(width - MARGIN.left - MARGIN.right, 1);
        const plotH = Math.max(height - MARGIN.top - MARGIN.bottom, 1);

        if (orientation === "vertical") {
          const band = plotH / data.length;
          const segH = Math.max(band - GAP, 1);
          const cx = MARGIN.left + plotW / 2;
          segments = data.map((d, i) => {
            const tone = d.tone ?? TONES[i % TONES.length];
            const topHalf = (magnitude(d.value) / safeMax) * (plotW / 2);
            const nextVal = data[i + 1] ? magnitude(data[i + 1].value) : magnitude(d.value);
            // Forme strictement décroissante : le bas ne dépasse jamais le haut.
            const botHalf = Math.min((nextVal / safeMax) * (plotW / 2), topHalf);
            const y0 = MARGIN.top + band * i;
            const y1 = y0 + segH;
            const points = [
              `${cx - topHalf},${y0}`,
              `${cx + topHalf},${y0}`,
              `${cx + botHalf},${y1}`,
              `${cx - botHalf},${y1}`,
            ].join(" ");
            return {
              points,
              datum: d,
              tone,
              textColor: labelColorForTone(tone),
              cx,
              cy: (y0 + y1) / 2,
              labelX: cx,
              labelY: (y0 + y1) / 2,
              percent: percents[i],
            };
          });
        } else {
          const band = plotW / data.length;
          const segW = Math.max(band - GAP, 1);
          const cy = MARGIN.top + plotH / 2;
          segments = data.map((d, i) => {
            const tone = d.tone ?? TONES[i % TONES.length];
            const leftHalf = (magnitude(d.value) / safeMax) * (plotH / 2);
            const nextVal = data[i + 1] ? magnitude(data[i + 1].value) : magnitude(d.value);
            const rightHalf = Math.min((nextVal / safeMax) * (plotH / 2), leftHalf);
            const x0 = MARGIN.left + band * i;
            const x1 = x0 + segW;
            const points = [
              `${x0},${cy - leftHalf}`,
              `${x1},${cy - rightHalf}`,
              `${x1},${cy + rightHalf}`,
              `${x0},${cy + leftHalf}`,
            ].join(" ");
            return {
              points,
              datum: d,
              tone,
              textColor: labelColorForTone(tone),
              cx: (x0 + x1) / 2,
              cy,
              labelX: (x0 + x1) / 2,
              labelY: cy,
              percent: percents[i],
            };
          });
        }
      }

      const dataValueItems = data.map((d, i) =>
        showPercentages ? `${d.label}: ${d.value} (${formatPercent(percents[i])})` : `${d.label}: ${d.value}`,
      );

      const legendItems = data.map((d, i) => ({ label: d.label, tone: d.tone ?? TONES[i % TONES.length] }));

      const hoveredIdx = hoveredIndex.value;

      const polygons = segments.map((seg, i) =>
        h("polygon", {
          key: `p${seg.datum.label}`,
          class: classNames(
            "st-funnelChart__segment",
            `st-funnelChart__segment--${seg.tone}`,
            hoveredIdx !== null && hoveredIdx !== i && "st-funnelChart__segment--dim",
          ),
          points: seg.points,
          "data-chart-index": i,
        }),
      );

      const textChildren: ReturnType<typeof h>[] = [];
      segments.forEach((seg) => {
        textChildren.push(
          h(
            "text",
            { key: `lbl${seg.datum.label}`, class: "st-funnelChart__label", x: seg.labelX, y: seg.labelY - 6, "text-anchor": "middle", "dominant-baseline": "middle", style: `fill: ${seg.textColor}` },
            seg.datum.label,
          ),
          h(
            "text",
            { key: `val${seg.datum.label}`, class: "st-funnelChart__value", x: seg.labelX, y: seg.labelY + 8, "text-anchor": "middle", "dominant-baseline": "middle", style: `fill: ${seg.textColor}` },
            showPercentages ? `${seg.datum.value} · ${formatPercent(seg.percent)}` : String(seg.datum.value),
          ),
        );
      });

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-funnelChart__visual",
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
              [...polygons, ...textChildren],
            ),
          ],
        ),
        chartDataList(label, dataValueItems),
      ];

      if (hoveredIdx !== null && segments[hoveredIdx]) {
        const seg = segments[hoveredIdx];
        children.push(
          h(
            "div",
            {
              class: "st-funnelChart__tooltip",
              role: "presentation",
              style: `left: ${(seg.cx / width) * 100}%; top: ${(seg.cy / height) * 100}%`,
            },
            [
              h("span", { class: "st-funnelChart__tooltipLabel" }, seg.datum.label),
              h(
                "span",
                { class: "st-funnelChart__tooltipValue" },
                showPercentages ? `${seg.datum.value} · ${formatPercent(seg.percent)}` : String(seg.datum.value),
              ),
            ],
          ),
        );
      }

      if (legend && legendItems.length > 0) {
        children.push(
          h(
            "ul",
            { class: "st-funnelChart__legend", "aria-hidden": "true" },
            legendItems.map((item) =>
              h("li", { key: item.label, class: "st-funnelChart__legendItem" }, [
                h("span", { class: `st-funnelChart__legendSwatch st-funnelChart__legendSwatch--${item.tone}`, "aria-hidden": "true" }),
                ` ${item.label}`,
              ]),
            ),
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-funnelChart", props.class) }, children);
    };
  },
});
