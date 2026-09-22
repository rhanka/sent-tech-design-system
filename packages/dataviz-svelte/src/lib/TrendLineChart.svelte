<script lang="ts" module>
  import type { ChartAnnotation, DashboardStore } from '@sentropic/dataviz-core';
  import type { DataLabelsProp as ChartDataLabels } from '@sentropic/design-system-svelte';

  export type TrendLineChartProps = {
    store: DashboardStore;
    viewId: string;
    x: string;
    y: string;
    width?: number;
    height?: number;
    label: string;
    annotations?: ChartAnnotation[];
    dataLabels?: ChartDataLabels;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    onSelectKey?: (key: string | null) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { buildTrendLineModel } from '@sentropic/dataviz-core';
  import { LineChart as DsLineChart, type LineChartDatum } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';

  let {
    store,
    viewId,
    x,
    y,
    width = 360,
    height = 220,
    label,
    annotations,
    dataLabels,
    hoverKey,
    onHoverKeyChange,
    onSelectKey,
    class: className,
  }: TrendLineChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    return buildTrendLineModel(store.model, store.applyCrossfilter(viewId), { x, y });
  });
  const data = $derived.by((): LineChartDatum[] => model.points.map((point) => ({ x: point.x, y: point.y })));
  const classes = $derived(['st-trendLineChart', className].filter(Boolean).join(' '));
</script>

<DsLineChart {data} {width} {height} {label} {annotations} {dataLabels} trend={true} {hoverKey} {onHoverKeyChange} {onSelectKey} class={classes} />
