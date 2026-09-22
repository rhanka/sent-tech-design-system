<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoPointMapProps = {
    store: DashboardStore;
    viewId: string;
    latitude: string;
    longitude: string;
    id?: string;
    labelField?: string;
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
  import { mapClass, pointsLayer } from './geoMapLayers.js';

  let {
    store,
    viewId,
    latitude,
    longitude,
    id,
    labelField,
    value,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoPointMapProps = $props();

  const dash = $derived(useDashboard(store));
  const layer = $derived.by(() => {
    void $dash;
    return pointsLayer(store, viewId, {
      latitude,
      longitude,
      id,
      label: labelField,
      value,
      labelText: label,
    });
  });
  const layers = $derived([layer]);
  const classes = $derived(mapClass('st-geoPointMap', className));
</script>

<DsGeoChart {layers} {width} {height} {label} class={classes} />
