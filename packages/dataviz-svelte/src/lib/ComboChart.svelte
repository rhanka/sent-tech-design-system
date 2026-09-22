<script lang="ts" module>
  import type {
    ChartAnnotation,
    CategoricalMeasureInput,
    CategoricalMode,
    DashboardStore,
  } from '@sentropic/dataviz-core';
  import type { DataLabelsProp } from '@sentropic/design-system-svelte';

  export type ComboChartProps = {
    store: DashboardStore;
    viewId: string;
    category: string;
    measures: CategoricalMeasureInput[];
    series?: string;
    mode?: CategoricalMode;
    leftAxisLabel?: string;
    rightAxisLabel?: string;
    legend?: boolean;
    hiddenSeries?: string[];
    onToggleSeries?: (seriesId: string) => void;
    annotations?: ChartAnnotation[];
    dataLabels?: DataLabelsProp;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    onSelectKey?: (key: string | null) => void;
    width?: number;
    height?: number;
    label: string;
    class?: string;
  };
</script>

<script lang="ts">
  import {
    ComboChart as DsComboChart,
    type ComboChartBarSeries,
    type ComboChartLineSeries,
  } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';
  import { buildSafeCategoricalSeries } from './categoricalData.js';

  let {
    store,
    viewId,
    category,
    measures,
    series,
    mode = 'grouped',
    leftAxisLabel,
    rightAxisLabel,
    legend = true,
    hiddenSeries,
    onToggleSeries,
    annotations,
    dataLabels,
    hoverKey,
    onHoverKeyChange,
    onSelectKey,
    width,
    height,
    label,
    class: className,
  }: ComboChartProps = $props();

  const dash = $derived(useDashboard(store));
  const seriesModel = $derived.by(() => {
    void $dash;
    return buildSafeCategoricalSeries(store.model, store.applyCrossfilter(viewId), {
      category,
      series,
      measures,
      mode,
    });
  });
  const bars = $derived.by(
    (): ComboChartBarSeries[] =>
      seriesModel.series
        .filter((item) => item.mark === 'bar')
        .map((item) => ({ label: item.label, data: item.values })),
  );
  const lines = $derived.by(
    (): ComboChartLineSeries[] =>
      seriesModel.series
        .filter((item) => item.mark === 'line')
        .map((item) => ({ label: item.label, data: item.values })),
  );
</script>

<DsComboChart
  categories={seriesModel.categories}
  {bars}
  {lines}
  {leftAxisLabel}
  {rightAxisLabel}
  {legend}
  {hiddenSeries}
  {onToggleSeries}
  {annotations}
  {dataLabels}
  {hoverKey}
  {onHoverKeyChange}
  {onSelectKey}
  {width}
  {height}
  {label}
  class={className}
/>
