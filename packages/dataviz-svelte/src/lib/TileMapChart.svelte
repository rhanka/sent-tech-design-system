<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type TileMapChartProps = {
    store: DashboardStore;
    viewId: string;
    /** Field id whose value becomes the tile label. */
    label_field: string;
    /** Field id whose numeric value becomes the column position. */
    col: string;
    /** Field id whose numeric value becomes the row position. */
    row: string;
    /** Field id whose numeric value encodes tile intensity. */
    value: string;
    width?: number;
    height?: number;
    /** Accessible label for the chart (aria-label). */
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { TileMapChart as DsTileMapChart } from '@sentropic/design-system-svelte';
  import type { TileMapChartTile } from '@sentropic/design-system-svelte';
  import { buildTileMapData } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    label_field,
    col,
    row,
    value,
    width,
    height,
    label,
    class: className,
  }: TileMapChartProps = $props();

  const dash = $derived(useDashboard(store));
  const data = $derived.by(() => {
    void $dash;
    return buildTileMapData(store.model, store.applyCrossfilter(viewId), {
      label: label_field,
      col,
      row,
      value,
    });
  });
</script>

<DsTileMapChart
  data={data as TileMapChartTile[]}
  {label}
  {width}
  {height}
  class={className}
/>
