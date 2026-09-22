import { useEffect, useState } from 'react';
import { DatePicker, type DatePickerRange, type DatePickerValue } from '@sentropic/design-system-react';
import { type DashboardStore, type FilterSpec } from '@sentropic/dataviz-core';

export type DateRangeFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Date dimension to filter (its cells must be epoch-millisecond numbers). */
  dimension: string;
  label?: string;
  className?: string;
};

/**
 * Pure: a DatePicker `{ start, end }` range → a core `range` FilterSpec in epoch
 * milliseconds (bounds optional), or `null` when the range is empty.
 */
export function dateRangeToSpec(range: { start: Date | null; end: Date | null }): FilterSpec | null {
  const min = range.start ? range.start.getTime() : undefined;
  const max = range.end ? range.end.getTime() : undefined;
  if (min === undefined && max === undefined) return null;
  return { kind: 'range', min, max };
}

const asRange = (value: DatePickerValue): DatePickerRange =>
  value && typeof value === 'object' && 'start' in value ? value : { start: null, end: null };

/**
 * A date-range filter: a design-system DatePicker (range mode) bound to a core
 * `range` filter on a date dimension (epoch-millisecond cells).
 */
export function DateRangeFilter({ store, dimension, label = 'Période', className }: DateRangeFilterProps) {
  const [range, setRange] = useState<DatePickerRange>({ start: null, end: null });
  useEffect(() => {
    const spec = dateRangeToSpec(range);
    if (spec) store.setFilter(dimension, spec);
    else store.clearFilter(dimension);
  }, [store, dimension, range]);
  return (
    <DatePicker
      mode="range"
      label={label}
      value={range}
      onChange={(v) => setRange(asRange(v))}
      className={className}
    />
  );
}
