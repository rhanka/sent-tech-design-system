<script setup lang="ts">
import { computed } from 'vue';
import { BarChart, DatePicker, type BarChartDatum, type BarChartTone } from '@sentropic/design-system-vue';
import {
  buildDateHistogramModel,
  rangeSelectionKey,
  type DashboardStore,
  type DateHistogramBin,
  type DateHistogramConfig,
  type DateHistogramModel,
  type TimeRange,
} from '@sentropic/dataviz-core';
import { useDashboard } from '../adapter.js';

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

defineOptions({ name: 'DateHistogramChart' });
const props = withDefaults(defineProps<DateHistogramChartProps>(), {
  viewId: undefined, interval: undefined, bins: undefined, domain: undefined, tone: undefined,
  selectable: true, width: undefined, height: undefined, hoverKey: undefined,
  onHoverKeyChange: undefined, onSelectKey: undefined,
  formatLabel: (bin: DateHistogramBin) => new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(bin.start)),
  enableBrush: false, brushRange: undefined, onTimeRangeChange: undefined, class: undefined,
});
const state = useDashboard(props.store);

const model = computed((): DateHistogramModel => {
  void state.value;
  try {
    return buildDateHistogramModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
      date: props.date,
      interval: props.interval,
      bins: props.bins,
      domain: props.domain,
    });
  } catch {
    return emptyModel(props.date);
  }
});

const labels = computed(() => model.value.bins.map((bin) => props.formatLabel(bin, model.value)));

const data = computed<BarChartDatum[]>(() =>
  model.value.bins.map((bin, index) => {
    const datum = { label: labels.value[index] ?? String(index + 1), value: bin.count };
    return props.tone ? { ...datum, tone: props.tone } : datum;
  }),
);

const selectedKeys = computed<string[]>(() => {
  const viewId = props.viewId;
  const activeKeys = viewId ? (state.value.selections[viewId] ?? []) : [];
  return model.value.bins.flatMap((bin, index) =>
    activeKeys.includes(selectionKeyFor(bin)) ? [labels.value[index] ?? String(index + 1)] : [],
  );
});

function handleSelect(key: string) {
  const viewId = props.viewId;
  if (!viewId) return;
  const index = labels.value.indexOf(key);
  const bin = model.value.bins[index];
  if (!bin) return;
  props.store.toggleSelection(viewId, selectionKeyFor(bin));
}

const onSelect = computed(() => {
  const viewId = props.viewId;
  return props.selectable && viewId ? handleSelect : undefined;
});

function handlePickerChange(value: unknown) {
  if (!value || typeof value !== 'object' || !('start' in value)) {
    props.onTimeRangeChange?.(null);
    if (!props.onTimeRangeChange) props.store.clearFilter(props.date);
    return;
  }
  const r = value as { start: Date | null; end: Date | null };
  if (r.start && r.end) {
    const range: TimeRange = { from: r.start.toISOString(), to: r.end.toISOString() };
    props.onTimeRangeChange?.(range);
    if (!props.onTimeRangeChange) {
      props.store.setFilter(props.date, { kind: 'range', min: r.start.getTime(), max: r.end.getTime() });
    }
  }
}

const pickerValue = computed(() => props.brushRange
  ? { start: new Date(props.brushRange.from), end: new Date(props.brushRange.to) }
  : null);
</script>

<template>
  <div v-if="props.enableBrush" class="st-dateHistogramChart__wrapper">
    <BarChart :data="data" :label="props.label" :width="props.width" :height="props.height"
      :selected-keys="props.selectable && props.viewId ? selectedKeys : []" :on-select="onSelect"
      :hover-key="props.hoverKey" :on-hover-key-change="props.onHoverKeyChange" :on-select-key="props.onSelectKey"
      :class="['st-dateHistogramChart', props.class].filter(Boolean).join(' ')" />
    <DatePicker mode="range" :label="`${props.label} — plage de dates`" :value="pickerValue" @change="handlePickerChange" />
  </div>
  <BarChart v-else :data="data" :label="props.label" :width="props.width" :height="props.height"
    :selected-keys="props.selectable && props.viewId ? selectedKeys : []" :on-select="onSelect"
    :hover-key="props.hoverKey" :on-hover-key-change="props.onHoverKeyChange" :on-select-key="props.onSelectKey"
    :class="['st-dateHistogramChart', props.class].filter(Boolean).join(' ')" />
</template>
