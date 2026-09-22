import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ChartExport, DEFAULT_EXPORT_LABELS } from './ChartExport.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

describe('ChartExport (react)', () => {
  it('keeps default export labels locale-neutral', () => {
    expect(DEFAULT_EXPORT_LABELS.print).toBe('Print');
  });

  it('renders PNG / SVG / PDF / Print buttons by default', () => {
    render(<ChartExport target="#nope" />);
    expect(screen.getByRole('button', { name: DEFAULT_EXPORT_LABELS.png })).toBeTruthy();
    expect(screen.getByRole('button', { name: DEFAULT_EXPORT_LABELS.svg })).toBeTruthy();
    expect(screen.getByRole('button', { name: DEFAULT_EXPORT_LABELS.pdf })).toBeTruthy();
    expect(screen.getByRole('button', { name: DEFAULT_EXPORT_LABELS.print })).toBeTruthy();
  });

  it('adds a CSV button when a store is provided', () => {
    const store = createDashboardStore({ model, data: [{ country: 'FR', sales: 1 }] as Row[] });
    render(<ChartExport store={store} target="#nope" />);
    expect(screen.getByRole('button', { name: DEFAULT_EXPORT_LABELS.csv })).toBeTruthy();
  });

  it('honours an explicit formats list and custom labels', () => {
    render(<ChartExport target="#nope" formats={['svg']} labels={{ svg: 'Vecteur' }} />);
    expect(screen.getByRole('button', { name: 'Vecteur' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: DEFAULT_EXPORT_LABELS.png })).toBeNull();
  });

  it('clicking a button never throws (downloads are no-ops in jsdom)', () => {
    const store = createDashboardStore({ model, data: [{ country: 'FR', sales: 1 }] as Row[] });
    render(<ChartExport store={store} target="#nope" />);
    for (const f of ['png', 'svg', 'pdf', 'print', 'csv'] as const) {
      expect(() =>
        screen.getByRole('button', { name: DEFAULT_EXPORT_LABELS[f] }).click(),
      ).not.toThrow();
    }
  });
});
