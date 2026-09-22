import { fireEvent, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import QueryBar from './QueryBar.svelte';

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

describe('QueryBar (svelte)', () => {
  it('binds a DS Search to an include filter over matching dimension values', async () => {
    const store = createDashboardStore({ model, data: rows });
    const { getByRole } = render(QueryBar, {
      props: { store, dimension: 'service', fields: ['message'], label: 'Search events' },
    });

    await fireEvent.input(getByRole('searchbox', { name: 'Search events' }), { target: { value: 'payment' } });
    expect(store.getState().filters.service).toEqual({ kind: 'include', values: ['checkout', 'billing'] });

    await fireEvent.input(getByRole('searchbox', { name: 'Search events' }), { target: { value: '' } });
    expect(store.getState().filters.service).toBeUndefined();
  });

  it('does not clear an existing filter on mount', async () => {
    const store = createDashboardStore({ model, data: rows });
    store.setFilter('service', { kind: 'include', values: ['auth'] });

    render(QueryBar, {
      props: { store, dimension: 'service', fields: ['message'], label: 'Search events' },
    });
    await tick();

    expect(store.getState().filters.service).toEqual({ kind: 'include', values: ['auth'] });
  });
});
