<script lang="ts" module>
  import type { DashboardObjectLayer } from '@sentropic/dataviz-core';

  export type ObjectLayerPanelProps = {
    layers: readonly DashboardObjectLayer[];
    selectedId?: string;
    defaultExpandedIds?: string[];
    label?: string;
    onSelect?: (layer: DashboardObjectLayer) => void;
    onVisibilityChange?: (layer: DashboardObjectLayer, visible: boolean) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { Button, TreeView } from '@sentropic/design-system-svelte';
  import { buildObjectLayerTree, isObjectLayerVisible } from '@sentropic/dataviz-core';

  let {
    layers,
    selectedId,
    defaultExpandedIds,
    label = 'Objects',
    onSelect,
    onVisibilityChange,
    class: className,
  }: ObjectLayerPanelProps = $props();

  const tree = $derived(buildObjectLayerTree(layers));
</script>

<div role="group" aria-label={label} class={className}>
  <TreeView
    nodes={tree.nodes}
    selected={selectedId}
    defaultExpanded={defaultExpandedIds ?? tree.defaultExpandedIds}
    label={`${label} tree`}
  />
  <div>
    {#each layers as layer (layer.id)}
      {@const visible = isObjectLayerVisible(layer)}
      <div data-layer-id={layer.id}>
        <Button
          type="button"
          variant={layer.id === selectedId ? 'primary' : 'secondary'}
          size="sm"
          aria-label={`Select ${layer.label}`}
          onclick={() => onSelect?.(layer)}
        >
          Select
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={`${visible ? 'Hide' : 'Show'} ${layer.label}`}
          disabled={layer.locked}
          onclick={() => onVisibilityChange?.(layer, !visible)}
        >
          {visible ? 'Hide' : 'Show'}
        </Button>
      </div>
    {/each}
  </div>
</div>
