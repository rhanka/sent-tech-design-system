<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';
  import type { BarChartTone } from '@sentropic/design-system-svelte';

  /** Which design-system chart renders the current drill level. */
  export type DrillChartKind = 'bar' | 'donut' | 'treemap';

  export type DrillChartProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** This view's id (drill state + cross-filter scope live under it). */
    viewId: string;
    /** Ordered dimension hierarchy; the chart groups by the current drill level. */
    hierarchy: string[];
    /** Measure id aggregated into each datum's value. */
    measure: string;
    /** Accessible label of the chart. */
    label: string;
    /** Design-system chart to render for the current level. Defaults to `'bar'`. */
    kind?: DrillChartKind;
    /** Bar tone (only used by `kind="bar"`). */
    tone?: BarChartTone;
    orientation?: 'vertical' | 'horizontal';
    width?: number;
    height?: number;
    /** Donut diameter (only used by `kind="donut"`). */
    size?: number;
    /** Donut ring thickness (only used by `kind="donut"`). */
    thickness?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { Button, Inline } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { drillLevel, onDrillSelect } from './drill.js';
  import DrillBarChart from './DrillBarChart.svelte';
  import DonutChart from './DonutChart.svelte';
  import TreemapChart from './TreemapChart.svelte';

  let {
    store,
    viewId,
    hierarchy,
    measure,
    label,
    kind = 'bar',
    tone,
    orientation = 'vertical',
    width,
    height,
    size,
    thickness,
    class: className,
  }: DrillChartProps = $props();

  // `$dash` establishes the reactive dependency so the level re-resolves on
  // every store mutation (drill / filter / select).
  const dash = $derived(useDashboard(store));
  const level = $derived.by(() => {
    void $dash;
    return drillLevel(store, viewId, hierarchy, measure);
  });
  const selectedKeys = $derived($dash.selections[viewId] ?? []);

  function select(key: string) {
    onDrillSelect(store, viewId, hierarchy, key);
  }
</script>

{#if kind === 'bar'}
  <!-- The bar wrapper already owns the full drill+select click surface. -->
  <DrillBarChart {store} {viewId} {hierarchy} {measure} {label} {tone} {orientation} {width} {height} class={className} />
{:else}
  <!--
    Donut / treemap DS charts are purely presentational (no click surface), so
    the visual comes from the existing wrapper and the drill interaction is an
    accessible row of DS Buttons driven by the shared engine — composition, no
    new visuals.
  -->
  <Inline gap={2} class={className}>
    {#if kind === 'donut'}
      <DonutChart {store} {viewId} category={level.dimension ?? hierarchy[0]} {measure} {label} {size} {thickness} />
    {:else}
      <TreemapChart {store} {viewId} hierarchy={level.dimension ? [level.dimension] : hierarchy} {measure} {label} {width} {height} />
    {/if}
    <Inline gap={1} role="group" aria-label={`${label} — ${level.canDrill ? 'drill' : 'select'}`}>
      {#each level.data as datum (datum.key)}
        <Button
          variant={!level.canDrill && selectedKeys.includes(datum.key) ? 'primary' : 'ghost'}
          onclick={() => select(datum.key)}
        >
          {datum.key}: {datum.value}
        </Button>
      {/each}
    </Inline>
  </Inline>
{/if}
