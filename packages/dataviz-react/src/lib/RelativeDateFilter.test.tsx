import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import {
  RelativeDateFilter,
  relativeRangeToSpec,
  DEFAULT_RELATIVE_PRESETS,
} from './RelativeDateFilter.js';

const NOW = new Date('2026-06-06T00:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

describe('relativeRangeToSpec (react)', () => {
  it('maps a trailing window to epoch-ms bounds ending now', () => {
    expect(relativeRangeToSpec(30, NOW)).toEqual({
      kind: 'range',
      min: NOW.getTime() - 30 * DAY,
      max: NOW.getTime(),
    });
  });
  it('returns null for the "all" preset (null days)', () => {
    expect(relativeRangeToSpec(null, NOW)).toBeNull();
  });
  it('exposes default presets starting with "all"', () => {
    expect(DEFAULT_RELATIVE_PRESETS[0]).toEqual({ value: 'all', label: 'Tout', days: null });
  });
});

const model: DataModel = {
  dimensions: [{ id: 'date', label: 'Date', type: 'continuous' }],
  measures: [{ id: 'v', label: 'V', aggregation: 'sum' }],
};

describe('RelativeDateFilter (react)', () => {
  it('renders a labelled select and does not filter for the default "all" preset', () => {
    const store = createDashboardStore({ model, data: [] as Row[] });
    render(<RelativeDateFilter store={store} dimension="date" label="Période" now={NOW} />);
    expect(screen.getByText('Période')).toBeTruthy();
    expect(store.getState().filters.date).toBeUndefined();
  });

  it('applies a trailing-window range filter for a non-"all" initial preset', () => {
    const store = createDashboardStore({ model, data: [] as Row[] });
    render(
      <RelativeDateFilter
        store={store}
        dimension="date"
        now={NOW}
        presets={[{ value: '30d', label: '30 j', days: 30 }]}
      />,
    );
    expect(store.getState().filters.date).toEqual({
      kind: 'range',
      min: NOW.getTime() - 30 * DAY,
      max: NOW.getTime(),
    });
  });
});
