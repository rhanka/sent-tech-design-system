<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ScatterPlotMatrixProps = {
    /** The dashboard store to bind to. */
    store: DashboardStore;
    /** This view's id in the cross-filter graph. */
    viewId: string;
    /** Ordered list of measure field ids to cross (N×N grid). */
    measures: string[];
    /** Accessible label for the matrix group. */
    label: string;
    /** Size in px of each individual cell. Defaults to 160. */
    cellSize?: number;
    class?: string;
  };
</script>

<script lang="ts">
  import { ScatterPlot as DsScatterPlot } from '@sentropic/design-system-svelte';
  import type { ScatterPlotDatum } from '@sentropic/design-system-svelte';
  import { buildScatterModel } from '@sentropic/dataviz-core';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    measures,
    label,
    cellSize = 160,
    class: className,
  }: ScatterPlotMatrixProps = $props();

  const dash = $derived(useDashboard(store));

  const cells = $derived.by(() => {
    void $dash;
    const rows = store.applyCrossfilter(viewId);
    const result: { row: number; col: number; data: ScatterPlotDatum[]; xLabel: string; yLabel: string }[] = [];
    for (let row = 0; row < measures.length; row++) {
      for (let col = 0; col < measures.length; col++) {
        const m = buildScatterModel(store.model, rows, {
          x: measures[col]!,
          y: measures[row]!,
        });
        result.push({ row, col, data: m.data as ScatterPlotDatum[], xLabel: m.xLabel, yLabel: m.yLabel });
      }
    }
    return result;
  });
</script>

<div
  role="group"
  aria-label={label}
  class={['splom-grid', className].filter(Boolean).join(' ')}
  style:display="grid"
  style:grid-template-columns={`repeat(${measures.length}, ${cellSize}px)`}
  style:gap="var(--st-spacing-2, 8px)"
>
  {#each cells as cell (`${cell.row}-${cell.col}`)}
    <DsScatterPlot
      data={cell.data}
      xLabel={cell.xLabel}
      yLabel={cell.yLabel}
      width={cellSize}
      height={cellSize}
      label={`${label} — ${cell.yLabel} × ${cell.xLabel}`}
    />
  {/each}
</div>
