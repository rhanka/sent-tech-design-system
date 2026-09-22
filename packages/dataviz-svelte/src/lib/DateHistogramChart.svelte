<script lang="ts" module>
  import type {
    DashboardStore,
    DateHistogramBin,
    DateHistogramConfig,
    DateHistogramModel,
    TimeRange,
  } from '@sentropic/dataviz-core';
  import type { BarChartTone } from '@sentropic/design-system-svelte';

  export type DateHistogramChartTone = BarChartTone;
  export type DateHistogramLabelFormatter = (bin: DateHistogramBin, model: DateHistogramModel) => string;

  export type DateHistogramChartProps = {
    store: DashboardStore;
    viewId?: string;
    date: DateHistogramConfig['date'];
    interval?: DateHistogramConfig['interval'];
    bins?: DateHistogramConfig['bins'];
    domain?: DateHistogramConfig['domain'];
    label: string;
    tone?: DateHistogramChartTone;
    selectable?: boolean;
    width?: number;
    height?: number;
    hoverKey?: string | null;
    onHoverKeyChange?: (key: string | null) => void;
    onSelectKey?: (key: string | null) => void;
    formatLabel?: DateHistogramLabelFormatter;
    enableBrush?: boolean;
    brushRange?: TimeRange | null;
    onTimeRangeChange?: (range: TimeRange | null) => void;
    class?: string;
  };
</script>

<script lang="ts">
  import { untrack } from 'svelte';
  import { buildDateHistogramModel, rangeSelectionKey } from '@sentropic/dataviz-core';
  import { BarChart as DsBarChart, DatePicker, type BarChartDatum, type DatePickerRange } from '@sentropic/design-system-svelte';
  import { useDashboard } from '../adapter.js';

  const DATE_LABEL = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  function defaultFormatLabel(bin: DateHistogramBin): string {
    return DATE_LABEL.format(new Date(bin.start));
  }

  function emptyModel(dateId: string): DateHistogramModel {
    return { dateId, domain: [Number.NaN, Number.NaN], bins: [] };
  }

  function filterFor(bin: DateHistogramBin) {
    const max = bin.end > bin.start ? bin.end - 1 : bin.end;
    return { min: bin.start, max };
  }

  function selectionKeyFor(bin: DateHistogramBin): string {
    const range = filterFor(bin);
    return rangeSelectionKey(range.min, range.max);
  }

  let {
    store,
    viewId,
    date,
    interval,
    bins,
    domain,
    label,
    tone,
    selectable = true,
    width,
    height,
    hoverKey,
    onHoverKeyChange,
    onSelectKey,
    formatLabel = defaultFormatLabel,
    enableBrush = false,
    brushRange,
    onTimeRangeChange,
    class: className,
  }: DateHistogramChartProps = $props();

  const dash = $derived(useDashboard(store));
  const model = $derived.by(() => {
    void $dash;
    try {
      return buildDateHistogramModel(store.model, store.applyCrossfilter(viewId), { date, interval, bins, domain });
    } catch {
      return emptyModel(date);
    }
  });
  const labels = $derived.by(() => model.bins.map((bin) => formatLabel(bin, model)));
  const data = $derived.by(
    (): BarChartDatum[] =>
      model.bins.map((bin, index) => {
        const datum = { label: labels[index] ?? String(index + 1), value: bin.count };
        return tone ? { ...datum, tone } : datum;
      }),
  );
  const selectedKeys = $derived.by((): string[] => {
    const activeKeys = viewId ? ($dash.selections[viewId] ?? []) : [];
    return model.bins.flatMap((bin, index) =>
      activeKeys.includes(selectionKeyFor(bin)) ? [labels[index] ?? String(index + 1)] : [],
    );
  });
  const classes = $derived(['st-dateHistogramChart', className].filter(Boolean).join(' '));
  let localPickerValue = $state<DatePickerRange | null>(null);

  $effect(() => {
    localPickerValue = brushRange
      ? { start: new Date(brushRange.from), end: new Date(brushRange.to) }
      : null;
  });

  $effect(() => {
    const p = localPickerValue;
    if (!p?.start || !p.end) return;
    const br = untrack(() => brushRange);
    const pFrom = p.start.toISOString();
    const pTo = p.end.toISOString();
    if (br?.from === pFrom && br?.to === pTo) return;
    handlePickerChange(p);
  });

  function onSelect(key: string) {
    if (!viewId) return;
    const index = labels.indexOf(key);
    const bin = model.bins[index];
    if (!bin) return;
    store.toggleSelection(viewId, selectionKeyFor(bin));
  }

  function handlePickerChange(value: unknown) {
    if (!value || typeof value !== 'object' || !('start' in value)) {
      onTimeRangeChange?.(null);
      if (!onTimeRangeChange) store.clearFilter(date);
      return;
    }
    const r = value as { start: Date | null; end: Date | null };
    if (r.start && r.end) {
      const range: TimeRange = { from: r.start.toISOString(), to: r.end.toISOString() };
      onTimeRangeChange?.(range);
      if (!onTimeRangeChange) {
        store.setFilter(date, { kind: 'range', min: r.start.getTime(), max: r.end.getTime() });
      }
    }
  }
</script>

{#if enableBrush}
  <div class="st-dateHistogramChart__wrapper">
    <DsBarChart
      {data}
      {label}
      {width}
      {height}
      selectedKeys={selectable && viewId ? selectedKeys : []}
      onSelect={selectable && viewId ? onSelect : undefined}
      {hoverKey}
      {onHoverKeyChange}
      {onSelectKey}
      class={classes}
    />
    <DatePicker
      mode="range"
      label="{label} — plage de dates"
      bind:value={localPickerValue}
    />
  </div>
{:else}
  <DsBarChart
    {data}
    {label}
    {width}
    {height}
    selectedKeys={selectable && viewId ? selectedKeys : []}
    onSelect={selectable && viewId ? onSelect : undefined}
    {hoverKey}
    {onHoverKeyChange}
    {onSelectKey}
    class={classes}
  />
{/if}
