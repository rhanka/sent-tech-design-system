<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoFlowMapProps = {
    store: DashboardStore;
    viewId: string;
    sourceLatitude: string;
    sourceLongitude: string;
    targetLatitude: string;
    targetLongitude: string;
    value?: string;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import { GeoChart as DsGeoChart } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { flowLayer, mapClass } from './geoMapLayers.js';

  let {
    store,
    viewId,
    sourceLatitude,
    sourceLongitude,
    targetLatitude,
    targetLongitude,
    value,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoFlowMapProps = $props();

  const dash = $derived(useDashboard(store));
  const layer = $derived.by(() => {
    void $dash;
    return flowLayer(store, viewId, {
      sourceLatitude,
      sourceLongitude,
      targetLatitude,
      targetLongitude,
      value,
      labelText: label,
    });
  });
  const layers = $derived([layer]);
  const classes = $derived(mapClass('st-geoFlowMap', className));
</script>

<DsGeoChart {layers} {width} {height} {label} class={classes} />
