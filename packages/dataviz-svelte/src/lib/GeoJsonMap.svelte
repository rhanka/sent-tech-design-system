<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type GeoJsonMapProps = {
    store: DashboardStore;
    viewId: string;
    geometry: string;
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
  import { geojsonLayer, mapClass } from './geoMapLayers.js';

  let {
    store,
    viewId,
    geometry,
    id,
    labelField,
    value,
    width = 520,
    height = 320,
    label,
    class: className,
  }: GeoJsonMapProps = $props();

  const dash = $derived(useDashboard(store));
  const layer = $derived.by(() => {
    void $dash;
    return geojsonLayer(store, viewId, {
      geometry,
      id,
      label: labelField,
      value,
      labelText: label,
    });
  });
  const layers = $derived([layer]);
  const classes = $derived(mapClass('st-geoJsonMap', className));
</script>

<DsGeoChart {layers} {width} {height} {label} class={classes} />
