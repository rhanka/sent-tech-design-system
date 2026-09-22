import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import KpiCardGroup from './KpiCardGroup.svelte';

const model: DataModel = {
  dimensions: [{ id: 'month', label: 'Mois', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const data: Row[] = [
  { month: 'Jan', sales: 10 },
  { month: 'Feb', sales: 20 },
];

describe('KpiCardGroup (svelte)', () => {
  it('renders DS KPI cards from core KPI configs', () => {
    const store = createDashboardStore({ model, data });
    const { getByText } = render(KpiCardGroup, {
      props: { store, configs: [{ id: 'sales', measure: 'sales', sparklineDimension: 'month' }] },
    });
    expect(getByText('Ventes')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
  });

  it('updates when the shared filter state changes', async () => {
    const store = createDashboardStore({ model, data });
    const { getByText } = render(KpiCardGroup, {
      props: { store, configs: [{ id: 'sales', measure: 'sales' }] },
    });
    expect(getByText('30')).toBeTruthy();
    store.setFilter('month', { kind: 'include', values: ['Jan'] });
    await tick();
    expect(getByText('10')).toBeTruthy();
  });
});
