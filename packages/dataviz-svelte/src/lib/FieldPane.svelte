<script lang="ts" module>
  import type { DataModel, FieldId } from '@sentropic/dataviz-core';

  export type FieldPaneProps = {
    model: DataModel;
    includeDimensions?: boolean;
    includeMeasures?: boolean;
    selectedId?: FieldId | string;
    defaultExpandedIds?: string[];
    onSelect?: (id: FieldId | string) => void;
    label?: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { TreeView } from '@sentropic/design-system-svelte';
  import { buildFieldPaneTree } from '@sentropic/dataviz-core';

  let {
    model,
    includeDimensions,
    includeMeasures,
    selectedId,
    defaultExpandedIds,
    onSelect,
    label = 'Fields',
    class: className,
  }: FieldPaneProps = $props();

  const tree = $derived(buildFieldPaneTree(model, { includeDimensions, includeMeasures }));
</script>

<TreeView
  nodes={tree.nodes}
  selected={selectedId}
  defaultExpanded={defaultExpandedIds ?? tree.defaultExpandedIds}
  onselect={onSelect}
  {label}
  class={className}
/>
