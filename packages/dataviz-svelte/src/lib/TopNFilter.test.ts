import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type FilterSpec, type Row } from '@sentropic/dataviz-core';
import TopNFilter from './TopNFilter.svelte';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', sales: 30 },
  { country: 'US', sales: 50 },
  { country: 'DE', sales: 10 },
];

const newStore = () => createDashboardStore({ model, data });
const values = (spec: FilterSpec | undefined) =>
  spec && spec.kind === 'include' ? new Set(spec.values) : new Set<string>();

describe('TopNFilter', () => {
  it('applies an include filter of the top-N values by measure on mount', async () => {
    const store = newStore();
    render(TopNFilter, { props: { store, dimension: 'country', measure: 'sales', defaultN: 2 } });
    await tick();
    const f = store.getState().filters.country;
    expect(f?.kind).toBe('include');
    // top-2 by sales: US (50), FR (30); DE (10) excluded.
    expect(values(f)).toEqual(new Set(['US', 'FR']));
  });

  it('honours a different N', async () => {
    const store = newStore();
    render(TopNFilter, { props: { store, dimension: 'country', measure: 'sales', defaultN: 1 } });
    await tick();
    expect(values(store.getState().filters.country)).toEqual(new Set(['US']));
  });

  it('renders a labelled number input', () => {
    const store = newStore();
    render(TopNFilter, { props: { store, dimension: 'country', measure: 'sales', label: 'Top N pays' } });
    expect(screen.getByLabelText('Top N pays')).toBeTruthy();
  });
});
