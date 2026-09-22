import { render, screen, act } from '@testing-library/react';
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

describe('PivotDataTable (react)', () => {
  it('renders a DS DataTable from the core pivot model', () => {
    render(<PivotDataTable store={newStore()} rows={['country']} measures={['sales']} caption="Pivot" />);
    expect(screen.getByText('Pivot')).toBeTruthy();
    expect(screen.getByText('Pays')).toBeTruthy();
    expect(screen.getByText('Ventes')).toBeTruthy();
    expect(screen.getByText('FR')).toBeTruthy();
    expect(screen.getByText('15')).toBeTruthy();
  });

  it('updates when the shared filter state changes', () => {
    const store = newStore();
    render(<PivotDataTable store={store} rows={['country']} measures={['sales']} />);
    expect(screen.getByText('US')).toBeTruthy();
    act(() => {
      store.setFilter('country', { kind: 'include', values: ['FR'] });
    });
    expect(screen.queryByText('US')).toBeNull();
  });
});
