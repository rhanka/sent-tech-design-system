import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import ValueSlicer from './ValueSlicer.svelte';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', sales: 10 },
  { country: 'US', sales: 20 },
  { country: 'DE', sales: 5 },
];

const newStore = () => createDashboardStore({ model, data });

describe('ValueSlicer', () => {
  it('renders a checkbox per distinct value with the dimension legend', () => {
    render(ValueSlicer, { props: { store: newStore(), dimension: 'country' } });
    expect(screen.getByRole('checkbox', { name: 'FR' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'US' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'DE' })).toBeTruthy();
  });

  it('sets an include filter when a value is checked', async () => {
    const store = newStore();
    render(ValueSlicer, { props: { store, dimension: 'country' } });
    (screen.getByRole('checkbox', { name: 'FR' }) as HTMLInputElement).click();
    await tick();
    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['FR'] });
  });

  it('accumulates checked values (OR within the dimension)', async () => {
    const store = newStore();
    render(ValueSlicer, { props: { store, dimension: 'country' } });
    (screen.getByRole('checkbox', { name: 'FR' }) as HTMLInputElement).click();
    await tick();
    (screen.getByRole('checkbox', { name: 'US' }) as HTMLInputElement).click();
    await tick();
    const f = store.getState().filters.country;
    expect(f?.kind).toBe('include');
    expect(new Set(f && f.kind === 'include' ? f.values : [])).toEqual(new Set(['FR', 'US']));
  });

  it('reflects an existing include filter as checked', () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['DE'] });
    render(ValueSlicer, { props: { store, dimension: 'country' } });
    expect((screen.getByRole('checkbox', { name: 'DE' }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('checkbox', { name: 'FR' }) as HTMLInputElement).checked).toBe(false);
  });

  it('clears the filter when the last value is unchecked', async () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    render(ValueSlicer, { props: { store, dimension: 'country' } });
    (screen.getByRole('checkbox', { name: 'FR' }) as HTMLInputElement).click();
    await tick();
    expect(store.getState().filters.country).toBeUndefined();
  });
});
