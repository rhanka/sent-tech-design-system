import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ExportMenu, rowsToCsv } from './ExportMenu.js';

const columns = [
  { key: 'country', label: 'Pays' },
  { key: 'sales', label: 'Ventes' },
];

describe('rowsToCsv (react)', () => {
  it('emits a header then one row per record', () => {
    expect(rowsToCsv([{ country: 'FR', sales: 10 }] as Row[], columns)).toBe('Pays,Ventes\nFR,10');
  });
  it('escapes commas and quotes', () => {
    expect(rowsToCsv([{ country: 'A,B', sales: 'say "hi"' }] as unknown as Row[], columns)).toBe(
      'Pays,Ventes\n"A,B","say ""hi"""',
    );
  });
});

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

describe('ExportMenu (react)', () => {
  it('renders a labelled export button', () => {
    render(<ExportMenu store={createDashboardStore({ model, data: [] as Row[] })} label="Exporter (CSV)" />);
    expect(screen.getByRole('button', { name: 'Exporter (CSV)' })).toBeTruthy();
  });

  it('clicking the button does not throw', () => {
    const store = createDashboardStore({ model, data: [{ country: 'FR', sales: 1 }] as Row[] });
    render(<ExportMenu store={store} />);
    expect(() => screen.getByRole('button', { name: 'Exporter (CSV)' }).click()).not.toThrow();
  });
});
