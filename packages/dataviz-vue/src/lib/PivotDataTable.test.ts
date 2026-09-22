import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { PivotDataTable } from './PivotDataTable.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { country: 'FR', sales: 10 },
  { country: 'FR', sales: 5 },
  { country: 'US', sales: 20 },
];

const newStore = () => createDashboardStore({ model, data });

describe('PivotDataTable (vue)', () => {
  it('renders a DS DataTable from the core pivot model', () => {
    const w = mount(PivotDataTable, {
      props: { store: newStore(), rows: ['country'], measures: ['sales'], caption: 'Pivot' },
    });
    expect(w.text()).toContain('Pivot');
    expect(w.text()).toContain('Pays');
    expect(w.text()).toContain('Ventes');
    expect(w.text()).toContain('FR');
    expect(w.text()).toContain('15');
  });

  it('updates when the shared filter state changes', async () => {
    const store = newStore();
    const w = mount(PivotDataTable, { props: { store, rows: ['country'], measures: ['sales'] } });
    expect(w.text()).toContain('US');
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await nextTick();
    expect(w.text()).not.toContain('US');
  });
});
