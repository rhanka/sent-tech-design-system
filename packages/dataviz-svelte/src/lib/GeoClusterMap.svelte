<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoClusterMapProps = {
    store: DashboardStore;
    viewId: string;
    latitude: string;
    longitude: string;
    id?: string;
    value?: string;
    radius?: number;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { GeoChart as DsGeoChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { clusterLayer, mapClass } from './geoMapLayers.js';

  let {
    store,
    viewId,
    latitude,
    longitude,
    id,
    value,
    radius,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoClusterMapProps = $props();

  const dash = $derived(useDashboard(store));
  const layer = $derived.by(() => {
    void $dash;
    return clusterLayer(store, viewId, { latitude, longitude, id, value, radius, labelText: label });
  });
  const layers = $derived([layer]);
  const classes = $derived(mapClass('st-geoClusterMap', className));
</script>

<DsGeoChart {layers} {width} {height} {label} class={classes} />
