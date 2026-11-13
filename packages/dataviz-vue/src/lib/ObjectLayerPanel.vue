<script setup lang="ts">
import { computed } from 'vue';
import { Button, TreeView, type TreeViewProps } from '@sentropic/design-system-vue';
import { buildObjectLayerTree, isObjectLayerVisible, type DashboardObjectLayer } from '@sentropic/dataviz-core';

export type ObjectLayerPanelProps = {
  layers: readonly DashboardObjectLayer[];
  selectedId?: string;
  expandedIds?: TreeViewProps['expandedIds'];
  defaultExpandedIds?: TreeViewProps['defaultExpandedIds'];
  label?: string;
  onSelect?: (layer: DashboardObjectLayer) => void;
  onVisibilityChange?: (layer: DashboardObjectLayer, visible: boolean) => void;
  class?: string;
};

defineOptions({ name: 'ObjectLayerPanel' });
const props = withDefaults(defineProps<ObjectLayerPanelProps>(), { selectedId: undefined, expandedIds: undefined, defaultExpandedIds: undefined, label: 'Objects', onSelect: undefined, onVisibilityChange: undefined, class: undefined });
const tree = computed(() => buildObjectLayerTree(props.layers));
</script>

<template>
  <div role="group" :aria-label="props.label" :class="props.class">
    <TreeView :nodes="tree.nodes" :selected-id="props.selectedId" :expanded-ids="props.expandedIds" :default-expanded-ids="props.defaultExpandedIds ?? tree.defaultExpandedIds" :aria-label="props.label + ' tree'" />
    <div>
      <div v-for="layer in props.layers" :key="layer.id" :data-layer-id="layer.id">
        <Button type="button" :variant="layer.id === props.selectedId ? 'primary' : 'secondary'" size="sm" :aria-label="'Select ' + layer.label" @click="props.onSelect?.(layer)">Select</Button>
        <Button type="button" variant="ghost" size="sm" :aria-label="(isObjectLayerVisible(layer) ? 'Hide' : 'Show') + ' ' + layer.label" :disabled="layer.locked" @click="props.onVisibilityChange?.(layer, !isObjectLayerVisible(layer))">{{ isObjectLayerVisible(layer) ? 'Hide' : 'Show' }}</Button>
      </div>
    </div>
  </div>
</template>
