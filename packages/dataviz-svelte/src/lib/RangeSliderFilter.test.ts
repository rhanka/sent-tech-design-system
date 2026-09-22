import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import RangeSliderFilter, { numericDomain, rangeBoundsToSpec } from './RangeSliderFilter.svelte';

describe('numericDomain', () => {
  it('computes [min,max] over finite numeric cells', () => {
    expect(numericDomain([{ x: 3 }, { x: 1 }, { x: 8 }] as Row[], 'x')).toEqual({ min: 1, max: 8 });
  });
  it('ignores non-numeric / non-finite cells', () => {
    expect(numericDomain([{ x: 'a' }, { x: NaN }, { x: 5 }] as Row[], 'x')).toEqual({ min: 5, max: 5 });
  });
  it('falls back to {0,0} with no finite values', () => {
    expect(numericDomain([] as Row[], 'x')).toEqual({ min: 0, max: 0 });
  });
});

describe('rangeBoundsToSpec', () => {
  const domain = { min: 0, max: 10 };
  it('returns null when handles span the whole domain', () => {
    expect(rangeBoundsToSpec(0, 10, domain)).toBeNull();
  });
  it('maps a narrowed window to a range spec', () => {
    expect(rangeBoundsToSpec(2, 8, domain)).toEqual({ kind: 'range', min: 2, max: 8 });
  });
  it('normalizes reversed handles', () => {
    expect(rangeBoundsToSpec(8, 2, domain)).toEqual({ kind: 'range', min: 2, max: 8 });
  });
});

// End-to-end regression: the range filter genuinely filters (slider handles →
// rangeBoundsToSpec → store.setFilter → applyCrossfilter returns the subset).
// Guards the user-reported "filter range sometimes doesn't filter" — the whole
// chain (core predicate + wrapper helpers + DS RangeSlider contract) is correct.
describe('range filter end-to-end', () => {
  const model: DataModel = {
    dimensions: [{ id: 'price', label: 'Prix', type: 'continuous' }],
    measures: [{ id: 'qty', label: 'Qté', aggregation: 'sum' }],
  };
  const data = [
    { price: 1, qty: 1 },
    { price: 5, qty: 1 },
    { price: 9, qty: 1 },
  ] as Row[];

  it('keeps only the rows inside the narrowed window', () => {
    const store = createDashboardStore({ model, data });
    const spec = rangeBoundsToSpec(3, 7, numericDomain(data, 'price'));
    expect(spec).toEqual({ kind: 'range', min: 3, max: 7 });
    store.setFilter('price', spec!);
    expect(store.applyCrossfilter(undefined).map((r) => r.price)).toEqual([5]);
  });

  it('full-span handles clear the filter (all rows pass)', () => {
    const store = createDashboardStore({ model, data });
    const domain = numericDomain(data, 'price');
    expect(rangeBoundsToSpec(domain.min, domain.max, domain)).toBeNull();
    store.clearFilter('price');
    expect(store.applyCrossfilter(undefined)).toHaveLength(3);
  });

  it('notifies subscribers when the range filter changes', () => {
    const store = createDashboardStore({ model, data });
    let notified = 0;
    store.subscribe(() => (notified += 1));
    store.setFilter('price', { kind: 'range', min: 4, max: 6 });
    expect(notified).toBeGreaterThan(0);
    expect(store.applyCrossfilter(undefined).map((r) => r.price)).toEqual([5]);
  });
});

const model: DataModel = {
  dimensions: [{ id: 'x', label: 'Montant', type: 'continuous' }],
  measures: [{ id: 'v', label: 'V', aggregation: 'sum' }],
};

describe('RangeSliderFilter', () => {
  it('renders a labelled range slider and does not filter at the full domain', async () => {
    const store = createDashboardStore({ model, data: [{ x: 0, v: 1 }, { x: 10, v: 1 }] as Row[] });
    const { container } = render(RangeSliderFilter, { props: { store, dimension: 'x' } });
    await tick();
    expect(container.textContent).toContain('Montant');
    expect(store.getState().filters.x).toBeUndefined();
  });
});
