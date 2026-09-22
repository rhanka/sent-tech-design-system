import { render, screen, act } from '@testing-library/react';
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
const bodyRows = (c: HTMLElement) => c.querySelectorAll('tbody tr').length;

describe('RecordsTable (react)', () => {
  it('renders a table with a column per model field', () => {
    const { container } = render(<RecordsTable store={newStore()} />);
    expect(container.querySelector('table')).toBeTruthy();
    expect(screen.getByText('Pays')).toBeTruthy();
    expect(screen.getByText('Ventes')).toBeTruthy();
  });

  it('renders one row per visible record', () => {
    const { container } = render(<RecordsTable store={newStore()} />);
    expect(bodyRows(container)).toBe(2);
    expect(screen.getByText('FR')).toBeTruthy();
    expect(screen.getByText('US')).toBeTruthy();
  });

  it('reflects the cross-filtered rows', () => {
    const store = newStore();
    const { container } = render(<RecordsTable store={store} />);
    expect(bodyRows(container)).toBe(2);
    act(() => {
      store.setFilter('country', { kind: 'include', values: ['FR'] });
    });
    expect(bodyRows(container)).toBe(1);
    expect(screen.queryByText('US')).toBeNull();
  });

  it('respects a fields subset/order', () => {
    render(<RecordsTable store={newStore()} fields={['sales']} />);
    expect(screen.getByText('Ventes')).toBeTruthy();
    expect(screen.queryByText('Pays')).toBeNull();
  });
});
