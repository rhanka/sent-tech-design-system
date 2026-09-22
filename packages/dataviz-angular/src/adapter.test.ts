import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { createDashboard, toSignalStore } from '../dist/adapter.js';

const model: DataModel = {
  dimensions: [{ id: 'service', label: 'Service', type: 'discrete' }],
  measures: [],
};

const rows: Row[] = [
  { service: 'checkout' },
  { service: 'billing' },
];

describe('adapter (angular)', () => {
  it('mirrors core store updates into an Angular signal', () => {
    const store = createDashboardStore({ model, data: rows });
    const signals = toSignalStore(store);

    expect(signals.state().filters.service).toBeUndefined();
    store.setFilter('service', { kind: 'include', values: ['checkout'] });
    expect(signals.state().filters.service).toEqual({ kind: 'include', values: ['checkout'] });

    signals.destroy();
    store.clearFilter('service');
    expect(signals.state().filters.service).toEqual({ kind: 'include', values: ['checkout'] });
  });

  it('creates a dashboard store and signal bundle in one call', () => {
    const dashboard = createDashboard({ model, data: rows });

    expect(dashboard.store.getState()).toEqual(dashboard.state());

    dashboard.store.setFilter('service', { kind: 'include', values: ['billing'] });
    expect(dashboard.state().filters.service).toEqual({ kind: 'include', values: ['billing'] });

    dashboard.destroy();
  });
});
