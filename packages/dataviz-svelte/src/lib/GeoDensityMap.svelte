<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoDensityMapProps = {
    store: DashboardStore;
    viewId: string;
    latitude: string;
    longitude: string;
    value?: string;
    cellSize?: number;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { GeoChart as DsGeoChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { densityLayer, mapClass } from './geoMapLayers.js';

  let {
    store,
    viewId,
    latitude,
    longitude,
    value,
    cellSize,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoDensityMapProps = $props();

  const dash = $derived(useDashboard(store));
  const layer = $derived.by(() => {
    void $dash;
    void cellSize;
    return densityLayer(store, viewId, { latitude, longitude, value, labelText: label });
  });
  const layers = $derived([layer]);
  const classes = $derived(mapClass('st-geoDensityMap', className));
</script>

<DsGeoChart {layers} {width} {height} {label} class={classes} />
