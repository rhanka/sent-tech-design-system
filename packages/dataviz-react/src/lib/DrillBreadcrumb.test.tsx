import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel } from '@sentropic/dataviz-core';
import { DrillBreadcrumb } from './DrillBreadcrumb.js';

const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'city', label: 'Ville', type: 'discrete' },
  ],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

const newStore = () => createDashboardStore({ model, data: [] });
const base = { viewId: 'd', hierarchy: ['region', 'city'] };

describe('DrillBreadcrumb (react)', () => {
  it('shows only the root level and no back button initially', () => {
    render(<DrillBreadcrumb store={newStore()} {...base} />);
    expect(screen.getByText('Région')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Remonter' })).toBeNull();
  });

  it('shows the drilled trail and a back button after drilling', () => {
    const store = newStore();
    store.drillDown('d', 'city');
    render(<DrillBreadcrumb store={store} {...base} />);
    expect(screen.getByText('Région')).toBeTruthy();
    expect(screen.getByText('Ville')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remonter' })).toBeTruthy();
  });

  it('back pops the drill path and clears the level filter', () => {
    const store = newStore();
    store.setFilter('region', { kind: 'include', values: ['Nord'] });
    store.drillDown('d', 'city');
    render(<DrillBreadcrumb store={store} {...base} />);
    act(() => {
      screen.getByRole('button', { name: 'Remonter' }).click();
    });
    expect(store.getState().drill.d ?? []).toEqual([]);
    expect(store.getState().filters.region).toBeUndefined();
  });
});
