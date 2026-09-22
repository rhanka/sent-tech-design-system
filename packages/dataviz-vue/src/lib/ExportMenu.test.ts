import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ExportMenu, rowsToCsv } from './ExportMenu.js';

const columns = [
  { key: 'country', label: 'Pays' },
  { key: 'sales', label: 'Ventes' },
];

describe('rowsToCsv (vue)', () => {
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

describe('ExportMenu (vue)', () => {
  it('renders a labelled export button', () => {
    const w = mount(ExportMenu, {
      props: { store: createDashboardStore({ model, data: [] as Row[] }), label: 'Exporter (CSV)' },
    });
    expect(w.text()).toContain('Exporter (CSV)');
  });

  it('clicking the button does not throw', async () => {
    const store = createDashboardStore({ model, data: [{ country: 'FR', sales: 1 }] as Row[] });
    const w = mount(ExportMenu, { props: { store } });
    await w.find('button').trigger('click');
    expect(w.find('button').exists()).toBe(true);
  });
});
