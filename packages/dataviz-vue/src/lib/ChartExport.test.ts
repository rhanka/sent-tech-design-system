import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { createDashboardStore, type DataModel, type Row } from '@sentropic/dataviz-core';
import { ChartExport, DEFAULT_EXPORT_LABELS } from './ChartExport.js';

const model: DataModel = {
  dimensions: [{ id: 'country', label: 'Pays', type: 'discrete' }],
  measures: [{ id: 'sales', label: 'Ventes', aggregation: 'sum' }],
};

describe('ChartExport (vue)', () => {
  it('keeps default export labels locale-neutral', () => {
    expect(DEFAULT_EXPORT_LABELS.print).toBe('Print');
  });

  it('renders PNG / SVG / PDF / Print buttons by default', () => {
    const w = mount(ChartExport, { props: { target: '#nope' } });
    const text = w.text();
    expect(text).toContain(DEFAULT_EXPORT_LABELS.png);
    expect(text).toContain(DEFAULT_EXPORT_LABELS.svg);
    expect(text).toContain(DEFAULT_EXPORT_LABELS.pdf);
    expect(text).toContain(DEFAULT_EXPORT_LABELS.print);
    expect(w.findAll('button').length).toBe(4);
  });

  it('adds a CSV button when a store is provided', () => {
    const store = createDashboardStore({ model, data: [{ country: 'FR', sales: 1 }] as Row[] });
    const w = mount(ChartExport, { props: { store, target: '#nope' } });
    expect(w.text()).toContain(DEFAULT_EXPORT_LABELS.csv);
    expect(w.findAll('button').length).toBe(5);
  });

  it('honours an explicit formats list and custom labels', () => {
    const w = mount(ChartExport, {
      props: { target: '#nope', formats: ['svg'], labels: { svg: 'Vecteur' } },
    });
    expect(w.findAll('button').length).toBe(1);
    expect(w.text()).toContain('Vecteur');
    expect(w.text()).not.toContain(DEFAULT_EXPORT_LABELS.png);
  });

  it('clicking a button never throws (downloads are no-ops in jsdom)', async () => {
    const store = createDashboardStore({ model, data: [{ country: 'FR', sales: 1 }] as Row[] });
    const w = mount(ChartExport, { props: { store, target: '#nope' } });
    for (const btn of w.findAll('button')) {
      await btn.trigger('click');
    }
    expect(w.findAll('button').length).toBe(5);
  });
});
