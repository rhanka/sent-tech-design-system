import { defineComponent, h, type PropType, type VNode } from "vue";
import { classNames } from "./classNames.js";
import {
  nodeShapePath,
  type ForceGraphLegendEntry,
} from "./ForceGraph.js";

// Re-export types so GraphLegend can be used standalone.
export type {
  ForceGraphLegendEntry,
  ForceGraphNodeShape,
  ForceGraphTone,
} from "./ForceGraph.js";

export type GraphLegendProps = {
  entries: ForceGraphLegendEntry[];
  /** Optional heading shown above entries. */
  title?: string;
  class?: string;
};

export const GraphLegend = defineComponent({
  name: "GraphLegend",
  props: {
    entries: { type: Array as PropType<ForceGraphLegendEntry[]>, required: true },
    title: { type: String, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const items: VNode[] = props.entries.map((entry, idx) => {
        const swatchPath = entry.shape !== undefined ? nodeShapePath(entry.shape, 7) : null;
        const swatchTone = entry.tone ?? "category1";

        let swatch: VNode;
        if (entry.shape !== undefined) {
          swatch = h(
            "svg",
            {
              class: "st-graphLegend__swatch",
              viewBox: "-8 -8 16 16",
              width: "16",
              height: "16",
              "aria-hidden": "true",
            },
            [
              swatchPath
                ? h("path", {
                    d: swatchPath,
                    class: `st-graphLegend__shape st-graphLegend__shape--${swatchTone}`,
                  })
                : h("circle", {
                    r: "7",
                    class: `st-graphLegend__shape st-graphLegend__shape--${swatchTone}`,
                  }),
            ],
          );
        } else {
          swatch = h(
            "svg",
            {
              class: "st-graphLegend__swatch",
              viewBox: "0 0 16 8",
              width: "16",
              height: "8",
              "aria-hidden": "true",
            },
            [
              h("line", {
                x1: "0",
                y1: "4",
                x2: "16",
                y2: "4",
                class: classNames(
                  "st-graphLegend__edge",
                  entry.weak && "st-graphLegend__edge--weak",
                ),
              }),
            ],
          );
        }

        return h("li", { key: idx, class: "st-graphLegend__entry" }, [
          swatch,
          h("span", { class: "st-graphLegend__label" }, entry.label),
        ]);
      });

      const children: VNode[] = [];
      if (props.title) {
        children.push(h("p", { class: "st-graphLegend__title" }, props.title));
      }
      children.push(h("ul", { class: "st-graphLegend__list", role: "list" }, items));

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-graphLegend", props.class),
          "aria-label": props.title ?? "Graph legend",
        },
        children,
      );
    };
  },
});
