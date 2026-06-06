import { defineComponent, h, ref } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type SankeyChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type SankeyChartNode = {
  id: string;
  label: string;
  tone?: SankeyChartTone;
};

export type SankeyChartLink = {
  source: string;
  target: string;
  value: number;
  tone?: SankeyChartTone;
};

export type SankeyChartProps = {
  nodes: SankeyChartNode[];
  links: SankeyChartLink[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

const MARGIN = { top: 18, right: 26, bottom: 18, left: 26 } as const;
const NODE_WIDTH = 14;
const TONES: SankeyChartTone[] = [
  "category1",
  "category2",
  "category3",
  "category4",
  "category5",
  "category6",
  "category7",
  "category8",
];

function magnitude(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

type NodeLayout = {
  node: SankeyChartNode;
  tone: SankeyChartTone;
  x: number;
  y: number;
  width: number;
  height: number;
  centerY: number;
};

export const SankeyChart = defineComponent({
  name: "SankeyChart",
  props: {
    nodes: { type: Array as () => SankeyChartNode[], required: true },
    links: { type: Array as () => SankeyChartLink[], required: true },
    width: { type: Number, default: 560 },
    height: { type: Number, default: 280 },
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
      const nodes = props.nodes ?? [];
      const links = props.links ?? [];
      const width = props.width ?? 560;
      const height = props.height ?? 280;
      const label = props.label;

      // Compute depths (longest path from root)
      const depths = new Map(nodes.map((node) => [node.id, 0]));
      for (let pass = 0; pass < nodes.length; pass += 1) {
        let changed = false;
        for (const link of links) {
          const sourceDepth = depths.get(link.source) ?? 0;
          const targetDepth = depths.get(link.target) ?? 0;
          if (sourceDepth + 1 > targetDepth) {
            depths.set(link.target, sourceDepth + 1);
            changed = true;
          }
        }
        if (!changed) break;
      }

      // Conservation de flux : hauteur nœud = max(Σ flux sortants, Σ flux entrants)
      const valueOut = new Map<string, number>();
      const valueIn = new Map<string, number>();
      for (const node of nodes) {
        valueOut.set(node.id, 0);
        valueIn.set(node.id, 0);
      }
      for (const link of links) {
        const v = magnitude(link.value);
        valueOut.set(link.source, (valueOut.get(link.source) ?? 0) + v);
        valueIn.set(link.target, (valueIn.get(link.target) ?? 0) + v);
      }
      const nodeValues = new Map<string, number>();
      for (const node of nodes) {
        nodeValues.set(node.id, Math.max(valueOut.get(node.id) ?? 0, valueIn.get(node.id) ?? 0));
      }

      const maxDepth = Math.max(0, ...Array.from(depths.values()));
      const plotWidth = Math.max(width - MARGIN.left - MARGIN.right - NODE_WIDTH, 1);
      const plotHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 1);
      const maxNodeValue = Math.max(1, ...Array.from(nodeValues.values()));

      const byDepth = new Map<number, SankeyChartNode[]>();
      nodes.forEach((node) => {
        const depth = depths.get(node.id) ?? 0;
        const bucket = byDepth.get(depth) ?? [];
        bucket.push(node);
        byDepth.set(depth, bucket);
      });

      const positionedNodes: NodeLayout[] = nodes.map((node, index) => {
        const depth = depths.get(node.id) ?? 0;
        const bucket = byDepth.get(depth) ?? [node];
        const row = Math.max(0, bucket.findIndex((entry) => entry.id === node.id));
        const slot = plotHeight / Math.max(bucket.length, 1);
        const nodeHeight = Math.max(24, Math.min(slot * 0.72, 18 + ((nodeValues.get(node.id) ?? 0) / maxNodeValue) * 54));
        const x = MARGIN.left + (maxDepth === 0 ? plotWidth / 2 : (plotWidth * depth) / maxDepth);
        const y = MARGIN.top + slot * row + (slot - nodeHeight) / 2;
        const tone = node.tone ?? TONES[index % TONES.length];
        return {
          node,
          tone,
          x,
          y,
          width: NODE_WIDTH,
          height: nodeHeight,
          centerY: y + nodeHeight / 2,
        };
      });

      const positionedById = new Map(positionedNodes.map((n) => [n.node.id, n]));
      const maxLinkValue = Math.max(1, ...links.map((link) => magnitude(link.value)));
      const nodeById = new Map(nodes.map((node) => [node.id, node]));

      // No silent drop for orphan links - use fallback position
      const positionedLinks = links.map((link, index) => {
        const source = positionedById.get(link.source);
        const target = positionedById.get(link.target);
        const fallbackY = MARGIN.top + plotHeight / 2;
        const x1 = (source?.x ?? MARGIN.left) + NODE_WIDTH;
        const y1 = source?.centerY ?? fallbackY;
        const x2 = target?.x ?? width - MARGIN.right;
        const y2 = target?.centerY ?? fallbackY;
        const c = Math.max(32, Math.abs(x2 - x1) * 0.5);
        return {
          link,
          source,
          target,
          tone: link.tone ?? source?.tone ?? TONES[index % TONES.length],
          width: Math.max(2, (magnitude(link.value) / maxLinkValue) * 18),
          path: `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`,
          midX: (x1 + x2) / 2,
          midY: (y1 + y2) / 2,
        };
      });

      const svgChildren: ReturnType<typeof h>[] = [];

      // Links first (below nodes)
      positionedLinks.forEach((flow, i) => {
        const isDim = hoveredLinkIndex.value !== null && hoveredLinkIndex.value !== i;
        svgChildren.push(
          h("path", {
            key: `${flow.link.source}-${flow.link.target}-${i}`,
            class: classNames(
              "st-sankeyChart__link",
              `st-sankeyChart__link--${flow.tone}`,
              isDim ? "st-sankeyChart__link--dim" : undefined,
            ),
            d: flow.path,
            "stroke-width": flow.width,
            "data-link-index": i,
          }),
        );
      });

      // Nodes on top
      positionedNodes.forEach((entry) => {
        svgChildren.push(
          h("rect", {
            key: `n${entry.node.id}`,
            class: classNames("st-sankeyChart__node", `st-sankeyChart__node--${entry.tone}`),
            x: entry.x,
            y: entry.y,
            width: entry.width,
            height: entry.height,
            rx: "2",
          }),
          h(
            "text",
            {
              key: `l${entry.node.id}`,
              class: "st-sankeyChart__nodeLabel",
              x: entry.x + entry.width + 6,
              y: entry.centerY,
              "dominant-baseline": "middle",
            },
            entry.node.label,
          ),
        );
      });

      const dataValueItems = links.map((link) => {
        const src = nodeById.get(link.source)?.label ?? link.source;
        const tgt = nodeById.get(link.target)?.label ?? link.target;
        return `${src} -> ${tgt}: ${link.value}`;
      });

      const hoveredFlow = hoveredLinkIndex.value !== null ? positionedLinks[hoveredLinkIndex.value] : undefined;

      return h("div", { ...attrs, class: classNames("st-sankeyChart", props.class) }, [
        h(
          "div",
          {
            class: "st-sankeyChart__visual",
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
        hoveredFlow
          ? h(
              "div",
              {
                class: "st-sankeyChart__tooltip",
                role: "presentation",
                style: `left: ${(hoveredFlow.midX / width) * 100}%; top: ${(hoveredFlow.midY / height) * 100}%`,
              },
              [
                h(
                  "span",
                  { class: "st-sankeyChart__tooltipLabel" },
                  `${hoveredFlow.source?.node.label ?? hoveredFlow.link.source} -> ${hoveredFlow.target?.node.label ?? hoveredFlow.link.target}`,
                ),
                h("span", { class: "st-sankeyChart__tooltipValue" }, String(hoveredFlow.link.value)),
              ],
            )
          : null,
      ]);
    };
  },
});
