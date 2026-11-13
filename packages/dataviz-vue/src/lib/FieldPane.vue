<script setup lang="ts">
import { computed } from 'vue';
import type { TreeViewProps } from '@sentropic/design-system-vue';
import { buildFieldPaneTree, type DataModel, type FieldId } from '@sentropic/dataviz-core';
import FieldPaneRows from './FieldPaneRows.vue';
import FieldPaneTree from './FieldPaneTree.vue';

export type FieldPaneProps = {
  model: DataModel;
  includeDimensions?: boolean;
  includeMeasures?: boolean;
  selectedId?: FieldId | string;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  onSelect?: (id: FieldId | string) => void;
  label?: string;
  class?: string;
};

defineOptions({ name: 'FieldPane' });
const props = withDefaults(defineProps<FieldPaneProps>(), {
  includeDimensions: undefined, includeMeasures: undefined, selectedId: undefined,
  expandedIds: undefined, defaultExpandedIds: undefined, onSelect: undefined, label: 'Fields', class: undefined,
});
const tree = computed(() => buildFieldPaneTree(props.model, {
  includeDimensions: props.includeDimensions, includeMeasures: props.includeMeasures,
}));
const expanded = computed(() => new Set(props.expandedIds ?? props.defaultExpandedIds ?? tree.value.defaultExpandedIds));
</script>

<template>
  <div v-if="props.onSelect" :class="['st-treeView', props.class]" role="tree" :aria-label="props.label">
    <FieldPaneRows :nodes="tree.nodes" :expanded="expanded" :selected-id="props.selectedId" @select="props.onSelect" />
  </div>
  <FieldPaneTree v-else :nodes="tree.nodes" :selected-id="props.selectedId" :expanded-ids="props.expandedIds"
    :default-expanded-ids="props.defaultExpandedIds ?? tree.defaultExpandedIds" :class="props.class" :aria-label="props.label" />
</template>
