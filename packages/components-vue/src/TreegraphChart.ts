import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";
import { chartDataList } from "./chartScale.js";

export type TreegraphChartTone =
  | "category1"
  | "category2"
  | "category3"
  | "category4"
  | "category5"
  | "category6"
  | "category7"
  | "category8";

export type TreegraphChartNode = {
  id: string;
  parentId?: string | null;
  label: string;
  tone?: TreegraphChartTone;
};

export type TreegraphChartProps = {
  data: TreegraphChartNode[];
  width?: number;
  height?: number;
  label: string;
  class?: string;
};

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

type Node = {
  id: string;
  label: string;
  tone: TreegraphChartTone;
  depth: number;
  x: number;
  y: number;
  parentId: string | null;
};

type Link = { id: string; x1: number; y1: number; x2: number; y2: number };
type Layout = { nodes: Node[]; links: Link[]; rowH: number };

const R = 7;
const PAD_X = 80;
const PAD_Y = 12;

function buildLayout(data: TreegraphChartNode[], width: number, height: number): Layout {
  if (!data || data.length === 0) return { nodes: [], links: [], rowH: 0 };

  const byId = new Map<string, TreegraphChartNode>();
  for (const n of data) if (n.id != null && !byId.has(n.id)) byId.set(n.id, n);

  const validParent = (n: TreegraphChartNode): string | null => {
    const p = n.parentId;
    if (p == null) return null;
    if (!byId.has(p) || p === n.id) return null;
    let cursor: string | null = p;
    const seen = new Set<string>([n.id]);
    while (cursor != null) {
      if (seen.has(cursor)) return null;
      seen.add(cursor);
      const parent: TreegraphChartNode | undefined = byId.get(cursor);
      cursor = parent ? parent.parentId ?? null : null;
    }
    return p;
  };

  const childrenOf = new Map<string, string[]>();
  const roots: string[] = [];
  for (const n of byId.values()) {
    const p = validParent(n);
    if (p == null) {
      roots.push(n.id);
    } else {
      const list = childrenOf.get(p) ?? [];
      list.push(n.id);
      childrenOf.set(p, list);
    }
  }

  const depthOf = new Map<string, number>();
  const leafOrder = new Map<string, number>();
  let leafCounter = 0;
  let maxDepth = 0;

  const visit = (id: string, depth: number) => {
    depthOf.set(id, depth);
    if (depth > maxDepth) maxDepth = depth;
    const kids = childrenOf.get(id) ?? [];
    if (kids.length === 0) {
      leafOrder.set(id, leafCounter);
      leafCounter += 1;
      return;
    }
    for (const k of kids) visit(k, depth + 1);
  };
  for (const r of roots) visit(r, 0);

  const leafCount = Math.max(leafCounter, 1);
  const usableY = Math.max(height - PAD_Y * 2, 1);
  const rowH = usableY / leafCount;

  const centerY = new Map<string, number>();
  const computeY = (id: string): number => {
    const cached = centerY.get(id);
    if (cached != null) return cached;
    const kids = childrenOf.get(id) ?? [];
    let cy: number;
    if (kids.length === 0) {
      const row = leafOrder.get(id) ?? 0;
      cy = PAD_Y + row * rowH + rowH / 2;
    } else {
      const ys = kids.map((k) => computeY(k));
      cy = ys.reduce((s, v) => s + v, 0) / ys.length;
    }
    centerY.set(id, cy);
    return cy;
  };
  for (const r of roots) computeY(r);

  const levels = maxDepth + 1;
  const usableX = Math.max(width - PAD_X * 2, 1);
  const colGap = levels > 1 ? usableX / (levels - 1) : 0;
  const xForDepth = (d: number) => (levels > 1 ? PAD_X + d * colGap : width / 2);

  const nodes: Node[] = [];
  let toneIdx = 0;
  const ordered = [...byId.values()].filter((n) => depthOf.has(n.id));
  for (const n of ordered) {
    const depth = depthOf.get(n.id) ?? 0;
    const tone = n.tone ?? TONES[toneIdx % TONES.length];
    if (!n.tone) toneIdx += 1;
    nodes.push({
      id: n.id,
      label: n.label,
      tone,
      depth,
      x: xForDepth(depth),
      y: centerY.get(n.id) ?? height / 2,
      parentId: validParent(n),
    });
  }

  const nodeById = new Map(nodes.map((b) => [b.id, b]));
  const links: Link[] = [];
  for (const b of nodes) {
    if (b.parentId == null) continue;
    const parent = nodeById.get(b.parentId);
    if (!parent) continue;
    links.push({ id: b.id, x1: parent.x + R, y1: parent.y, x2: b.x - R, y2: b.y });
  }

  return { nodes, links, rowH };
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, Math.max(1, n - 1))}…` : s);

export const TreegraphChart = defineComponent({
  name: "TreegraphChart",
  props: {
    data: { type: Array as () => TreegraphChartNode[], required: true },
    width: { type: Number, default: 640 },
    height: { type: Number, default: 360 },
    label: { type: String, required: true },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const width = props.width ?? 640;
      const height = props.height ?? 360;
      const label = props.label;

      const { nodes, links, rowH } = buildLayout(props.data, width, height);

      const fontSize = rowH < 18 ? 9 : rowH < 26 ? 10 : 11;
      const maxChars = Math.max(2, Math.floor((PAD_X - R - 6) / (fontSize * 0.58)));

      const dataValueItems = nodes.map((b) => {
        const parent = b.parentId != null ? nodes.find((p) => p.id === b.parentId) : undefined;
        return parent ? `${b.label} (${b.id}) → ${parent.label}` : `${b.label} (${b.id})`;
      });

      const svgChildren: ReturnType<typeof h>[] = [];

      links.forEach((link) => {
        const cx = (link.x1 + link.x2) / 2;
        svgChildren.push(
          h("path", {
            key: `link-${link.id}`,
            class: "st-treegraphChart__link",
            d: `M ${link.x1} ${link.y1} C ${cx} ${link.y1} ${cx} ${link.y2} ${link.x2} ${link.y2}`,
            fill: "none",
          }),
        );
      });

      nodes.forEach((node) => {
        const isLeaf = !nodes.some((c) => c.parentId === node.id);
        svgChildren.push(
          h("g", { key: node.id, class: "st-treegraphChart__node" }, [
            h("circle", {
              class: classNames(
                "st-treegraphChart__dot",
                `st-treegraphChart__dot--${node.tone}`,
              ),
              cx: node.x,
              cy: node.y,
              r: R,
            }),
            h(
              "text",
              {
                class: "st-treegraphChart__label",
                x: isLeaf ? node.x + R + 4 : node.x - R - 4,
                y: node.y,
                "text-anchor": isLeaf ? "start" : "end",
                "dominant-baseline": "central",
                style: `font-size: ${fontSize}px`,
              },
              clip(node.label, maxChars),
            ),
          ]),
        );
      });

      const children: (ReturnType<typeof h> | null)[] = [
        h(
          "div",
          { class: "st-treegraphChart__visual", role: "img", "aria-label": label },
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
      ];

      return h("div", { ...attrs, class: classNames("st-treegraphChart", props.class) }, children);
    };
  },
});
