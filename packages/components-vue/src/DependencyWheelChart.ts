import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import { contrastTextForTone } from "./chartContrast.js";
import { GraphLegend } from "./GraphLegend.js";

export type DependencyWheelChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type DependencyWheelChartLink = {
  from: string;
  to: string;
  weight: number;
};

export type DependencyWheelChartProps = {
  data: DependencyWheelChartLink[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: DependencyWheelChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const GAP = 0.04;
const ARC_WIDTH = 12;

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function polar(cx: number, cy: number, radius: number, angle: number): [number, number] {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function arcPath(cx: number, cy: number, inner: number, outer: number, start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  const [x0o, y0o] = polar(cx, cy, outer, start);
  const [x1o, y1o] = polar(cx, cy, outer, end);
  const [x1i, y1i] = polar(cx, cy, inner, end);
  const [x0i, y0i] = polar(cx, cy, inner, start);
  return `M ${x0o} ${y0o} A ${outer} ${outer} 0 ${large} 1 ${x1o} ${y1o} L ${x1i} ${y1i} A ${inner} ${inner} 0 ${large} 0 ${x0i} ${y0i} Z`;
}

type ArcDatum = {
  id: string;
  tone: DependencyWheelChartTone;
  value: number;
  span: number;
  path: string;
  labelX: number;
  labelY: number;
  textColor: string;
};

type RibbonDatum = {
  index: number;
  from: string;
  to: string;
  weight: number;
  tone: DependencyWheelChartTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

type LegendDatum = { label: string; shape: "circle"; tone: DependencyWheelChartTone };

export const DependencyWheelChart = defineComponent({
  name: "DependencyWheelChart",
  props: {
    data: { type: Array as () => DependencyWheelChartLink[], required: true },
    labels: { type: Object as () => Record<string, string>, default: undefined },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 240 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    const hoveredLinkIndex = ref<number | null>(null);

    function handleLeave() {
      hoveredLinkIndex.value = null;
    }

    function handleVisualPointerMove(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        hoveredLinkIndex.value = null;
        return;
      }
      const index = Number(target.getAttribute("data-link-index"));
      hoveredLinkIndex.value = Number.isInteger(index) ? index : null;
    }

    return () => {
      const data = props.data;
      const width = props.width ?? 480;
      const height = props.height ?? 240;
      const label = props.label;
      const displayLabel = (id: string) => props.labels?.[id] ?? id;

      const cx = width / 2;
      const cy = height / 2;
      const outer = Math.max(Math.min(width, height) / 2 - 6, 1);
      const inner = Math.max(outer - ARC_WIDTH, 1);
      const ribbonRadius = Math.max(inner - 2, 0);

      const links = data
        .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
        .filter((entry) => entry.weight > 0);

      const order: string[] = [];
      const total = new Map<string, number>();
      for (const { link, weight } of links) {
        for (const id of [link.from, link.to]) {
          if (!total.has(id)) {
            total.set(id, 0);
            order.push(id);
          }
        }
        total.set(link.from, (total.get(link.from) ?? 0) + weight);
        total.set(link.to, (total.get(link.to) ?? 0) + weight);
      }

      const grandTotal = order.reduce((sum, id) => sum + (total.get(id) ?? 0), 0);

      const arcs: ArcDatum[] = [];
      const ribbons: RibbonDatum[] = [];
      const legend: LegendDatum[] = [];

      if (order.length > 0 && grandTotal > 0) {
        const totalGap = GAP * order.length;
        const usable = Math.max(Math.PI * 2 - totalGap, 0.0001);

        type ArcInfo = { tone: DependencyWheelChartTone; cursor: number };
        const arcMap = new Map<string, ArcInfo>();

        let angle = -Math.PI / 2;
        order.forEach((id, index) => {
          const span = (usable * (total.get(id) ?? 0)) / grandTotal;
          const start = angle + GAP / 2;
          const end = start + span;
          angle = end + GAP / 2;
          const tone = TONES[index % TONES.length];
          const mid = (start + end) / 2;
          arcMap.set(id, { tone, cursor: start });
          const labelRadius = (inner + outer) / 2;
          const [lx, ly] = polar(cx, cy, labelRadius, mid);
          arcs.push({
            id,
            tone,
            value: total.get(id) ?? 0,
            span,
            path: arcPath(cx, cy, inner, outer, start, end),
            labelX: lx,
            labelY: ly,
            textColor: contrastTextForTone(tone),
          });
        });

        const maxWeight = Math.max(1, ...links.map((entry) => entry.weight));
        links.forEach(({ link, weight, index }) => {
          const source = arcMap.get(link.from)!;
          const target = arcMap.get(link.to)!;
          const sourceSpan = (usable * weight) / grandTotal;
          const targetSpan = (usable * weight) / grandTotal;
          const s0 = source.cursor;
          const s1 = source.cursor + sourceSpan;
          source.cursor = s1;
          const t0 = target.cursor;
          const t1 = target.cursor + targetSpan;
          target.cursor = t1;

          const [ps0x, ps0y] = polar(cx, cy, ribbonRadius, s0);
          const [ps1x, ps1y] = polar(cx, cy, ribbonRadius, s1);
          const [pt0x, pt0y] = polar(cx, cy, ribbonRadius, t0);
          const [pt1x, pt1y] = polar(cx, cy, ribbonRadius, t1);

          const path =
            `M ${ps0x} ${ps0y} ` +
            `Q ${cx} ${cy} ${pt1x} ${pt1y} ` +
            `A ${ribbonRadius} ${ribbonRadius} 0 0 1 ${pt0x} ${pt0y} ` +
            `Q ${cx} ${cy} ${ps1x} ${ps1y} ` +
            `A ${ribbonRadius} ${ribbonRadius} 0 0 0 ${ps0x} ${ps0y} Z`;

          ribbons.push({
            index,
            from: link.from,
            to: link.to,
            weight,
            tone: source.tone,
            strokeWidth: Math.max(1, (weight / maxWeight) * 4),
            path,
            midX: cx,
            midY: cy,
          });
        });

        arcs.forEach((arc) => {
          legend.push({ label: displayLabel(arc.id), shape: "circle", tone: arc.tone });
        });
      }

      const ribbonNodes = ribbons.map((ribbon) =>
        h("path", {
          key: ribbon.index,
          class: classNames(
            "st-dependencyWheelChart__ribbon",
            `st-dependencyWheelChart__ribbon--${ribbon.tone}`,
            hoveredLinkIndex.value !== null && hoveredLinkIndex.value !== ribbon.index
              ? "st-dependencyWheelChart__ribbon--dim"
              : undefined,
          ),
          d: ribbon.path,
          "stroke-width": ribbon.strokeWidth,
          "data-link-index": ribbon.index,
        }),
      );

      const arcNodes: ReturnType<typeof h>[] = [];
      arcs.forEach((arc) => {
        arcNodes.push(
          h("path", {
            key: arc.id,
            class: classNames("st-dependencyWheelChart__arc", `st-dependencyWheelChart__arc--${arc.tone}`),
            d: arc.path,
          }),
        );
        if (arc.span > 0.34) {
          arcNodes.push(
            h(
              "text",
              {
                key: `lbl${arc.id}`,
                class: "st-dependencyWheelChart__arcLabel",
                x: arc.labelX,
                y: arc.labelY,
                "text-anchor": "middle",
                "dominant-baseline": "middle",
                fill: arc.textColor,
              },
              displayLabel(arc.id),
            ),
          );
        }
      });

      const dataValueItems = data
        .filter((link) => magnitude(link.weight) > 0)
        .map((link) => `${displayLabel(link.from)} -> ${displayLabel(link.to)}: ${link.weight}`);

      const hovered =
        hoveredLinkIndex.value !== null ? ribbons.find((r) => r.index === hoveredLinkIndex.value) : undefined;

      const visualChildren: (ReturnType<typeof h> | null)[] = [
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
          [
            h("g", { class: "st-dependencyWheelChart__ribbons" }, ribbonNodes),
            h("g", { class: "st-dependencyWheelChart__arcs" }, arcNodes),
          ],
        ),
      ];

      if (legend.length > 0) {
        visualChildren.push(
          h(GraphLegend, { class: "st-dependencyWheelChart__legend", entries: legend }),
        );
      }

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-dependencyWheelChart__visual",
            role: "img",
            "aria-label": label,
            onPointermove: handleVisualPointerMove,
            onPointerleave: handleLeave,
          },
          visualChildren,
        ),
        chartDataList(label, dataValueItems),
      ];

      if (hovered) {
        children.push(
          h(
            "div",
            {
              class: "st-dependencyWheelChart__tooltip",
              role: "presentation",
              style: `left: ${(hovered.midX / width) * 100}%; top: ${(hovered.midY / height) * 100}%`,
            },
            [
              h(
                "span",
                { class: "st-dependencyWheelChart__tooltipLabel" },
                `${displayLabel(hovered.from)} -> ${displayLabel(hovered.to)}`,
              ),
              h("span", { class: "st-dependencyWheelChart__tooltipValue" }, String(hovered.weight)),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-dependencyWheelChart", props.class) }, children);
    };
  },
});
