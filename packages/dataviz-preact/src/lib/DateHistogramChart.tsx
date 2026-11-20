import { BarChart, DatePicker, type BarChartDatum, type BarChartTone, type DatePickerRange } from '@sentropic/design-system-preact';
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
import { classNames } from '../classNames.js';
// Side-effect: keeps the options.vnode SVG presentation-attribute and tabIndex
// normaliser installed on Preact core even on direct deep imports.
import '../runtime.js';
import { useValue, type MaybeSignal } from '../signals.js';

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
  selectable?: MaybeSignal<boolean>;
  width?: number;
  height?: number;
  hoverKey?: MaybeSignal<string | null>;
  onHoverKeyChange?: (key: string | null) => void;
  onSelectKey?: (key: string | null) => void;
  formatLabel?: DateHistogramLabelFormatter;
  /** When true, shows a date-range picker below the histogram for semantic time brushing. */
  enableBrush?: MaybeSignal<boolean>;
  /** Controlled brush range (ISO strings). */
  brushRange?: MaybeSignal<TimeRange | null>;
  /** Emitted when the brush range changes (or is cleared). */
  onTimeRangeChange?: (range: TimeRange | null) => void;
  className?: MaybeSignal<string>;
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
  const resolvedSelectable = useValue(selectable);
  const resolvedHoverKey = useValue(hoverKey);
  const resolvedEnableBrush = useValue(enableBrush);
  const resolvedBrushRange = useValue(brushRange);
  const resolvedClassName = useValue(className);

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

  const handleSelect = resolvedSelectable && viewId
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
      selectedKeys={resolvedSelectable && viewId ? selectedKeys : []}
      onSelect={handleSelect}
      hoverKey={resolvedHoverKey}
      onHoverKeyChange={onHoverKeyChange}
      onSelectKey={onSelectKey}
      className={classNames('st-dateHistogramChart', resolvedClassName)}
    />
  );

  if (!resolvedEnableBrush) return chart;

  return (
    <div className="st-dateHistogramChart__wrapper">
      {chart}
      <DatePicker
        mode="range"
        label={`${label} — plage de dates`}
        value={brushRangeToPickerValue(resolvedBrushRange)}
        onChange={(value) => handleRangeChange(value as DatePickerRange | Date | null)}
      />
    </div>
  );
}
