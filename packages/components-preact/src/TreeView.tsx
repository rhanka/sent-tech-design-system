import type { HTMLAttributes } from "preact";
import { useRef, useState } from "preact/hooks";
import { classNames } from "./classNames.js";
import type { ComponentChildren, TargetedKeyboardEvent } from "./runtime.js";
import { useValue } from "./signals.js";
import type { MaybeSignal } from "./signals.js";

export interface TreeNode {
  id: string;
  label: ComponentChildren;
  children?: TreeNode[];
  disabled?: boolean;
}

export type TreeViewProps = Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "onChange" | "className"> & {
  nodes: TreeNode[];
  /** Plain value, or a signal in the Preact build (read at the edge). */
  selectedId?: MaybeSignal<string>;
  /** Svelte-canonical alias of `selectedId`. */
  selected?: MaybeSignal<string>;
  /** Plain value, or a signal in the Preact build (read at the edge). */
  expandedIds?: MaybeSignal<string[]>;
  defaultExpandedIds?: string[];
  /** Svelte-canonical alias of `defaultExpandedIds`. */
  defaultExpanded?: string[];
  /**
   * Accessible name for the tree (parity with the Svelte `label`).
   * An explicit `aria-label` attribute takes precedence over this prop.
   */
  label?: string;
  /**
   * Called with the selected node's `id` when a leaf is activated by click or
   * keyboard (Enter/Space). Parity with the Svelte `onselect`. When neither
   * `onSelect` nor `onChange` is provided the tree stays display-only.
   */
  onSelect?: (id: string) => void;
  /** Alias of `onSelect`; same payload (the selected node `id`). */
  onChange?: (id: string) => void;
  /** A signal is accepted in the Preact build; the React emission keeps `string`. */
  className?: MaybeSignal<string>;
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

export function TreeView({
  nodes,
  selectedId: selectedIdInput,
  selected: selectedInput,
  expandedIds: expandedIdsInput,
  defaultExpandedIds,
  defaultExpanded,
  label = "Arborescence",
  onSelect,
  onChange,
  className,
  ...rest
}: TreeViewProps) {
  // Accept the Svelte-canonical prop names (`selected`, `defaultExpanded`) as
  // aliases — that is what the shared docs node specs pass.
  const resolvedSelectedId = useValue(selectedIdInput) ?? useValue(selectedInput);
  const seedExpanded = defaultExpandedIds ?? defaultExpanded ?? [];
  // Expansion: controlled when `expandedIds` is provided, otherwise internal
  // state seeded from `defaultExpandedIds` (parity with the Svelte reference).
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(() => new Set(seedExpanded));
  const expandedIds = useValue(expandedIdsInput);
  const expanded = expandedIds ? new Set(expandedIds) : internalExpanded;
  const expansionControlled = Boolean(expandedIds);

  const [focusedId, setFocusedId] = useState<string | undefined>(undefined);
  const rootRef = useRef<HTMLDivElement>(null);

  const visible = flattenVisible(nodes, expanded);
  const tabbableId = focusedId ?? visible[0]?.node.id;

  function toggle(id: string) {
    if (expansionControlled) return; // parent owns expansion
    setInternalExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function emitSelect(id: string) {
    onSelect?.(id);
    onChange?.(id);
  }

  function activate(flat: TreeFlatNode) {
    if (flat.node.disabled) return;
    setFocusedId(flat.node.id);
    if (flat.hasChildren) {
      toggle(flat.node.id);
    } else {
      emitSelect(flat.node.id);
    }
  }

  function focusAt(index: number) {
    const target = visible[index];
    if (!target) return;
    setFocusedId(target.node.id);
    queueMicrotask(() => {
      const rows = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-tree-id]") ?? []);
      rows.find((row) => row.dataset.treeId === target.node.id)?.focus();
    });
  }

  function onKey(event: TargetedKeyboardEvent<HTMLDivElement>, flat: TreeFlatNode) {
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
  }

  const interactive = typeof onSelect === "function" || typeof onChange === "function";

  // `rest` carries every extra HTML attribute the caller set, including an
  // explicit `aria-label` — honour it instead of silently dropping it behind
  // the `label` default (dataviz ObjectLayerPanel relies on it).
  const { "aria-label": ariaLabel, ...restWithoutLabel } = rest;

  return (
    <div
      {...restWithoutLabel}
      ref={rootRef}
      className={classNames("st-treeView", className)}
      role="tree"
      aria-label={ariaLabel ?? label}
    >
      {visible.map((flat) => {
        const isSelected = flat.node.id === resolvedSelectedId;
        return (
          <div
            key={flat.node.id}
            role="treeitem"
            aria-level={flat.level}
            aria-expanded={flat.hasChildren ? flat.expanded : undefined}
            aria-selected={isSelected}
            aria-disabled={flat.node.disabled || undefined}
            className={classNames(
              "st-treeView__row",
              isSelected && "st-treeView__row--selected",
              flat.node.disabled && "st-treeView__row--disabled",
            )}
            data-tree-id={flat.node.id}
            style={{ paddingInlineStart: `calc(${flat.level - 1} * var(--st-spacing-4, 1rem) + 0.25rem)` }}
            tabIndex={interactive ? (flat.node.id === tabbableId ? 0 : -1) : undefined}
            onClick={interactive ? () => activate(flat) : undefined}
            onKeyDown={interactive ? (e) => onKey(e, flat) : undefined}
            onFocus={interactive ? () => setFocusedId(flat.node.id) : undefined}
          >
            <span
              className={classNames(
                "st-treeView__caret",
                !flat.hasChildren && "st-treeView__caret--leaf",
                flat.expanded && "st-treeView__caret--open",
              )}
              aria-hidden="true"
            />
            <span className="st-treeView__label">{flat.node.label}</span>
          </div>
        );
      })}
    </div>
  );
}
