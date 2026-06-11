import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";
import { GraphLegend } from "./GraphLegend.js";

export type ArcDiagramChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type ArcDiagramChartLink = {
  from: string;
  to: string;
  weight: number;
};

export type ArcDiagramChartProps = {
  data: ArcDiagramChartLink[];
  labels?: Record<string, string>;
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const TONES: ArcDiagramChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

const MARGIN_X = 24;
const BASELINE_PAD = 28;
const MIN_NODE_R = 4;
const MAX_NODE_R = 9;

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

type NodeDatum = {
  id: string;
  tone: ArcDiagramChartTone;
  x: number;
  r: number;
  value: number;
};

type ArcDatum = {
  index: number;
  from: string;
  to: string;
  weight: number;
  tone: ArcDiagramChartTone;
  strokeWidth: number;
  path: string;
  midX: number;
  midY: number;
};

type LegendDatum = { label: string; shape: "circle"; tone: ArcDiagramChartTone };

export const ArcDiagramChart = defineComponent({
  name: "ArcDiagramChart",
  props: {
    data: { type: Array as () => ArcDiagramChartLink[], required: true },
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

      const baselineY = height - BASELINE_PAD;

      const links = data
        .map((link, index) => ({ link, index, weight: magnitude(link.weight) }))
        .filter((entry) => entry.weight > 0);

      const order: string[] = [];
      const degree = new Map<string, number>();
      for (const { link, weight } of links) {
        for (const id of [link.from, link.to]) {
          if (!degree.has(id)) {
            degree.set(id, 0);
            order.push(id);
          }
        }
        degree.set(link.from, (degree.get(link.from) ?? 0) + weight);
        degree.set(link.to, (degree.get(link.to) ?? 0) + weight);
      }

      const nodes: NodeDatum[] = [];
      const arcs: ArcDatum[] = [];
      const legend: LegendDatum[] = [];

      if (order.length > 0) {
        const usable = Math.max(width - MARGIN_X * 2, 1);
        const step = order.length > 1 ? usable / (order.length - 1) : 0;
        const startX = order.length > 1 ? MARGIN_X : width / 2;

        const maxDegree = Math.max(1, ...order.map((id) => degree.get(id) ?? 0));

        const nodeX = new Map<string, number>();
        const nodeTone = new Map<string, ArcDiagramChartTone>();
        order.forEach((id, index) => {
          const x = startX + step * index;
          const tone = TONES[index % TONES.length];
          const value = degree.get(id) ?? 0;
          const r = MIN_NODE_R + (MAX_NODE_R - MIN_NODE_R) * (value / maxDegree);
          nodeX.set(id, x);
          nodeTone.set(id, tone);
          nodes.push({ id, tone, x, r, value });
        });

        const maxWeight = Math.max(1, ...links.map((entry) => entry.weight));
        links.forEach(({ link, weight, index }) => {
          const x1 = nodeX.get(link.from)!;
          const x2 = nodeX.get(link.to)!;
          const left = Math.min(x1, x2);
          const right = Math.max(x1, x2);
          const radius = (right - left) / 2;
          const sweep = x1 <= x2 ? 1 : 0;
          const path = `M ${x1} ${baselineY} A ${radius} ${radius} 0 0 ${sweep} ${x2} ${baselineY}`;
          const tone = nodeTone.get(link.from)!;
          arcs.push({
            index,
            from: link.from,
            to: link.to,
            weight,
            tone,
            strokeWidth: Math.max(1.5, (weight / maxWeight) * 6),
            path,
            midX: (left + right) / 2,
            midY: baselineY - radius,
          });
        });

        nodes.forEach((node) => {
          legend.push({ label: displayLabel(node.id), shape: "circle", tone: node.tone });
        });
      }

      const arcNodes = arcs.map((arc) =>
        h("path", {
          key: arc.index,
          class: classNames(
            "st-arcDiagramChart__arc",
            `st-arcDiagramChart__arc--${arc.tone}`,
            hoveredLinkIndex.value !== null && hoveredLinkIndex.value !== arc.index
              ? "st-arcDiagramChart__arc--dim"
              : undefined,
          ),
          d: arc.path,
          "stroke-width": arc.strokeWidth,
          "data-link-index": arc.index,
        }),
      );

      const nodeNodes = nodes.map((node) =>
        h("circle", {
          key: node.id,
          class: classNames("st-arcDiagramChart__node", `st-arcDiagramChart__node--${node.tone}`),
          cx: node.x,
          cy: baselineY,
          r: node.r,
        }),
      );

      const dataValueItems = data
        .filter((link) => magnitude(link.weight) > 0)
        .map((link) => `${displayLabel(link.from)} -> ${displayLabel(link.to)}: ${link.weight}`);

      const hovered =
        hoveredLinkIndex.value !== null ? arcs.find((a) => a.index === hoveredLinkIndex.value) : undefined;

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
            h("line", {
              class: "st-arcDiagramChart__axis",
              x1: MARGIN_X,
              y1: baselineY,
              x2: width - MARGIN_X,
              y2: baselineY,
            }),
            h("g", { class: "st-arcDiagramChart__arcs" }, arcNodes),
            h("g", { class: "st-arcDiagramChart__nodes" }, nodeNodes),
          ],
        ),
      ];

      if (legend.length > 0) {
        visualChildren.push(h(GraphLegend, { class: "st-arcDiagramChart__legend", entries: legend }));
      }

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          {
            class: "st-arcDiagramChart__visual",
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
              class: "st-arcDiagramChart__tooltip",
              role: "presentation",
              style: `left: ${(hovered.midX / width) * 100}%; top: ${(hovered.midY / height) * 100}%`,
            },
            [
              h(
                "span",
                { class: "st-arcDiagramChart__tooltipLabel" },
                `${displayLabel(hovered.from)} -> ${displayLabel(hovered.to)}`,
              ),
              h("span", { class: "st-arcDiagramChart__tooltipValue" }, String(hovered.weight)),
            ],
          ),
        );
      }

      return h("div", { ...attrs, class: classNames("st-arcDiagramChart", props.class) }, children);
    };
  },
});
