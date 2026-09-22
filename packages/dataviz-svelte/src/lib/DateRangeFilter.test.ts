import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import DateRangeFilter, { dateRangeToSpec } from './DateRangeFilter.svelte';

const D1 = new Date('2020-01-01T00:00:00Z');
const D2 = new Date('2020-12-31T00:00:00Z');

describe('dateRangeToSpec', () => {
  it('maps a full range to epoch-ms bounds', () => {
    expect(dateRangeToSpec({ start: D1, end: D2 })).toEqual({
      kind: 'range',
      min: D1.getTime(),
      max: D2.getTime(),
    });
  });
  it('maps an open-ended (start only) range', () => {
    expect(dateRangeToSpec({ start: D1, end: null })).toEqual({ kind: 'range', min: D1.getTime(), max: undefined });
  });
  it('returns null for an empty range', () => {
    expect(dateRangeToSpec({ start: null, end: null })).toBeNull();
  });
});

const model: DataModel = {
  dimensions: [{ id: 'date', label: 'Date', type: 'continuous' }],
  measures: [{ id: 'v', label: 'V', aggregation: 'sum' }],
};

describe('DateRangeFilter', () => {
  it('renders a labelled range date picker without filtering initially', async () => {
    const store = createDashboardStore({ model, data: [] as Row[] });
    render(DateRangeFilter, { props: { store, dimension: 'date', label: 'Période' } });
    await tick();
    expect(screen.getByText('Période')).toBeTruthy();
    expect(store.getState().filters.date).toBeUndefined();
  });
});
