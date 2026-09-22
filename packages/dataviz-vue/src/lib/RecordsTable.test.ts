import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { RecordsTable } from './RecordsTable.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', sales: 10 },
  { country: 'US', sales: 20 },
];

const newStore = () => createDashboardStore({ model, data });

describe('RecordsTable (vue)', () => {
  it('renders a table with a column per model field', () => {
    const w = mount(RecordsTable, { props: { store: newStore() } });
    expect(w.find('table').exists()).toBe(true);
    expect(w.text()).toContain('Pays');
    expect(w.text()).toContain('Ventes');
  });

  it('renders one row per visible record', () => {
    const w = mount(RecordsTable, { props: { store: newStore() } });
    expect(w.findAll('tbody tr')).toHaveLength(2);
    expect(w.text()).toContain('FR');
    expect(w.text()).toContain('US');
  });

  it('reflects the cross-filtered rows', async () => {
    const store = newStore();
    const w = mount(RecordsTable, { props: { store } });
    expect(w.findAll('tbody tr')).toHaveLength(2);
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await nextTick();
    expect(w.findAll('tbody tr')).toHaveLength(1);
    expect(w.text()).not.toContain('US');
  });

  it('respects a fields subset/order', () => {
    const w = mount(RecordsTable, { props: { store: newStore(), fields: ['sales'] } });
    expect(w.text()).toContain('Ventes');
    expect(w.text()).not.toContain('Pays');
  });
});
