import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { KpiCardGroup } from './KpiCardGroup.js';

const model: DataModel = {
  dimensions: [{ id: 'month', label: 'Mois', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { month: 'Jan', sales: 10 },
  { month: 'Feb', sales: 20 },
];

describe('KpiCardGroup (vue)', () => {
  it('renders DS KPI cards from core KPI configs', () => {
    const store = createDashboardStore({ model, data });
    const w = mount(KpiCardGroup, {
      props: { store, configs: [{ id: 'sales', measure: 'sales', sparklineDimension: 'month' }] },
    });
    expect(w.text()).toContain('Ventes');
    expect(w.text()).toContain('30');
  });

  it('updates when the shared filter state changes', async () => {
    const store = createDashboardStore({ model, data });
    const w = mount(KpiCardGroup, { props: { store, configs: [{ id: 'sales', measure: 'sales' }] } });
    expect(w.text()).toContain('30');
    store.setFilter('month', { kind: 'include', values: ['Jan'] });
    await nextTick();
    expect(w.text()).toContain('10');
  });
});
