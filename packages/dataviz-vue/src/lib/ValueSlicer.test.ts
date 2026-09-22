import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ValueSlicer } from './ValueSlicer.js';

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
const cb = (w: ReturnType<typeof mount>, val: string) =>
  w.find(`input[type="checkbox"][value="${val}"]`);

describe('ValueSlicer (vue)', () => {
  it('renders a checkbox per distinct value', () => {
    const w = mount(ValueSlicer, { props: { store: newStore(), dimension: 'country' } });
    expect(cb(w, 'FR').exists()).toBe(true);
    expect(cb(w, 'US').exists()).toBe(true);
    expect(cb(w, 'DE').exists()).toBe(true);
  });

  it('sets an include filter when a value is checked', async () => {
    const store = newStore();
    const w = mount(ValueSlicer, { props: { store, dimension: 'country' } });
    await cb(w, 'FR').setValue(true);
    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['FR'] });
  });

  it('reflects an existing include filter as checked', () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['DE'] });
    const w = mount(ValueSlicer, { props: { store, dimension: 'country' } });
    expect((cb(w, 'DE').element as HTMLInputElement).checked).toBe(true);
    expect((cb(w, 'FR').element as HTMLInputElement).checked).toBe(false);
  });

  it('clears the filter when the last value is unchecked', async () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    const w = mount(ValueSlicer, { props: { store, dimension: 'country' } });
    await cb(w, 'FR').setValue(false);
    expect(store.getState().filters.country).toBeUndefined();
  });
});
