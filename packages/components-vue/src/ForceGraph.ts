import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type ForceGraphTone = string;
export type ForceGraphNode = {
  id: string;
  label?: string;
  group?: string | number;
  tone?: ForceGraphTone;
  weight?: number;
  fx?: number;
  fy?: number;
};
export type ForceGraphEdge = { source: string; target: string; relation?: string; weak?: boolean };

export type ForceGraphProps = {
  nodes: ForceGraphNode[];
  edges: ForceGraphEdge[];
  label?: string;
  selectedIds?: string[];
  focusId?: string | null;
  class?: string;
};

const DATA_TONES = [
  "category1", "category2", "category3", "category4",
  "category5", "category6", "category7", "category8",
];

export const ForceGraph = defineComponent({
  name: "ForceGraph",
  props: {
    nodes: { type: Array as () => ForceGraphNode[], required: true },
    edges: { type: Array as () => ForceGraphEdge[], required: true },
    label: { type: String, default: "Force graph" },
    selectedIds: { type: Array as () => string[], default: () => [] },
    focusId: { type: String as () => string | null, default: null },
    class: { type: String, default: undefined },
  },
  emits: ["select", "openEntity"],
  setup(props, { emit, attrs }) {
    return () => {
      const label = props.label ?? "Force graph";
      const selectedIds = props.selectedIds ?? [];
      const focusId = props.focusId ?? null;
      return h(
        "figure",
        {
          ...attrs,
          class: classNames("st-forceGraph st-forceGraph--static", props.class),
          "aria-label": label,
        },
        [
          h("span", { class: "st-visually-hidden" }, label),
          h("svg", { viewBox: "0 0 360 220", "aria-hidden": "true" }, [
            h(
              "g",
              { class: "st-forceGraph__edges" },
              props.edges.map((edge, index) =>
                h("line", {
                  key: `${edge.source}-${edge.target}-${index}`,
                  class: classNames(
                    "st-forceGraph__edge",
                    edge.weak && "st-forceGraph__edge--weak",
                  ),
                  x1: "40",
                  y1: 40 + index * 20,
                  x2: "260",
                  y2: 80 + index * 20,
                }),
              ),
            ),
            h(
              "g",
              { class: "st-forceGraph__nodes" },
              props.nodes.map((graphNode, index) => {
                const x = graphNode.fx ?? 48 + (index % 5) * 64;
                const y = graphNode.fy ?? 56 + Math.floor(index / 5) * 56;
                return h(
                  "g",
                  {
                    key: graphNode.id,
                    class: classNames(
                      "st-forceGraph__node",
                      `st-forceGraph__node--${graphNode.tone ?? DATA_TONES[index % DATA_TONES.length]}`,
                      selectedIds.includes(graphNode.id) && "st-forceGraph__node--selected",
                      focusId === graphNode.id && "st-forceGraph__node--focus",
                    ),
                    tabindex: 0,
                    onClick: () => emit("select", graphNode.id),
                    onDblclick: () => emit("openEntity", graphNode.id),
                  },
                  [
                    h("circle", {
                      class: "st-forceGraph__dot",
                      cx: x,
                      cy: y,
                      r: 8 * (graphNode.weight ?? 1),
                    }),
                    h("text", { class: "st-forceGraph__label", x: x + 12, y: y + 4 }, graphNode.label ?? graphNode.id),
                  ],
                );
              }),
            ),
          ]),
        ],
      );
    };
  },
});
