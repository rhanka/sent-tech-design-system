<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FieldPaneNode } from '@sentropic/dataviz-core';

// This branch preserves TreeView's passive flat rows. FieldPane handles the
// onSelect prop in its separate recursive authoring branch.
defineOptions({ name: 'FieldPaneTree', inheritAttrs: false });
const props = withDefaults(defineProps<{
  nodes: FieldPaneNode[];
  selectedId?: string;
  selected?: string;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  defaultExpanded?: string[];
  label?: string;
  class?: string;
}>(), { label: 'Arborescence' });
const internalExpanded = ref(new Set(props.defaultExpandedIds ?? props.defaultExpanded ?? []));
const expanded = computed(() => Array.isArray(props.expandedIds) ? new Set(props.expandedIds) : internalExpanded.value);
type FlatNode = { node: FieldPaneNode; level: number; parentId: string | null; hasChildren: boolean; expanded: boolean };
const visible = computed(() => {
  const result: FlatNode[] = [];
  function walk(nodes: FieldPaneNode[], level: number, parentId: string | null) {
    for (const node of nodes) {
      const hasChildren = Boolean(node.children?.length);
      const isExpanded = expanded.value.has(node.id);
      result.push({ node, level, parentId, hasChildren, expanded: isExpanded });
      if (hasChildren && isExpanded) walk(node.children!, level + 1, node.id);
    }
  }
  walk(props.nodes, 1, null);
  return result;
});
const selectedId = computed(() => props.selectedId ?? props.selected);
const rowClass = (flat: FlatNode) => ['st-treeView__row',
  flat.node.id === selectedId.value && 'st-treeView__row--selected', flat.node.disabled && 'st-treeView__row--disabled'].filter(Boolean).join(' ');
</script>

<template>
  <div v-bind="$attrs" :class="['st-treeView', props.class].filter(Boolean).join(' ')" role="tree" :aria-label="($attrs['aria-label'] as string | undefined) ?? props.label">
    <div v-for="flat in visible" :key="flat.node.id" role="treeitem" :aria-level="flat.level"
      :aria-expanded="flat.hasChildren ? (flat.expanded ? 'true' : 'false') : undefined"
      :aria-selected="flat.node.id === selectedId ? 'true' : 'false'" :aria-disabled="flat.node.disabled ? 'true' : undefined"
      :class="rowClass(flat)" :data-tree-id="flat.node.id"
      :style="'padding-inline-start: calc(' + (flat.level - 1) + ' * var(--st-spacing-4, 1rem) + 0.25rem)'">
      <span :class="['st-treeView__caret', !flat.hasChildren && 'st-treeView__caret--leaf', flat.expanded && 'st-treeView__caret--open'].filter(Boolean).join(' ')" aria-hidden="true" />
      <span class="st-treeView__label">{{ flat.node.label }}</span>
    </div>
  </div>
</template>
