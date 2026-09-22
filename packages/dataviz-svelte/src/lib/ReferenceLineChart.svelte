<script lang="ts" module>
  import type { DashboardStore } from '@sentropic/dataviz-core';

  export type ReferenceLineChartProps = {
    store: DashboardStore;
    viewId: string;
    value?: number;
    measure?: string;
    referenceId?: string;
    referenceLabel?: string;
    domainMin?: number;
    domainMax?: number;
    width?: number;
    height?: number;
    label: string;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    onSelectKey?: (key: string | null) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildReferenceLineModel } from '@sentropic/dataviz-core';
  import { LineChart as DsLineChart, type LineChartDatum } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    value,
    measure,
    referenceId,
    referenceLabel,
    domainMin,
    domainMax,
    width = 360,
    height = 96,
    label,
    hoverKey,
    onHoverKeyChange,
    onSelectKey,
    class: className,
  }: ReferenceLineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildReferenceLineModel(store.model, store.applyCrossfilter(viewId), {
      id: referenceId,
      label: referenceLabel,
      value,
      measure,
    });
  });
  const xDomain = $derived.by((): [number, number] => {
    const min = domainMin ?? Math.min(0, model.value);
    const max = domainMax ?? Math.max(1, model.value);
    return min < max ? [min, max] : [min, min + 1];
  });
  const data = $derived.by(
    (): LineChartDatum[] => [
      { x: xDomain[0], y: 0 },
      { x: xDomain[1], y: 0 },
    ],
  );
  const referenceLines = $derived([{ axis: 'x' as const, value: model.value, label: model.label, tone: 'info' as const }]);
  const classes = $derived(['st-referenceLineChart', className].filter(Boolean).join(' '));
</script>

<DsLineChart {data} {width} {height} {label} {referenceLines} {hoverKey} {onHoverKeyChange} {onSelectKey} class={classes} />
