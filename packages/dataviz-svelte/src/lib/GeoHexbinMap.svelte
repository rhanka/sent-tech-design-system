<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoHexbinMapProps = {
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
  import { hexbinLayer, mapClass } from './geoMapLayers.js';

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
  }: GeoHexbinMapProps = $props();

  const dash = $derived(useDashboard(store));
  const layer = $derived.by(() => {
    void $dash;
    return hexbinLayer(store, viewId, { latitude, longitude, value, cellSize, labelText: label });
  });
  const layers = $derived([layer]);
  const classes = $derived(mapClass('st-geoHexbinMap', className));
</script>

<DsGeoChart {layers} {width} {height} {label} class={classes} />
