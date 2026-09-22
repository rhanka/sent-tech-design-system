import { useEffect, useState } from 'react';
import { RangeSlider } from '@sentropic/design-system-react';
import { findDimension, type DashboardStore, type FilterSpec, type Row } from '@sentropic/dataviz-core';

export type NumericDomain = { min: number; max: number };

export type RangeSliderFilterProps = {
  /** The dashboard store to bind to. */
  store: DashboardStore;
  /** Continuous numeric dimension to filter. */
  dimension: string;
  label?: string;
  /** Lower bound of the track; defaults to the data minimum. */
  min?: number;
  /** Upper bound of the track; defaults to the data maximum. */
  max?: number;
  step?: number;
  className?: string;
};

/**
 * Pure: the numeric `[min, max]` domain of a dimension across rows (finite
 * values only). Returns `{ min: 0, max: 0 }` when no finite value is present.
 */
export function numericDomain(data: readonly Row[], dimension: string): NumericDomain {
  let min = Infinity;
  let max = -Infinity;
  for (const row of data) {
    const v = row[dimension];
    if (typeof v === 'number' && Number.isFinite(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return min === Infinity ? { min: 0, max: 0 } : { min, max };
}

/**
 * Pure: the two range-slider handles → a core `range` FilterSpec (bounds
 * normalized so `lo <= hi`), or `null` when they span the whole domain.
 */
export function rangeBoundsToSpec(lower: number, upper: number, domain: NumericDomain): FilterSpec | null {
  const lo = Math.min(lower, upper);
  const hi = Math.max(lower, upper);
  if (lo <= domain.min && hi >= domain.max) return null;
  return { kind: 'range', min: lo, max: hi };
}

/**
 * A two-handle numeric range filter built on the design-system RangeSlider,
 * bound to a core `range` filter on a continuous dimension.
 */
export function RangeSliderFilter({ store, dimension, label, min, max, step = 1, className }: RangeSliderFilterProps) {
  const [domain] = useState<NumericDomain>(() => {
    const d = numericDomain(store.data, dimension);
    return { min: min ?? d.min, max: max ?? d.max };
  });
  const resolvedLabel = label ?? findDimension(store.model, dimension)?.label ?? dimension;
  const [value, setValue] = useState<[number, number]>([domain.min, domain.max]);

  useEffect(() => {
    const spec = rangeBoundsToSpec(value[0], value[1], domain);
    if (spec) store.setFilter(dimension, spec);
    else store.clearFilter(dimension);
  }, [store, dimension, value, domain]);

  return (
    <RangeSlider
      label={resolvedLabel}
      value={value}
      min={domain.min}
      max={domain.max}
      step={step}
      showValue
      className={className}
      onChange={setValue}
    />
  );
}
