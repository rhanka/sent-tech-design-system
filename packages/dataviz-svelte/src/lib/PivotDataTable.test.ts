import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import PivotDataTable from './PivotDataTable.svelte';

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

describe('PivotDataTable (svelte)', () => {
  it('renders a DS DataTable from the core pivot model', () => {
    const { getByText } = render(PivotDataTable, {
      props: { store: newStore(), rows: ['country'], measures: ['sales'], caption: 'Pivot' },
    });
    expect(getByText('Pivot')).toBeTruthy();
    expect(getByText('Pays')).toBeTruthy();
    expect(getByText('Ventes')).toBeTruthy();
    expect(getByText('FR')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
  });

  it('updates when the shared filter state changes', async () => {
    const store = newStore();
    const { getByText, queryByText } = render(PivotDataTable, {
      props: { store, rows: ['country'], measures: ['sales'] },
    });
    expect(getByText('US')).toBeTruthy();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    await tick();
    expect(queryByText('US')).toBeNull();
  });
});
