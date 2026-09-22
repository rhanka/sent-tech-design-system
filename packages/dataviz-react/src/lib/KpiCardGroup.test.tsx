import { render, screen, act } from '@testing-library/react';
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

describe('KpiCardGroup (react)', () => {
  it('renders DS KPI cards from core KPI configs', () => {
    const store = createDashboardStore({ model, data });
    render(<KpiCardGroup store={store} configs={[{ id: 'sales', measure: 'sales', sparklineDimension: 'month' }]} />);
    expect(screen.getByText('Ventes')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
  });

  it('updates when the shared filter state changes', () => {
    const store = createDashboardStore({ model, data });
    render(<KpiCardGroup store={store} configs={[{ id: 'sales', measure: 'sales' }]} />);
    expect(screen.getByText('30')).toBeTruthy();
    act(() => {
      store.setFilter('month', { kind: 'include', values: ['Jan'] });
    });
    expect(screen.getByText('10')).toBeTruthy();
  });
});
