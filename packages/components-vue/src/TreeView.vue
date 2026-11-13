<script setup lang="ts">
import { ref, computed, useAttrs } from 'vue';
import { classNames } from './classNames.js';
import { scalarContent } from './slotContent.js';


export type TreeNode = {
  id: string;
  label: unknown;
  children?: TreeNode[];
  disabled?: boolean;
};


export type TreeViewProps = {
  onSelect?: (id: string) => void;
  'onUpdate:selectedId'?: (id: string) => void;
  nodes: TreeNode[];
  selectedId?: string;
  /** Svelte-canonical alias of `selectedId`. */
  selected?: string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  /** Svelte-canonical alias of `defaultExpandedIds`. */
  defaultExpanded?: string[];
  /**
   * Accessible name for the tree (parity with the Svelte `label`).
   * An explicit `aria-label` attribute takes precedence over this prop.
   */
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
defineOptions({ name: 'TreeView', inheritAttrs: false });
const props = withDefaults(defineProps<TreeViewProps>(), { selectedId: undefined, selected: undefined, expandedIds: undefined, defaultExpandedIds: undefined, defaultExpanded: undefined, label: "Arborescence", class: undefined });
defineSlots<{ 'node-label'?: (scope: { node: TreeNode; index: number; level: number }) => unknown }>();
const emit = defineEmits<{ select: [id: string]; 'update:selectedId': [id: string] }>();


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

    // Expansion: controlled via `expandedIds`, else internal state seeded from
    // `defaultExpandedIds` / `defaultExpanded` (Svelte-canonical alias).
    const internalExpanded = ref<Set<string>>(
      new Set(props.defaultExpandedIds ?? props.defaultExpanded ?? []),
    );

    const focusedId = ref<string | undefined>(undefined);

    const rootRef = ref<HTMLElement | null>(null);

    const interactive = () => Boolean(props.onSelect) || Boolean(props['onUpdate:selectedId']);


      const expansionControlled = computed(() => Array.isArray(props.expandedIds));

      const expanded = computed(() => expansionControlled.value ? new Set(props.expandedIds) : internalExpanded.value);

      const visible = computed(() => flattenVisible(props.nodes, expanded.value));

      const tabbableId = computed(() => focusedId.value ?? visible.value[0]?.node.id);

      


      const toggle = (id: string) => {
        if (expansionControlled.value) return;
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
        const target = visible.value[index];
        if (!target) return;
        focusedId.value = target.node.id;
        queueMicrotask(() => {
          const rows = Array.from(rootRef.value?.querySelectorAll<HTMLElement>("[data-tree-id]") ?? []);
          rows.find((row) => row.dataset.treeId === target.node.id)?.focus();
        });
      };


      const onKey = (event: KeyboardEvent, flat: TreeFlatNode) => {
        const i = visible.value.findIndex((v) => v.node.id === flat.node.id);
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
            focusAt(visible.value.length - 1);
            break;
          case "ArrowRight":
            event.preventDefault();
            if (flat.hasChildren && !flat.expanded) toggle(flat.node.id);
            else if (flat.hasChildren) focusAt(i + 1);
            break;
          case "ArrowLeft":
            event.preventDefault();
            if (flat.hasChildren && flat.expanded) toggle(flat.node.id);
            else if (flat.parentId) focusAt(visible.value.findIndex((v) => v.node.id === flat.parentId));
            break;
          case "Enter":
          case " ":
            event.preventDefault();
            activate(flat);
            break;
        }
      };
const attrs = useAttrs();
</script>

<template>
  <div v-bind="$attrs" ref="rootRef" :class="classNames('st-treeView', props.class)" role="tree" :aria-label="(attrs['aria-label'] as string | undefined) ?? props.label">
    <div v-for="(flat, index) in visible" :key="flat.node.id" role="treeitem" :aria-level="flat.level" :aria-expanded="flat.hasChildren ? (flat.expanded ? 'true' : 'false') : undefined" :aria-selected="flat.node.id === (props.selectedId ?? props.selected) ? 'true' : 'false'" :aria-disabled="flat.node.disabled ? 'true' : undefined" :class="classNames('st-treeView__row', flat.node.id === (props.selectedId ?? props.selected) && 'st-treeView__row--selected', flat.node.disabled && 'st-treeView__row--disabled')" :data-tree-id="flat.node.id" :style="`padding-inline-start: calc(${flat.level - 1} * var(--st-spacing-4, 1rem) + 0.25rem)`" :tabindex="interactive() ? (flat.node.id === tabbableId ? 0 : -1) : undefined" @click="interactive() ? activate(flat) : undefined" @keydown="interactive() ? onKey($event, flat) : undefined" @focus="interactive() ? (focusedId = flat.node.id) : undefined">
      <span :class="classNames('st-treeView__caret', !flat.hasChildren && 'st-treeView__caret--leaf', flat.expanded && 'st-treeView__caret--open')" aria-hidden="true" /><span class="st-treeView__label"><slot v-if="$slots['node-label']" name="node-label" :node="flat.node" :index="index" :level="flat.level" /><template v-else>{{ scalarContent(flat.node.label) }}</template></span>
    </div>
  </div>
</template>
