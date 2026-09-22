import { mount } from '@vue/test-utils';
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

describe('QueryBar (vue)', () => {
  it('binds a DS Search to an include filter over matching dimension values', async () => {
    const store = createDashboardStore({ model, data: rows });
    const w = mount(QueryBar, { props: { store, dimension: 'service', fields: ['message'], label: 'Search events' } });

    await w.find('input[type="search"]').setValue('payment');
    expect(store.getState().filters.service).toEqual({ kind: 'include', values: ['checkout', 'billing'] });

    await w.find('input[type="search"]').setValue('');
    expect(store.getState().filters.service).toBeUndefined();
  });
});
