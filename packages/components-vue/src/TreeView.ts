import { defineComponent, getCurrentInstance, h, ref } from "vue";
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
  /** Svelte-canonical alias of `selectedId`. */
  selected?: string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  /** Svelte-canonical alias of `defaultExpandedIds`. */
  defaultExpanded?: string[];
  /** Accessible name for the tree (parity with the Svelte `label`). */
  label?: string;
  class?: string;
};

type TreeFlatNode = {
  node: TreeNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
};

function flattenVisible(nodes: TreeNode[], expanded: Set<string>): TreeFlatNode[] {
  const out: TreeFlatNode[] = [];
  const walk = (items: TreeNode[], level: number, parentId: string | null) => {
    for (const node of items) {
      const hasChildren = Boolean(node.children && node.children.length > 0);
      const isExpanded = expanded.has(node.id);
      out.push({ node, level, parentId, hasChildren, expanded: isExpanded });
      if (hasChildren && isExpanded) walk(node.children!, level + 1, node.id);
    }
  };
  walk(nodes, 1, null);
  return out;
}

export const TreeView = defineComponent({
  name: "TreeView",
  props: {
    nodes: { type: Array as () => TreeNode[], required: true },
    selectedId: { type: String, default: undefined },
    selected: { type: String, default: undefined },
    expandedIds: { type: Array as () => string[], default: undefined },
    defaultExpandedIds: { type: Array as () => string[], default: undefined },
    defaultExpanded: { type: Array as () => string[], default: undefined },
    label: { type: String, default: "Arborescence" },
    class: { type: String, default: undefined },
  },
  // `select`: the selected leaf's id (parity with Svelte `onselect`).
  // `update:selectedId`: enables `v-model:selectedId`; same payload.
  emits: ["select", "update:selectedId"],
  setup(props, { attrs, emit }) {
    // Expansion: controlled via `expandedIds`, else internal state seeded from
    // `defaultExpandedIds` / `defaultExpanded` (Svelte-canonical alias).
    const internalExpanded = ref<Set<string>>(
      new Set(props.defaultExpandedIds ?? props.defaultExpanded ?? []),
    );
    const focusedId = ref<string | undefined>(undefined);
    const rootRef = ref<HTMLElement | null>(null);
    const instance = getCurrentInstance();

    // A declared `emits` event consumes its `onXxx` from `attrs`, so we read the
    // raw vnode props to know whether a `select` / `update:selectedId` listener
    // was actually wired — that is what makes the tree interactive.
    const interactive = () => {
      const raw = (instance?.vnode.props ?? {}) as Record<string, unknown>;
      return Boolean(raw.onSelect) || Boolean(raw["onUpdate:selectedId"]);
    };

    return () => {
      const expansionControlled = Array.isArray(props.expandedIds);
      const expanded = expansionControlled ? new Set(props.expandedIds) : internalExpanded.value;
      const visible = flattenVisible(props.nodes, expanded);
      const tabbableId = focusedId.value ?? visible[0]?.node.id;
      const isInteractive = interactive();

      const toggle = (id: string) => {
        if (expansionControlled) return;
        const next = new Set(internalExpanded.value);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        internalExpanded.value = next;
      };

      const activate = (flat: TreeFlatNode) => {
        if (flat.node.disabled) return;
        focusedId.value = flat.node.id;
        if (flat.hasChildren) {
          toggle(flat.node.id);
        } else {
          emit("select", flat.node.id);
          emit("update:selectedId", flat.node.id);
        }
      };

      const focusAt = (index: number) => {
        const target = visible[index];
        if (!target) return;
        focusedId.value = target.node.id;
        queueMicrotask(() => {
          const rows = Array.from(rootRef.value?.querySelectorAll<HTMLElement>("[data-tree-id]") ?? []);
          rows.find((row) => row.dataset.treeId === target.node.id)?.focus();
        });
      };

      const onKey = (event: KeyboardEvent, flat: TreeFlatNode) => {
        const i = visible.findIndex((v) => v.node.id === flat.node.id);
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            focusAt(i + 1);
            break;
          case "ArrowUp":
            event.preventDefault();
            focusAt(i - 1);
            break;
          case "Home":
            event.preventDefault();
            focusAt(0);
            break;
          case "End":
            event.preventDefault();
            focusAt(visible.length - 1);
            break;
          case "ArrowRight":
            event.preventDefault();
            if (flat.hasChildren && !flat.expanded) toggle(flat.node.id);
            else if (flat.hasChildren) focusAt(i + 1);
            break;
          case "ArrowLeft":
            event.preventDefault();
            if (flat.hasChildren && flat.expanded) toggle(flat.node.id);
            else if (flat.parentId) focusAt(visible.findIndex((v) => v.node.id === flat.parentId));
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            activate(flat);
            break;
        }
      };

      const resolvedSelectedId = props.selectedId ?? props.selected;
      const rows = visible.map((flat) => {
        const isSelected = flat.node.id === resolvedSelectedId;
        return h(
          "div",
          {
            key: flat.node.id,
            role: "treeitem",
            "aria-level": flat.level,
            "aria-expanded": flat.hasChildren ? (flat.expanded ? "true" : "false") : undefined,
            "aria-selected": isSelected ? "true" : "false",
            "aria-disabled": flat.node.disabled ? "true" : undefined,
            class: classNames(
              "st-treeView__row",
              isSelected && "st-treeView__row--selected",
              flat.node.disabled && "st-treeView__row--disabled",
            ),
            "data-tree-id": flat.node.id,
            style: `padding-inline-start: calc(${flat.level - 1} * var(--st-spacing-4, 1rem) + 0.25rem)`,
            tabindex: isInteractive ? (flat.node.id === tabbableId ? 0 : -1) : undefined,
            onClick: isInteractive ? () => activate(flat) : undefined,
            onKeydown: isInteractive ? (e: KeyboardEvent) => onKey(e, flat) : undefined,
            onFocus: isInteractive ? () => (focusedId.value = flat.node.id) : undefined,
          },
          [
            h("span", {
              class: classNames(
                "st-treeView__caret",
                !flat.hasChildren && "st-treeView__caret--leaf",
                flat.expanded && "st-treeView__caret--open",
              ),
              "aria-hidden": "true",
            }),
            h("span", { class: "st-treeView__label" }, flat.node.label as string),
          ],
        );
      });

      return h(
        "div",
        {
          ...attrs,
          ref: rootRef,
          class: classNames("st-treeView", props.class),
          role: "tree",
          "aria-label": props.label,
        },
        rows,
      );
    };
  },
});
