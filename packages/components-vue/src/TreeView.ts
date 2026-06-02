import { defineComponent, h } from "vue";
import { classNames } from "./classNames.js";

export type TreeNode = {
  id: string;
  label: unknown;
  children?: TreeNode[];
  disabled?: boolean;
};

export type TreeViewProps = {
  nodes: TreeNode[];
  selectedId?: string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  class?: string;
};

function renderTreeRows(
  nodes: TreeNode[],
  expanded: Set<string>,
  selectedId?: string,
): ReturnType<typeof h>[] {
  return nodes.map((treeNode) => {
    return h("div", { key: treeNode.id }, [
      h(
        "div",
        {
          class: classNames(
            "st-treeView__row",
            treeNode.id === selectedId && "st-treeView__row--selected",
            treeNode.disabled && "st-treeView__row--disabled",
          ),
        },
        [
          h(
            "span",
            {
              class: classNames(
                "st-treeView__caret",
                !treeNode.children?.length && "st-treeView__caret--leaf",
                expanded.has(treeNode.id) && "st-treeView__caret--open",
              ),
            },
            "›",
          ),
          h("span", { class: "st-treeView__label" }, treeNode.label as string),
        ],
      ),
      treeNode.children?.length && expanded.has(treeNode.id)
        ? renderTreeRows(treeNode.children, expanded, selectedId)
        : null,
    ]);
  });
}

export const TreeView = defineComponent({
  name: "TreeView",
  props: {
    nodes: { type: Array as () => TreeNode[], required: true },
    selectedId: { type: String, default: undefined },
    expandedIds: { type: Array as () => string[], default: undefined },
    defaultExpandedIds: { type: Array as () => string[], default: () => [] },
    class: { type: String, default: undefined },
  },
  setup(props, { attrs }) {
    return () => {
      const expanded = new Set(props.expandedIds ?? props.defaultExpandedIds);

      return h(
        "div",
        {
          ...attrs,
          class: classNames("st-treeView", props.class),
          role: "tree",
        },
        renderTreeRows(props.nodes, expanded, props.selectedId),
      );
    };
  },
});
