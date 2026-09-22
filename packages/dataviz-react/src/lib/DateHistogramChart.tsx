import { BarChart, DatePicker, type BarChartDatum, type BarChartTone, type DatePickerRange } from '@sentropic/design-system-react';
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
  /** When true, shows a date-range picker below the histogram for semantic time brushing. */
  enableBrush?: boolean;
  /** Controlled brush range (ISO strings). */
  brushRange?: TimeRange | null;
  /** Emitted when the brush range changes (or is cleared). */
  onTimeRangeChange?: (range: TimeRange | null) => void;
  className?: string;
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

function brushRangeToPickerValue(range: TimeRange | null | undefined): DatePickerRange | null {
  if (!range) return null;
  return { start: new Date(range.from), end: new Date(range.to) };
}

export function DateHistogramChart({
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
  className,
}: DateHistogramChartProps) {
  const state = useDashboard(store);
  const model = (() => {
    try {
      return buildDateHistogramModel(store.model, store.applyCrossfilter(viewId), { date, interval, bins, domain });
    } catch {
      return emptyModel(date);
    }
  })();
  const labels = model.bins.map((bin) => formatLabel(bin, model));
  const data: BarChartDatum[] = model.bins.map((bin, index) => {
    const datum = { label: labels[index] ?? String(index + 1), value: bin.count };
    return tone ? { ...datum, tone } : datum;
  });

  const activeKeys = viewId ? (state.selections[viewId] ?? []) : [];
  const selectedKeys = model.bins.flatMap((bin, index) =>
    activeKeys.includes(selectionKeyFor(bin)) ? [labels[index] ?? String(index + 1)] : [],
  );

  const handleSelect = selectable && viewId
    ? (key: string) => {
        const index = labels.indexOf(key);
        const bin = model.bins[index];
        if (!bin) return;
        store.toggleSelection(viewId, selectionKeyFor(bin));
      }
    : undefined;

  function handleRangeChange(value: DatePickerRange | Date | null) {
    if (!value || !('start' in value)) {
      onTimeRangeChange?.(null);
      if (!onTimeRangeChange) store.clearFilter(date);
      return;
    }
    const { start, end } = value as DatePickerRange;
    if (start && end) {
      const range: TimeRange = { from: start.toISOString(), to: end.toISOString() };
      onTimeRangeChange?.(range);
      if (!onTimeRangeChange) {
        store.setFilter(date, { kind: 'range', min: start.getTime(), max: end.getTime() });
      }
    }
  }

  const chart = (
    <BarChart
      data={data}
      label={label}
      width={width}
      height={height}
      selectedKeys={selectable && viewId ? selectedKeys : []}
      onSelect={handleSelect}
      hoverKey={hoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      className={['st-dateHistogramChart', className].filter(Boolean).join(' ') || undefined}
    />
  );

  if (!enableBrush) return chart;

  return (
    <div className="st-dateHistogramChart__wrapper">
      {chart}
      <DatePicker
        mode="range"
        label={`${label} — plage de dates`}
        value={brushRangeToPickerValue(brushRange)}
        onChange={(value) => handleRangeChange(value as DatePickerRange | Date | null)}
      />
    </div>
  );
}
