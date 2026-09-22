import { useEffect, useRef, useState } from 'react';
import { Select } from '@sentropic/design-system-react';
import { type DashboardStore, type FilterSpec } from '@sentropic/dataviz-core';

/**
 * A relative-date preset: a labelled choice resolving to a trailing window of
 * `days` ending "now", or `null` days for "all" (no filter).
 */
export type RelativeDatePreset = {
  value: string;
  label: string;
  /** Trailing window length in days, or `null` for "all" (clears the filter). */
  days: number | null;
};

export type RelativeDateFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Date dimension to filter (its cells must be epoch-millisecond numbers). */
  dimension: string;
  label?: string;
  /** Selectable presets; defaults to {@link DEFAULT_RELATIVE_PRESETS}. */
  presets?: RelativeDatePreset[];
  /** Reference "now" for the trailing windows; defaults to the current time. */
  now?: Date;
  className?: string;
};

/** Default relative-date presets: all / 7 / 30 / 90 days / 12 months. */
export const DEFAULT_RELATIVE_PRESETS: RelativeDatePreset[] = [
  { value: 'all', label: 'Tout', days: null },
  { value: '7d', label: '7 derniers jours', days: 7 },
  { value: '30d', label: '30 derniers jours', days: 30 },
  { value: '90d', label: '90 derniers jours', days: 90 },
  { value: '365d', label: '12 derniers mois', days: 365 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Pure: a trailing window of `days` ending at `now` → a core `range` FilterSpec
 * in epoch milliseconds, or `null` when `days` is `null` ("all", no filter).
 */
export function relativeRangeToSpec(days: number | null, now: Date): FilterSpec | null {
  if (days == null) return null;
  const max = now.getTime();
  return { kind: 'range', min: max - days * DAY_MS, max };
}

/**
 * A relative-date filter: a design-system Select of trailing-window presets
 * bound to a core `range` filter on a date dimension (epoch-millisecond cells).
 */
export function RelativeDateFilter({
  store,
  dimension,
  label = 'Période',
  presets = DEFAULT_RELATIVE_PRESETS,
  now,
  className,
}: RelativeDateFilterProps) {
  const nowRef = useRef<Date>(now ?? new Date());
  const [selected, setSelected] = useState(presets[0]?.value ?? 'all');
  useEffect(() => {
    const preset = presets.find((p) => p.value === selected);
    const spec = preset ? relativeRangeToSpec(preset.days, nowRef.current) : null;
    if (spec) store.setFilter(dimension, spec);
    else store.clearFilter(dimension);
  }, [store, dimension, selected, presets]);
  return (
    <Select
      label={label}
      value={selected}
      onChange={(e) => setSelected(e.target.value)}
      options={presets.map((p) => ({ value: p.value, label: p.label }))}
      className={className}
    />
  );
}
