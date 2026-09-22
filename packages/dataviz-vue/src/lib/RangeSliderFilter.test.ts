import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { RangeSliderFilter, numericDomain, rangeBoundsToSpec } from './RangeSliderFilter.js';

describe('numericDomain (vue)', () => {
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

describe('rangeBoundsToSpec (vue)', () => {
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

const model: DataModel = {
  dimensions: [{ id: 'x', label: 'Montant', type: 'continuous' }],
  measures: [{ id: 'v', label: 'V', aggregation: 'sum' }],
};

describe('RangeSliderFilter (vue)', () => {
  it('renders a labelled range slider and does not filter at the full domain', () => {
    const store = createDashboardStore({ model, data: [{ x: 0, v: 1 }, { x: 10, v: 1 }] as Row[] });
    const w = mount(RangeSliderFilter, { props: { store, dimension: 'x' } });
    expect(w.text()).toContain('Montant');
    expect(store.getState().filters.x).toBeUndefined();
  });
});
