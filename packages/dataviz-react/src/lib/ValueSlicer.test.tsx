import { render, screen, act } from '@testing-library/react';
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

describe('ValueSlicer (react)', () => {
  it('renders a checkbox per distinct value', () => {
    render(<ValueSlicer store={newStore()} dimension="country" />);
    expect(screen.getByRole('checkbox', { name: 'FR' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'US' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'DE' })).toBeTruthy();
  });

  it('sets an include filter when a value is checked', () => {
    const store = newStore();
    render(<ValueSlicer store={store} dimension="country" />);
    act(() => {
      (screen.getByRole('checkbox', { name: 'FR' }) as HTMLInputElement).click();
    });
    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['FR'] });
  });

  it('reflects an existing include filter as checked', () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['DE'] });
    render(<ValueSlicer store={store} dimension="country" />);
    expect((screen.getByRole('checkbox', { name: 'DE' }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole('checkbox', { name: 'FR' }) as HTMLInputElement).checked).toBe(false);
  });

  it('clears the filter when the last value is unchecked', () => {
    const store = newStore();
    store.setFilter('country', { kind: 'include', values: ['FR'] });
    render(<ValueSlicer store={store} dimension="country" />);
    act(() => {
      (screen.getByRole('checkbox', { name: 'FR' }) as HTMLInputElement).click();
    });
    expect(store.getState().filters.country).toBeUndefined();
  });
});
