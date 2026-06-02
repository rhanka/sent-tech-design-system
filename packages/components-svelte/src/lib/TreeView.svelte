<script lang="ts" module>
  export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";

  type FlatNode = {
    node: TreeNode;
    level: number;
    parentId: string | null;
    hasChildren: boolean;
    expanded: boolean;
  };

  type TreeViewProps = {
    nodes: TreeNode[];
    /** Id du nœud sélectionné (bindable). */
    selected?: string;
    /** Ids dépliés au départ. */
    defaultExpanded?: string[];
    label?: string;
    class?: string;
    onselect?: (id: string) => void;
  };

  let {
    nodes,
    selected = $bindable<string | undefined>(undefined),
    defaultExpanded = [],
    label = "Arborescence",
    class: className,
    onselect
  }: TreeViewProps = $props();

  // Graine unique depuis la prop (untrack : seed initial, pas de dépendance réactive).
  let expanded = $state<Record<string, boolean>>(
    untrack(() => Object.fromEntries(defaultExpanded.map((id) => [id, true])))
  );
  let focusedId = $state<string | undefined>(undefined);

  const classes = () => ["st-treeView", className].filter(Boolean).join(" ");

  // Liste à plat des nœuds VISIBLES (respecte l'état déplié) pour la nav clavier.
  const visible = $derived.by(() => {
    const out: FlatNode[] = [];
    const walk = (items: TreeNode[], level: number, parentId: string | null) => {
      for (const node of items) {
        const hasChildren = Boolean(node.children && node.children.length > 0);
        const isExpanded = Boolean(expanded[node.id]);
        out.push({ node, level, parentId, hasChildren, expanded: isExpanded });
        if (hasChildren && isExpanded) walk(node.children!, level + 1, node.id);
      }
    };
    walk(nodes, 1, null);
    return out;
  });

  const tabbableId = $derived(focusedId ?? visible[0]?.node.id);

  function toggle(id: string) {
    expanded = { ...expanded, [id]: !expanded[id] };
  }

  function activate(flat: FlatNode) {
    if (flat.node.disabled) return;
    focusedId = flat.node.id;
    if (flat.hasChildren) {
      toggle(flat.node.id);
    } else {
      selected = flat.node.id;
      onselect?.(flat.node.id);
    }
  }

  function focusAt(index: number) {
    const target = visible[index];
    if (!target) return;
    focusedId = target.node.id;
    queueMicrotask(() => {
      document
        .querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(target.node.id)}"]`)
        ?.focus();
    });
  }

  function onKey(event: KeyboardEvent, flat: FlatNode) {
    const i = visible.findIndex((v) => v.node.id === flat.node.id);
    switch (event.key) {
      case "ArrowDown": event.preventDefault(); focusAt(i + 1); break;
      case "ArrowUp": event.preventDefault(); focusAt(i - 1); break;
      case "Home": event.preventDefault(); focusAt(0); break;
      case "End": event.preventDefault(); focusAt(visible.length - 1); break;
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
</script>

<ul {...{ role: "tree" }} class={classes()} aria-label={label}>
  {#each visible as flat (flat.node.id)}
    <li role="none">
      <div
        role="treeitem"
        aria-level={flat.level}
        aria-expanded={flat.hasChildren ? flat.expanded : undefined}
        aria-selected={selected === flat.node.id}
        aria-disabled={flat.node.disabled || undefined}
        class="st-treeView__row"
        class:st-treeView__row--selected={selected === flat.node.id}
        class:st-treeView__row--disabled={flat.node.disabled}
        data-tree-id={flat.node.id}
        style={`padding-inline-start: calc(${flat.level - 1} * var(--st-spacing-4, 1rem) + 0.25rem)`}
        tabindex={flat.node.id === tabbableId ? 0 : -1}
        onclick={() => activate(flat)}
        onkeydown={(e) => onKey(e, flat)}
        onfocus={() => (focusedId = flat.node.id)}
      >
        {#if flat.hasChildren}
          <span class="st-treeView__caret" class:st-treeView__caret--open={flat.expanded} aria-hidden="true"></span>
        {:else}
          <span class="st-treeView__caret st-treeView__caret--leaf" aria-hidden="true"></span>
        {/if}
        <span class="st-treeView__label">{flat.node.label}</span>
      </div>
    </li>
  {/each}
</ul>

<style>
  .st-treeView {
    color: var(--st-semantic-text-primary);
    list-style: none;
    margin: 0;
    padding: var(--st-spacing-1, 0.25rem);
  }

  .st-treeView__row {
    align-items: center;
    border-radius: var(--st-radius-md, 0.375rem);
    cursor: pointer;
    display: flex;
    gap: var(--st-spacing-1, 0.25rem);
    padding-block: 0.3rem;
    padding-inline-end: 0.5rem;
  }

  .st-treeView__row:hover:not(.st-treeView__row--disabled) {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
  }

  .st-treeView__row:focus-visible {
    outline: 2px solid var(--st-semantic-border-interactive);
    outline-offset: -2px;
  }

  .st-treeView__row--selected {
    background: var(--st-component-control-hoverBackground, var(--st-semantic-surface-subtle));
    color: var(--st-semantic-action-primary);
    font-weight: 600;
  }

  .st-treeView__row--disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .st-treeView__caret {
    flex: 0 0 auto;
    height: 0.85rem;
    position: relative;
    width: 0.85rem;
  }

  .st-treeView__caret:not(.st-treeView__caret--leaf)::before {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid currentColor;
    content: "";
    inset-block-start: 0.32rem;
    inset-inline-start: 0.1rem;
    position: absolute;
    transform: rotate(-90deg);
    transition: transform var(--st-motion-fast, 120ms) var(--st-motion-easing, ease);
  }

  .st-treeView__caret--open::before {
    transform: rotate(0deg);
  }

  .st-treeView__label {
    font-size: 0.9rem;
    line-height: 1.3;
  }
</style>
