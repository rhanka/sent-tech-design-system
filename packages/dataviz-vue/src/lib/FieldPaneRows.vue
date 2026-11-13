<script setup lang="ts">
import type { FieldId, FieldPaneNode } from '@sentropic/dataviz-core';

defineOptions({ name: 'FieldPaneRows', inheritAttrs: false });
const props = defineProps<{
  nodes: FieldPaneNode[];
  expanded: ReadonlySet<string>;
  selectedId?: FieldId | string;
  onSelect: (id: FieldId | string) => void;
}>();
const rowClass = (node: FieldPaneNode) => [
  'st-treeView__row', node.id === props.selectedId && 'st-treeView__row--selected', node.disabled && 'st-treeView__row--disabled',
];
const caretClass = (node: FieldPaneNode) => [
  'st-treeView__caret', !node.children?.length && 'st-treeView__caret--leaf', props.expanded.has(node.id) && 'st-treeView__caret--open',
];
</script>

<template>
  <div v-for="node in props.nodes" :key="node.id">
    <button v-if="node.field && !node.disabled" type="button" :class="rowClass(node)" role="treeitem"
      :aria-selected="node.id === props.selectedId"
      style="appearance:none;background:transparent;border:0;color:inherit;font:inherit;padding:0;text-align:left;width:100%;"
      @click="props.onSelect(node.id)">
      <span :class="caretClass(node)">›</span><span class="st-treeView__label">{{ node.label }}</span>
    </button>
    <div v-else :class="rowClass(node)" role="treeitem" :aria-expanded="node.children?.length ? props.expanded.has(node.id) : undefined">
      <span :class="caretClass(node)">›</span><span class="st-treeView__label">{{ node.label }}</span>
    </div>
    <FieldPaneRows v-if="node.children?.length && props.expanded.has(node.id)" :nodes="node.children!"
      :expanded="props.expanded" :selected-id="props.selectedId" :on-select="props.onSelect" />
  </div>
</template>
