import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { QueryBar } from '../../dist/lib/QueryBar.js';

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

describe('QueryBar (angular)', () => {
  it('binds query changes to an include filter over matching dimension values', () => {
    const store = createDashboardStore({ model, data: rows });
    const component = new QueryBar();
    component.store = store;
    component.dimension = 'service';
    component.fields = ['message'];

    component.handleSearchValueChange('payment');
    expect(component.query()).toBe('payment');
    expect(store.getState().filters.service).toEqual({ kind: 'include', values: ['checkout', 'billing'] });

    component.handleClear();
    expect(component.query()).toBe('');
    expect(store.getState().filters.service).toBeUndefined();
  });
});
