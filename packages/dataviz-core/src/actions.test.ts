import { describe, it, expect, vi } from 'vitest';
import {
  applyDashboardBookmark,
  createDashboardStore,
  runDashboardAction,
  serializeState,
  type DashboardBookmark,
  type DashboardAction,
  type DataModel,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'age', label: 'Age', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

const newStore = () => createDashboardStore({ model, data: [] });

describe('dashboard actions', () => {
  it('applies set-filter and clear-filter actions', () => {
    const store = newStore();
    runDashboardAction(store, {
      kind: 'set-filter',
      dimensionId: 'country',
      spec: { kind: 'include', values: ['FR'] },
    });
    expect(store.getState().filters.country).toEqual({ kind: 'include', values: ['FR'] });

    runDashboardAction(store, { kind: 'clear-filter', dimensionId: 'country' });
    expect(store.getState().filters.country).toBeUndefined();
  });

  it('restores a complete encoded bookmark state', () => {
    const store = newStore();
    const encoded = serializeState({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { byCountry: ['FR'] },
      drill: { detail: ['country'] },
    });
    const bookmark: DashboardBookmark = { id: 'fr', label: 'France', encoded };

    applyDashboardBookmark(store, bookmark);

    expect(store.getState()).toEqual({
      filters: { country: { kind: 'include', values: ['FR'] } },
      selections: { byCountry: ['FR'] },
      drill: { detail: ['country'] },
    });
  });

  it('runs sequences and delegates URL actions to the runtime', () => {
    const store = newStore();
    const openUrl = vi.fn();
    const action: DashboardAction = {
      kind: 'sequence',
      actions: [
        {
          kind: 'set-filter',
          dimensionId: 'age',
          spec: { kind: 'range', min: 18 },
        },
        { kind: 'open-url', url: 'https://example.test/report', target: '_blank' },
      ],
    };

    runDashboardAction(store, action, { openUrl });

    expect(store.getState().filters.age).toEqual({ kind: 'range', min: 18 });
    expect(openUrl).toHaveBeenCalledWith('https://example.test/report', '_blank');
  });
});
