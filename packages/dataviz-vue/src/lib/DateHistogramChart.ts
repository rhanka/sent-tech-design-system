import { defineComponent, h, type PropType, type Component } from 'vue';
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

export const DateHistogramChart = defineComponent({
  name: 'DateHistogramChart',
  props: {
    store: { type: Object as PropType<DashboardStore>, required: true },
    viewId: { type: String, default: undefined },
    date: { type: String, required: true },
    interval: { type: String as PropType<DateHistogramConfig['interval']>, default: undefined },
    bins: { type: Number, default: undefined },
    domain: { type: Array as unknown as PropType<DateHistogramConfig['domain']>, default: undefined },
    label: { type: String, required: true },
    tone: { type: String as PropType<DateHistogramChartTone>, default: undefined },
    selectable: { type: Boolean, default: true },
    width: { type: Number, default: undefined },
    height: { type: Number, default: undefined },
    hoverKey: { type: [String, null] as unknown as PropType<string | null>, default: undefined },
    onHoverKeyChange: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    onSelectKey: { type: Function as PropType<(key: string | null) => void>, default: undefined },
    formatLabel: { type: Function as PropType<DateHistogramLabelFormatter>, default: defaultFormatLabel },
    enableBrush: { type: Boolean, default: false },
    brushRange: { type: Object as PropType<TimeRange | null>, default: undefined },
    onTimeRangeChange: { type: Function as PropType<(range: TimeRange | null) => void>, default: undefined },
    class: { type: String, default: undefined },
  },
  setup(props) {
    const state = useDashboard(props.store);
    return () => {
      void state.value;
      let model: DateHistogramModel;
      try {
        model = buildDateHistogramModel(props.store.model, props.store.applyCrossfilter(props.viewId), {
          date: props.date,
          interval: props.interval,
          bins: props.bins,
          domain: props.domain,
        });
      } catch {
        model = emptyModel(props.date);
      }

      const labels = model.bins.map((bin) => props.formatLabel(bin, model));
      const data: BarChartDatum[] = model.bins.map((bin, index) => {
        const datum = { label: labels[index] ?? String(index + 1), value: bin.count };
        return props.tone ? { ...datum, tone: props.tone } : datum;
      });
      const viewId = props.viewId;
      const activeKeys = viewId ? (state.value.selections[viewId] ?? []) : [];
      const selectedKeys = model.bins.flatMap((bin, index) =>
        activeKeys.includes(selectionKeyFor(bin)) ? [labels[index] ?? String(index + 1)] : [],
      );
      const onSelect = props.selectable && viewId
        ? (key: string) => {
            const index = labels.indexOf(key);
            const bin = model.bins[index];
            if (!bin) return;
            props.store.toggleSelection(viewId, selectionKeyFor(bin));
          }
        : undefined;

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

      const pickerValue = props.brushRange
        ? { start: new Date(props.brushRange.from), end: new Date(props.brushRange.to) }
        : null;

      const barChart = h(BarChart, {
        data,
        label: props.label,
        width: props.width,
        height: props.height,
        selectedKeys: props.selectable && viewId ? selectedKeys : [],
        onSelect,
        hoverKey: props.hoverKey,
        onHoverKeyChange: props.onHoverKeyChange,
        onSelectKey: props.onSelectKey,
        class: ['st-dateHistogramChart', props.class].filter(Boolean).join(' '),
      });

      if (!props.enableBrush) return barChart;

      return h('div', { class: 'st-dateHistogramChart__wrapper' }, [
        barChart,
        h(DatePicker as Component, {
          mode: 'range',
          label: `${props.label} — plage de dates`,
          value: pickerValue,
          onChange: handlePickerChange,
        }),
      ]);
    };
  },
});
