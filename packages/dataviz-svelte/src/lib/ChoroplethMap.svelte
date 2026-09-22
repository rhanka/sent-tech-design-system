<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ChoroplethMapProps = {
    store: DashboardStore;
    viewId: string;
    region: string;
    measure: string;
    geometry?: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { GeoChart as DsGeoChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { choroplethLayer, mapClass } from './geoMapLayers.js';

  let {
    store,
    viewId,
    region,
    measure,
    geometry,
    width = 520,
    height = 260,
    label,
    class: className,
  }: ChoroplethMapProps = $props();

  const dash = $derived(useDashboard(store));
  const layer = $derived.by(() => {
    void $dash;
    return choroplethLayer(store, viewId, { region, measure, geometry, labelText: label });
  });
  const layers = $derived([layer]);
  const classes = $derived(mapClass('st-choroplethMap', className));
</script>

<DsGeoChart {layers} {width} {height} {label} class={classes} />
