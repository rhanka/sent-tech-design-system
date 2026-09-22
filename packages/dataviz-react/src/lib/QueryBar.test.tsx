import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { QueryBar } from './QueryBar.js';

const model: DataModel = {
  dimensions: [
    { id: 'service', label: 'Service', type: 'discrete' },
    { id: 'message', label: 'Message', type: 'discrete' },
  ],
  measures: [],
};

const rows: Row[] = [
  { service: 'checkout', message: 'payment accepted' },
  { service: 'billing', message: 'payment retried' },
  { service: 'auth', message: 'token refreshed' },
];

describe('QueryBar (react)', () => {
  it('binds a DS Search to an include filter over matching dimension values', () => {
    const store = createDashboardStore({ model, data: rows });
    render(<QueryBar store={store} dimension="service" fields={['message']} label="Search events" />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search events' }), { target: { value: 'payment' } });
    expect(store.getState().filters.service).toEqual({ kind: 'include', values: ['checkout', 'billing'] });

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search events' }), { target: { value: '' } });
    expect(store.getState().filters.service).toBeUndefined();
  });
});
