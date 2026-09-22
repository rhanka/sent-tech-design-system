import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import ExportMenu, { rowsToCsv } from './ExportMenu.svelte';

describe('rowsToCsv', () => {
  const columns = [
    { key: 'country', label: 'Pays' },
    { key: 'sales', label: 'Ventes' },
  ];

  it('emits a header row then one row per record', () => {
    const csv = rowsToCsv(
      [
        { country: 'FR', sales: 10 },
        { country: 'US', sales: 20 },
      ],
      columns,
    );
    expect(csv).toBe('Pays,Ventes\nFR,10\nUS,20');
  });

  it('emits just the header for an empty dataset', () => {
    expect(rowsToCsv([], columns)).toBe('Pays,Ventes');
  });

  it('escapes commas, quotes and newlines', () => {
    const csv = rowsToCsv([{ country: 'A,B', sales: 'say "hi"' }] as unknown as Row[], columns);
    expect(csv).toBe('Pays,Ventes\n"A,B","say ""hi"""');
  });
});

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

describe('ExportMenu', () => {
  it('renders a labelled export button', () => {
    const store = createDashboardStore({ model, data: [] as Row[] });
    render(ExportMenu, { props: { store, label: 'Exporter (CSV)' } });
    expect(screen.getByRole('button', { name: 'Exporter (CSV)' })).toBeTruthy();
  });

  it('clicking the button does not throw (download is a no-op in jsdom)', () => {
    const store = createDashboardStore({ model, data: [{ country: 'FR', sales: 1 }] as Row[] });
    render(ExportMenu, { props: { store } });
    expect(() => screen.getByRole('button', { name: 'Exporter (CSV)' }).click()).not.toThrow();
  });
});
